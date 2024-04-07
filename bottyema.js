import { Connection, Keypair, VersionedTransaction } from '@solana/web3.js';
import fetch from 'cross-fetch';
import { Wallet } from '@project-serum/anchor';
import bs58 from 'bs58';
import "dotenv/config.js";
import {buyFunc, sellFunc} from './jupiter-api-example.js'
import { token } from '@project-serum/anchor/dist/cjs/utils/index.js';

const connection = new Connection('https://prettiest-powerful-knowledge.solana-mainnet.quiknode.pro/f9838ad5bfc749855517220411e502d617e721a5/');

const wallet = new Wallet(Keypair.fromSecretKey(bs58.decode(process.env.PRIVATE_KEY || '')));

const toke = 'Fch1oixTPri8zxBnmdCEADoJW2toyFHxqDZacQkwdvSP'
// function EMACalc(mArray,mRange) {
//     let k = 2/(mRange + 1);
//     // first item is just the same as the first item in the input
//     let emaArray
//     emaArray = [mArray[0]];
//     // for the rest of the items, they are computed with the previous one
//     for (let i = 1; i < mArray.length; i++) {
//       emaArray.push(mArray[i] * k + emaArray[i - 1] * (1 - k));
//     }
//     //console.log('this is ema array', emaArray);
//     return emaArray;
//   }
// function EMACalc2(estEma,mArray, mRange) {
//     let k = 2/(mRange + 1);
//     // first item is just the same as the first item in the input
//     let emaArray
//     emaArray = [estEma];
//     // for the rest of the items, they are computed with the previous one
//     for (let i = 1; i < mArray.length; i++) {
//         emaArray.push(mArray[i] * k + emaArray[i - 1] * (1 - k));
//     }
//     //console.log('this is our OTHER ema array', emaArray);
//     return emaArray;
//     }
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
let prevEMA2 = 0.012
let prevSMA
const emaSpan = 8
const smaSpan = 10


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
    console.log("DINGALING")
    const response = await fetch("https://price.jup.ag/v4/price?ids="+tokenAddress+"");
    const movies = await response.json();
    //console.log(movies.data)
    const tokprice = movies.data[tokenAddress].price
    console.log('\n','\n','\n', "CURRENT PRICE:  ", tokprice);
    console.log(new Date().toLocaleTimeString())
    
    //console.log('here is nums array', nums)
    if (EMA) {
        prevEMA=EMA
    }
    if (SMA) {
        prevSMA=SMA
    }
    //let EMAarray = EMACalc(nums, emaSpan)
    //let EMA2array = EMACalc2 (.024, nums, emaSpan)
    EMA3 = EMACalc3(prevEMA2, tokprice, emaSpan)
    EMA = EMA3
    //EMA = EMAarray[EMAarray.length-1]
    //EMAOther = EMA2array[EMA2array.length-1]
    //console.log('This is the ema', EMA)
    let SMAarray = SMACalc(nums, smaSpan, tokprice)
    SMA = SMAarray[SMAarray.length-1]
    console.log("Our previous EMA", prevEMA)
    console.log("Our new EMA", EMA)
    console.log("Our previous SMA", prevSMA)
    console.log("Our SMA", SMA)
    console.log("This is ema array",emaArray)
    if (EMA>SMA && prevEMA<prevSMA) {
        console.log('\n',"BUY!!!")
        // buyFunc(tokenAddress)
    }
    if (EMA<SMA && prevEMA>prevSMA) {
        console.log('\n',"SELL!!!")
        // sellFunc(tokenAddress)
    }
  }
async function cryptic2(tokenAddress) {
    const response = await fetch("https://price.jup.ag/v4/price?ids="+tokenAddress+"");
    const movies = await response.json();
    //console.log(movies.data)
    const tokprice = movies.data[tokenAddress].price
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
const intervalID = setInterval(callitbackshort, 10000)
const interval2ID = setInterval(callitbacklong, 30000)