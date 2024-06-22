import { Connection, Keypair, VersionedTransaction } from '@solana/web3.js';
import fetch from 'cross-fetch';
import { Wallet } from '@project-serum/anchor';
import bs58 from 'bs58';
import "dotenv/config.js";
import promptSync from 'prompt-sync';
import {buyFunc, sellFunc} from './buysellfunctions.js';
import { token } from '@project-serum/anchor/dist/cjs/utils/index.js';

const prompt = promptSync();
const PRIVATE_KEY = prompt('Enter Wallet Private Key:  ')
const connection = new Connection(process.env.RPC_ENDPOINT);

const wallet = new Wallet(Keypair.fromSecretKey(bs58.decode(PRIVATE_KEY || '')));
// Address for token you want to trade
const toke = prompt('ENTER TOKEN ADDRESS:  ')

let nums = []
let smaArray = []
let EMA
let EMA3
let emaArray =[]
let SMA
let prevEMA
//Enter your EMA estimate
let prevEMA2 = prompt('Enter your EMA estimate:  ')
prevEMA2 = Number(prevEMA2)
let prevSMA
//Enter your SMA estimate
let estSMA = prompt('Enter your SMA estimate:  ')
estSMA = Number(estSMA)
//Enter your EMA SPAN
let emaSpan = prompt('Enter your EMA SPAN:  ')
emaSpan = Number(emaSpan)
//Enter your SMA span
let smaSpan = prompt('Enter your SMA SPAN:  ')
smaSpan= Number(smaSpan)
//Enter the frequency to check (minutes)
let chekfreq = prompt('Enter the frequency to check (minutes):  ')
chekfreq = Number(chekfreq)
//Enter length of interval (minutes)
let intLength = prompt('Enter length of interval (minutes):  ')
intLength = Number(intLength)
//Enter Quantity of token to buy (USD)

let amount = prompt('Enter Quantity of token to buy (USD). If you would like to use entire balance press ENTER:  ')
amount = Number(amount)
const amountConverted = amount*1000000



function EMACalc3(previEMA, price, mRange) {
    let k = 2/(mRange + 1);
    // console.log('THIS IS MRANGE', mRange)
    // console.log('THIS IS K', k)
    // first item is just the same as the first item in the input
    const ema = price * k + previEMA * (1 - k);
    // console.log('CALCULATE', ema)
    //console.log('this is our OTHER ema array', emaArray);
    return ema;
    }

// function SMACalc (mArray,mRange) {
//     if (mArray.length>mRange) {
//         //console.log('BOOP')
//         mArray=mArray.slice(mArray.length-(mRange+1), mArray.length-1);
//         }
//     //console.log('here is new sma nums', mArray)
//     let sum = mArray.reduce((pv, cv) => pv + cv, 0);
//     let sma = sum/mArray.length
//     smaArray.push(sma)
//     //console.log('this is sma', sma)
//     console.log('this is sma array', smaArray)
//     return smaArray
//     }

function SMACalc (mArray,mRange,price) {
    let workbook = mArray.concat(price)
    let workbook2 = workbook
    console.log('Here is the first workbook', workbook2)
    if (workbook.length>mRange) {
        //console.log('BOOP')
        workbook=workbook.slice(workbook.length-(mRange+1), workbook.length-1);
        workbook2 = workbook
        }
    if (workbook.length<mRange) {
        const diff = mRange-workbook.length
        //console.log('DIFF', diff)
        for (let i=1; i <= diff; i++){
            workbook2 = [workbook[0]].concat(workbook2)
            //console.log('ding', i)
        }
    }
    console.log('This is the workbook', workbook2)
    //console.log('here is new sma nums', mArray)
    let sum = workbook2.reduce((pv, cv) => pv + cv, 0);
    console.log('Here is the sum', sum)
    let sma = sum/workbook2.length
    smaArray.push(sma)
    //console.log('this is sma', sma)
    //console.log('this is sma array', smaArray)
    return smaArray
    }

const options = {method: 'GET'};


async function cryptic(tokenAddress) {
    const response = await fetch("https://price.jup.ag/v4/price?ids="+tokenAddress+"");
    const jsonResp = await response.json();
    const tokprice = jsonResp.data[tokenAddress].price
    console.log('\n','\n','\n', "CURRENT PRICE:  ", tokprice);
    console.log(new Date().toLocaleTimeString())
    if (EMA) {
        prevEMA=EMA
    }
    if (SMA) {
        prevSMA=SMA
    }
    EMA3 = EMACalc3(prevEMA2, tokprice, emaSpan)
    EMA = EMA3
    let SMAarray = SMACalc(nums, smaSpan, tokprice)
    console.log('SMA array', SMAarray)
    SMA = SMAarray[SMAarray.length-1]
    console.log("Our previous EMA", prevEMA)
    console.log("Our new EMA", EMA)
    console.log("Our previous SMA", prevSMA)
    console.log("Our SMA", SMA)
    console.log("This is ema array",emaArray)
    if (EMA>SMA && prevEMA<prevSMA) {
        console.log('\n',"BUY!!!")
        buyFunc(tokenAddress, amountConverted, wallet)
    }
    if (EMA<SMA && prevEMA>prevSMA) {
        console.log('\n',"SELL!!!")
        sellFunc(tokenAddress, wallet)
    }
  }
async function cryptic2(tokenAddress) {
    const response = await fetch("https://price.jup.ag/v4/price?ids="+tokenAddress+"");
    const jsonResp = await response.json();
    const tokprice = jsonResp.data[tokenAddress].price
    console.log('\n','\n','\n', "LONG CURRENT PRICE:  ", tokprice);
    console.log(new Date().toLocaleTimeString())
    //calculate EMA
    EMA3 = EMACalc3(prevEMA2, tokprice, emaSpan)
    //Set previous candle EMA
    console.log('here is prevEMA2', prevEMA2)
    prevEMA2 = EMA3
    EMA = EMA3
    emaArray.push(EMA)
    console.log("This is ema array",emaArray)
    //push price for SMA
    nums.push(tokprice)
}

nums.push(estSMA)
console.log(amountConverted)
cryptic2(toke)

function callitbackshort() {
    //console.log('\n','HERE WE GO')
    cryptic(toke)
    
    }
function callitbacklong() {
    //console.log('\n','HERE WE GO')
    cryptic2(toke)
    
    }
const intervalID = setInterval(callitbackshort, (chekfreq*60000))
const interval2ID = setInterval(callitbacklong, (intLength*60000))