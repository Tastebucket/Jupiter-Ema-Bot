import { Connection, Keypair, VersionedTransaction } from '@solana/web3.js';
import fetch from 'cross-fetch';
import { Wallet } from '@project-serum/anchor';
import bs58 from 'bs58';
import "dotenv/config.js";
import {buyFunc, sellFunc} from './jupiter-api-example.js'
import { token } from '@project-serum/anchor/dist/cjs/utils/index.js';

const connection = new Connection('https://prettiest-powerful-knowledge.solana-mainnet.quiknode.pro/f9838ad5bfc749855517220411e502d617e721a5/');

const wallet = new Wallet(Keypair.fromSecretKey(bs58.decode(process.env.PRIVATE_KEY || '')));
// Address for token you want to trade
const toke = 'Fch1oixTPri8zxBnmdCEADoJW2toyFHxqDZacQkwdvSP'

function EMACalc3(previEMA, price, mRange) {
    let k = 2/(mRange + 1);
    // first item is just the same as the first item in the input
    const ema = price * k + previEMA * (1 - k);
    //console.log('this is our OTHER ema array', emaArray);
    return ema;
    }
let nums = []
let smaArray = []
let EMA
let EMA3
let emaArray =[]
let SMA
let prevEMA
//Enter your EMA estimate
let prevEMA2 = 0.012
let prevSMA
//Enter your EMA SPAN
const emaSpan = 8
//Enter your SMA span
const smaSpan = 10
//Enter the frequency to check (minutes)
const chekfreq = .25
//Enter length of interval (minutes)
const intLength = 15
//Enter Quantity of token to buy (USD)
const amount = .1
const amountConverted = amount*1000000

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
    } else {
        workbook2=workbook
    }
    console.log('This is the workbook', workbook2)
    //console.log('here is new sma nums', mArray)
    let sum = workbook2.reduce((pv, cv) => pv + cv, 0);
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
    SMA = SMAarray[SMAarray.length-1]
    console.log("Our previous EMA", prevEMA)
    console.log("Our new EMA", EMA)
    console.log("Our previous SMA", prevSMA)
    console.log("Our SMA", SMA)
    console.log("This is ema array",emaArray)
    if (EMA>SMA && prevEMA<prevSMA) {
        console.log('\n',"BUY!!!")
        buyFunc(tokenAddress, amountConverted)
    }
    if (EMA<SMA && prevEMA>prevSMA) {
        console.log('\n',"SELL!!!")
        sellFunc(tokenAddress)
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
    prevEMA2 = EMA3
    EMA = EMA3
    emaArray.push(EMA)
    console.log("This is ema array",emaArray)
    //push price for SMA
    nums.push(tokprice)
}

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