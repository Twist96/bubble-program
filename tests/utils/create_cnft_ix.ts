import * as anchor from "@coral-xyz/anchor";
import {createUmi} from "@metaplex-foundation/umi-bundle-defaults";
import {findTreeConfigPda, MPL_BUBBLEGUM_PROGRAM_ID} from "@metaplex-foundation/mpl-bubblegum";
import {SPL_ACCOUNT_COMPRESSION_PROGRAM_ID, SPL_NOOP_PROGRAM_ID} from "@solana/spl-account-compression";
import {PublicKey} from "@solana/web3.js";
import { BbNft } from "../../target/types/bb_nft";


export async function createCNFTIx(program: anchor.Program<BbNft>, payer: anchor.Wallet, faucetPda: anchor.web3.PublicKey): Promise<anchor.web3.TransactionInstruction>  {
    const faucetAccount = await program.account.faucet.fetch(faucetPda)
    const umi = createUmi("http://127.0.0.1:8899")
    // @ts-ignore
    const [treeConfig] = findTreeConfigPda(umi, {merkleTree: faucetAccount.merkelTree})

    console.log({
        faucetAccount,
        treeConfig
    })

    return await program.methods.mintCnft()
        .accounts({
            payer: payer.payer.publicKey,
            faucet: faucetPda,
            treeConfig,
            merkleTree: faucetAccount.merkelTree,
            leafOwner: payer.publicKey,
            logWrapper: SPL_NOOP_PROGRAM_ID,
            compressionProgram: SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
            bubblegum: new PublicKey(MPL_BUBBLEGUM_PROGRAM_ID),
            systemProgram: anchor.web3.SystemProgram.programId
        }).instruction()
}