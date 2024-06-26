import { Connection, Keypair, VersionedTransaction } from '@solana/web3.js';
import fetch from 'cross-fetch';
import { Wallet } from '@project-serum/anchor';
import bs58 from 'bs58';
import "dotenv/config.js";


const connection = new Connection(process.env.RPC_ENDPOINT);



// Swapping SOL to USDC with input 0.1 SOL and 0.5% slippage
export async function buyFunc (tokenAddress, amount, wallet) {
  if (!amount) {
    const mintAccount = new web3.PublicKey(
      'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
    );
    const bally = await connection.getParsedTokenAccountsByOwner(wallet.publicKey, {
      mint: mintAccount,
    })
    amount = bally.value[0].account.data.parsed.info.tokenAmount.amount
  }
  if (amount){
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
}

export async function sellFunc (tokenAddress, wallet) {
    const mintAccount = new web3.PublicKey(
      tokenAddress
    );
    const bally = await connection.getParsedTokenAccountsByOwner(wallet.publicKey, {
      mint: mintAccount,
    })
    if (bally.value[0]) {
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
}
import web3 from "@solana/web3.js";
