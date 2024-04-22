import * as anchor from "@coral-xyz/anchor";
import { MPL_BUBBLEGUM_PROGRAM_ID} from "@metaplex-foundation/mpl-bubblegum";
import {SPL_ACCOUNT_COMPRESSION_PROGRAM_ID, SPL_NOOP_PROGRAM_ID} from "@solana/spl-account-compression";
import {PublicKey} from "@solana/web3.js";
import { BbNft } from "../../target/types/bb_nft";


export async function createCNFTIx(
    program: anchor.Program<BbNft>,
    treeConfig: anchor.web3.PublicKey,
    merkleTree: anchor.web3.PublicKey,
    payer: anchor.web3.PublicKey,
    treeOwner: anchor.web3.PublicKey
): Promise<anchor.web3.TransactionInstruction>  {

    return await program.methods.mintCnft("Kick House", "KH", "some-random-url")
        .accounts({
            signer: payer,
            treeConfig,
            merkleTree,
            treeOwner,
            logWrapper: SPL_NOOP_PROGRAM_ID,
            compressionProgram: SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
            mplBubblegumProgram: new PublicKey(MPL_BUBBLEGUM_PROGRAM_ID),
            systemProgram: anchor.web3.SystemProgram.programId
        }).instruction()
}