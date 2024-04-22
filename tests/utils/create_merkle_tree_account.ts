import * as anchor from "@coral-xyz/anchor";
import {Keypair, SystemProgram, Transaction} from "@solana/web3.js";
import {
    getConcurrentMerkleTreeAccountSize,
    SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
    ValidDepthSizePair
} from "@solana/spl-account-compression";

export async function createMerkleTreeAccount(
    provider: anchor.AnchorProvider,
    merkleTreeKeypair: Keypair,
    depthSizePair: ValidDepthSizePair
) {

    const merkleTree = merkleTreeKeypair.publicKey;

    const space = getConcurrentMerkleTreeAccountSize(
        depthSizePair.maxDepth,
        depthSizePair.maxBufferSize
    );
    //Create the account for merkle tree
    const allocTreeIx = SystemProgram.createAccount({
        fromPubkey: provider.wallet.publicKey,
        newAccountPubkey: merkleTree,
        lamports: await provider.connection.getMinimumBalanceForRentExemption(space),
        space,
        programId: SPL_ACCOUNT_COMPRESSION_PROGRAM_ID
    })

    const tx = new Transaction().add(allocTreeIx);
    return await provider.sendAndConfirm(
        tx,
        [merkleTreeKeypair],
        {
            commitment: "confirmed",
            skipPreflight: true
        }
    )
}