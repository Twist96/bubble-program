import * as anchor from "@coral-xyz/anchor";
import { BbNft } from "../../target/types/bb_nft";

// export async function createFaucetIx(program: anchor.Program<BbNft>, payer: anchor.Wallet, faucetPda: anchor.web3.PublicKey): Promise<anchor.web3.TransactionInstruction> {
//     return await program.methods.createFaucet()
//         .accounts({
//             payer: payer.publicKey,
//             faucet: faucetPda,
//             systemProgram: anchor.web3.SystemProgram.programId
//         }).instruction()
// }