import { Connection, Keypair, VersionedTransaction } from '@solana/web3.js';
import fetch from 'cross-fetch';
import { Wallet } from '@project-serum/anchor';
import bs58 from 'bs58';
import "dotenv/config.js";

// // It is recommended that you use your own RPC endpoint.
// // This RPC endpoint is only for demonstration purposes so that this example will run.
const connection = new Connection('https://prettiest-powerful-knowledge.solana-mainnet.quiknode.pro/f9838ad5bfc749855517220411e502d617e721a5/');

const wallet = new Wallet(Keypair.fromSecretKey(bs58.decode(process.env.PRIVATE_KEY || '')));

// Swapping SOL to USDC with input 0.1 SOL and 0.5% slippage
export async function buyFunc (tokenAddress, amount) {

  const quoteResponse = await (
      await fetch('https://quote-api.jup.ag/v6/quote?inputMint=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v\&outputMint='+tokenAddress+'\&amount='+amount+'\&slippageBps=100')
    ).json();
    console.log({ quoteResponse })

  // get serialized transactions for the swap
  const { swapTransaction } = await (
      await fetch('https://quote-api.jup.ag/v6/swap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          // quoteResponse from /quote api
          quoteResponse,
          // user public key to be used for the swap
          userPublicKey: wallet.publicKey.toString(),
          // auto wrap and unwrap SOL. default is true
          wrapAndUnwrapSol: true,
          // feeAccount is optional. Use if you want to charge a fee.  feeBps must have been passed in /quote API.
          // feeAccount: "fee_account_public_key"
          prioritizationFeeLamports: 'auto',
          dynamicComputeUnitLimit: true,
        })
      })
    ).json();

  // deserialize the transaction
  const swapTransactionBuf = Buffer.from(swapTransaction, 'base64');
  var transaction = VersionedTransaction.deserialize(swapTransactionBuf);
  //console.log(transaction);

  transaction.sign([wallet.payer]);

  // // Execute the transaction
  // const rawTransaction = transaction.serialize()
  // const txid = await connection.sendRawTransaction(rawTransaction, {
  //   skipPreflight: true,
  //   maxRetries: 5
  // });
  // await connection.confirmTransaction(txid);
  // console.log(`https://solscan.io/tx/${txid}`);
  var tryAgain=true;
  var objSignatureStatusResult;
  var maxTriesCounter=0; 
  var maxTries=10; 

  while (tryAgain) {
    maxTriesCounter++;
    const rawTransaction = transaction.serialize()
    const txid = await connection.sendRawTransaction(rawTransaction, {
      skipPreflight: true,
      maxRetries: 2
    });

    console.log(`https://solscan.io/tx/${txid}`);
    await new Promise(r => setTimeout(r, 1500));

    const result = await connection.getSignatureStatus(txid, {
      searchTransactionHistory: true,
      });
    objSignatureStatusResult = JSON.parse(JSON.stringify(result));
    if ( objSignatureStatusResult.value !== null) tryAgain=false;
    if (maxTriesCounter>maxTries) tryAgain=false;
    console.log(result)
  }
}

export async function sellFunc (tokenAddress) {
    const mintAccount = new web3.PublicKey(
      tokenAddress
    );
    const bally = await connection.getParsedTokenAccountsByOwner(wallet.publicKey, {
      mint: mintAccount,
    })
    const sellAmount = bally.value[0].account.data.parsed.info.tokenAmount.amount
    console.log(bally.value[0].account.data.parsed.info.tokenAmount.amount)
  
    const quoteResponse = await (
      await fetch('https://quote-api.jup.ag/v6/quote?inputMint='+tokenAddress+'\&outputMint=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v\&amount='+sellAmount+'\&slippageBps=100')
    ).json();
    console.log({ quoteResponse })

    // get serialized transactions for the swap
    const { swapTransaction } = await (
        await fetch('https://quote-api.jup.ag/v6/swap', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            // quoteResponse from /quote api
            quoteResponse,
            // user public key to be used for the swap
            userPublicKey: wallet.publicKey.toString(),
            // auto wrap and unwrap SOL. default is true
            wrapAndUnwrapSol: true,
            // feeAccount is optional. Use if you want to charge a fee.  feeBps must have been passed in /quote API.
            // feeAccount: "fee_account_public_key"
            prioritizationFeeLamports: 'auto',
            dynamicComputeUnitLimit: true,
          })
        })
      ).json();

    // deserialize the transaction
    const swapTransactionBuf = Buffer.from(swapTransaction, 'base64');
    var transaction = VersionedTransaction.deserialize(swapTransactionBuf);
    //console.log(transaction);

    transaction.sign([wallet.payer]);

    // // Execute the transaction
    // const rawTransaction = transaction.serialize()
    // const txid = await connection.sendRawTransaction(rawTransaction, {
    //   skipPreflight: true,
    //   maxRetries: 5
    // });
    // await connection.confirmTransaction(txid);
    // console.log(`https://solscan.io/tx/${txid}`);
    var tryAgain=true;
    var objSignatureStatusResult;
    var maxTriesCounter=0; 
    var maxTries=10; 

    while (tryAgain) {
      maxTriesCounter++;
      const rawTransaction = transaction.serialize()
      const txid = await connection.sendRawTransaction(rawTransaction, {
        skipPreflight: true,
        maxRetries: 2
      });

      console.log(`https://solscan.io/tx/${txid}`);
      await new Promise(r => setTimeout(r, 1500));

      const result = await connection.getSignatureStatus(txid, {
        searchTransactionHistory: true,
        });
      objSignatureStatusResult = JSON.parse(JSON.stringify(result));
      if ( objSignatureStatusResult.value !== null) tryAgain=false;
      if (maxTriesCounter>maxTries) tryAgain=false;
      console.log(result)
    }
}
import web3 from "@solana/web3.js";
// (async () => {
//   const solana = new web3.Connection("https://prettiest-powerful-knowledge.solana-mainnet.quiknode.pro/f9838ad5bfc749855517220411e502d617e721a5/");
//   const trans = 
//     await solana.getTransaction(
//       "2ejihaFPm7mmtRGm1waWB1KdwPVVQokPSACUjrnHMf1vLKFRbvHhMeEHDtHkWgDAyYHaj4NHWZdRdkFy4ShdRKk4",
//       { maxSupportedTransactionVersion: 0 }
//   );
//   trans.meta.preTokenBalances.forEach(element => {
//     if (element.owner==wallet.publicKey.toString() && element.mint==
//   });
//   console.log("PRETOKEN", '\n',trans.meta.preTokenBalances)
//   console.log("POSTOKEN", '\n',trans.meta.postTokenBalances)
// })();



// const mintAccount = new web3.PublicKey(
//   'Fch1oixTPri8zxBnmdCEADoJW2toyFHxqDZacQkwdvSP'
// );
// const bally = await connection.getParsedTokenAccountsByOwner(wallet.publicKey, {
//     mint: mintAccount,
//   })
  
//   console.log(bally.value[0].account.data.parsed.info.tokenAmount.amount)

// const ball = await connection.getBalance(bally.value.pubKey)

// console.log(ball)

