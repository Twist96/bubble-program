import {AnchorProvider, Program, Wallet, web3} from "@coral-xyz/anchor";
import * as fs from "fs";
import idl from "../target/idl/bb_nft.json";
import {BbNft, IDL} from "../target/types/bb_nft";
import {createCNFTIx, createFaucetIx, executeTx, findFaucetPda} from "../tests/utils";

let solanaURL = "https://api.devnet.solana.com" // "http://localhost:8899"

function loadWalletKey(): web3.Keypair {
    return web3.Keypair.fromSecretKey(

        //replace path
        new Uint8Array(JSON.parse(fs.readFileSync("/Users/matthewchukwuemeka/.config/solana/id.json").toString()))
        // new Uint8Array()
    )
}

const connection = new web3.Connection(solanaURL);
const walletKeypair = loadWalletKey();
const wallet = new Wallet(walletKeypair)

const programId = new web3.PublicKey("23UbaEAHYvXWG3Af7BeVVsSDHfS3HcxHiWqSGrZR7S86")
const provider = new AnchorProvider(connection, wallet, {})
const program = new Program<BbNft>(IDL, programId, provider)

async function create_faucet() {
    const faucetPda = findFaucetPda(program, wallet.publicKey)
    const faucetIx = await createFaucetIx(program, wallet, faucetPda)
    const tx = await executeTx(wallet.payer, [faucetIx], connection)
    console.log({create_faucet: tx})
}

async function create_mint() {
    const faucetPda = findFaucetPda(program, wallet.publicKey)
    const ix = await createCNFTIx(program, wallet, faucetPda)
    const tx = await executeTx(wallet.payer, [ix], connection)
    console.log({cnft_tx: tx})
}

async function main() {
    //first instruction works
    // await create_faucet()

    //second instruction fails -> Error processing Instruction 1: custom program error: 0xbbf
    await create_mint()
}

main()
.then(_ => {
    console.log("Execution finished")
})
.catch(err => {
    console.log("err " + err.toString())
})
.finally(() => {
    console.log("DONE")
})