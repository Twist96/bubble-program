import * as anchor from "@coral-xyz/anchor";
import { BbNft } from "../../target/types/bb_nft";
import {MPL_BUBBLEGUM_PROGRAM_ID} from "@metaplex-foundation/mpl-bubblegum";
import {
    SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
    SPL_NOOP_PROGRAM_ID,
    ValidDepthSizePair
} from "@solana/spl-account-compression";

const depthSizePair: ValidDepthSizePair = {
    maxDepth: 3,
    maxBufferSize: 8,
};

export function createTreeIx(
    program: anchor.Program<BbNft>,
    treeConfig: anchor.web3.PublicKey,
    merkleTree: anchor.web3.PublicKey,
    payer: anchor.web3.PublicKey,
    treeOwner: anchor.web3.PublicKey
): Promise<anchor.web3.TransactionInstruction>  {
    return  program.methods.createTree(depthSizePair.maxDepth, depthSizePair.maxBufferSize)
        .accounts({
            signer: payer,
            treeConfig,
            merkleTree,
            treeOwner: treeOwner,
            mplBubblegumProgram: MPL_BUBBLEGUM_PROGRAM_ID,
            logWrapper: SPL_NOOP_PROGRAM_ID,
            compressionProgram: SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
        })
        .instruction()
}