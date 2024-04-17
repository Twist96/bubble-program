import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { BbNft } from "../target/types/bb_nft";
import {Connection} from "@solana/web3.js"
import {createFaucetIx, executeTx, createCNFTIx, findFaucetPda} from "./utils";

describe("bb-nft", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());
  const payer = anchor.AnchorProvider.env().wallet as anchor.Wallet;

  const program = anchor.workspace.BbNft as Program<BbNft>;
  let connection = new Connection("http://api.devnet.solana.com");


  it.only("should create faucet", async () =>  {
      const faucetPda = findFaucetPda(program, payer.publicKey);
      let tx = await createFaucetIx(program, payer, faucetPda);
      let txSig = await executeTx(payer.payer, [tx], connection)
      console.log({txSig})
      // tx: 5K3vdCyJ1yrFJGy7x1FPczfXzkZzUUwuAgSAewEttyf5kA8hfi1WpWcWba1ToZ5aU8aCA5P6UALpGgA81Beo8d2Y
  })

  it("should create nft", async () => {
      const faucetPda = findFaucetPda(program, payer.publicKey);
      const tx = await createCNFTIx(program, payer, faucetPda);
      let txSig = await executeTx(payer.payer, [tx], connection)
      console.log({txSig})
  });
});
