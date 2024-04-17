import * as anchor from "@coral-xyz/anchor";
import {PublicKey} from "@solana/web3.js";
import { BbNft } from "../../target/types/bb_nft";

export function findFaucetPda(program: anchor.Program<BbNft>, authority: PublicKey) {
    let [faucetPda] = PublicKey.findProgramAddressSync([authority.toBuffer()], program.programId)
    return faucetPda
}