import { Connection, Keypair, VersionedTransaction } from '@solana/web3.js';
import fetch from 'cross-fetch';
import { Wallet } from '@project-serum/anchor';
import bs58 from 'bs58';
import "dotenv/config.js";
import {buyFunc} from './jupiter-api-example.js'

const connection = new Connection('https://prettiest-powerful-knowledge.solana-mainnet.quiknode.pro/f9838ad5bfc749855517220411e502d617e721a5/');

const wallet = new Wallet(Keypair.fromSecretKey(bs58.decode(process.env.PRIVATE_KEY || '')));


function EMACalc(mArray,mRange) {
    let k = 2/(mRange + 1);
    // first item is just the same as the first item in the input
    let emaArray
    emaArray = [mArray[0]];
    // for the rest of the items, they are computed with the previous one
    for (let i = 1; i < mArray.length; i++) {
      emaArray.push(mArray[i] * k + emaArray[i - 1] * (1 - k));
    }
    console.log('this is ema array', emaArray);
    return emaArray;
  }

let nums = []
let smaArray = []
let EMA
let SMA
let prevEMA
let prevSMA
const emaSpan = 8
const smaSpan = 4

function SMACalc (mArray,mRange) {
    if (mArray.length>mRange) {
        //console.log('BOOP')
        mArray=mArray.slice(mArray.length-(mRange+1), mArray.length-1);
        }
    //console.log('here is new sma nums', mArray)
    let sum = mArray.reduce((pv, cv) => pv + cv, 0);
    let sma = sum/mArray.length
    smaArray.push(sma)
    //console.log('this is sma', sma)
    console.log('this is sma array', smaArray)
    return smaArray
    }

const options = {method: 'GET'};


async function cryptic() {
    const response = await fetch("https://price.jup.ag/v4/price?ids=3psH1Mj1f7yUfaD5gh6Zj7epE8hhrMkMETgv5TshQA4o");
    const movies = await response.json();
    //console.log(movies.data)
    const tokprice = movies.data['3psH1Mj1f7yUfaD5gh6Zj7epE8hhrMkMETgv5TshQA4o'].price
    console.log('\n','\n','\n', "CURRENT PRICE:  ", tokprice);
    console.log(new Date().toLocaleTimeString())
    
    nums.push(tokprice)
    console.log('here is nums array', nums)
    if (EMA) {
        prevEMA=EMA
    }
    if (SMA) {
        prevSMA=SMA
    }
    let EMAarray = EMACalc(nums, emaSpan)
    EMA = EMAarray[EMAarray.length-1]
    //console.log('This is the ema', EMA)
    let SMAarray = SMACalc(nums, smaSpan)
    SMA = SMAarray[SMAarray.length-1]
    console.log("Our previous EMA", prevEMA)
    console.log("Our new EMA", EMA)
    console.log("Our previous SMA", prevSMA)
    console.log("Our SMA", SMA)
    if (EMA>SMA && prevEMA<prevSMA) {
        console.log('\n',"BUY!!!")
        buyFunc()
    }
    if (EMA<SMA && prevEMA>prevSMA) {
        console.log('\n',"SELL!!!")
    }
  }

function callitback() {
    //console.log('\n','HERE WE GO')
    cryptic()
    
    }

const intervalID = setInterval(callitback, 6000)