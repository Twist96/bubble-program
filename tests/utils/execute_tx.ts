import {ComputeBudgetProgram, Connection, Keypair, sendAndConfirmTransaction, Transaction} from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";

export const executeTx = async (keypair: Keypair, ixs:  anchor.web3.TransactionInstruction[], connection: Connection, extraSigner = null, finalized = false, skipPreflight = false) => {
    const tx = new Transaction();
    const modifyComputeUnits = ComputeBudgetProgram.setComputeUnitLimit({
        units: 1000000
    });
    tx.add(modifyComputeUnits);
    ixs.forEach(ix => tx.add(ix) );
    const { blockhash } = await connection.getLatestBlockhash();
    tx.recentBlockhash = blockhash;
    tx.feePayer = keypair.publicKey;
    const signers = [keypair];
    if (extraSigner) {
        signers.push(extraSigner);
    }
    console.log("++ ABOUT TO SIGN as ", keypair.publicKey.toString());
    const sig = await sendAndConfirmTransaction(connection, tx, signers, {
        commitment: finalized ? 'finalized' : 'confirmed',
        skipPreflight
    });
    console.log({sig});
    return sig;
}