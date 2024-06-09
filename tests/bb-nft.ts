import * as anchor from "@coral-xyz/anchor";
import {Program} from "@coral-xyz/anchor";
import {BbNft} from "../target/types/bb_nft";
import {Connection, Keypair, PublicKey, SystemProgram, Transaction} from "@solana/web3.js"
import {createMerkleTreeAccount} from "./utils";
import {
    getConcurrentMerkleTreeAccountSize,
    SPL_ACCOUNT_COMPRESSION_PROGRAM_ID, SPL_NOOP_PROGRAM_ID,
    ValidDepthSizePair
} from "@solana/spl-account-compression";
import {MPL_BUBBLEGUM_PROGRAM_ID} from "@metaplex-foundation/mpl-bubblegum";
import {assert} from "chai";

describe("bb-nft", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());
  const payer = anchor.AnchorProvider.env().wallet as anchor.Wallet;

  const program = anchor.workspace.BbNft as Program<BbNft>;
  let connection = new Connection("http://api.devnet.solana.com");
  const provider = anchor.AnchorProvider.env();

    // Create a keypair that will hold the Merkle tree underlying data structure.
    const merkleTreeKeypair = Keypair.generate();
    const merkleTree = merkleTreeKeypair.publicKey;

    const [treeConfig] = PublicKey.findProgramAddressSync(
        [merkleTree.toBuffer()],
        program.programId
    )

    const [treeOwner] = PublicKey.findProgramAddressSync(
        [
            anchor.utils.bytes.utf8.encode("tree_owner"),
            merkleTree.toBuffer()
        ],
        program.programId
    );

    const whitelist_tokens_pubkey = PublicKey.findProgramAddressSync([
        Buffer.from("token_whitelist")
    ], program.programId)[0]


    const mint = new PublicKey("GwtTWkdrbpn1JgXhsmzCpNhQpgph6FMMWg3ecU8nYUjD")

    // This type enforces a valid `maxDepth` and `maxBufferSize` pair.
    const depthSizePair: ValidDepthSizePair = {
        maxDepth: 3,
        maxBufferSize: 8,
    };

    it.skip("should init", async() => {
        const tx = await program.methods.init()
            .accounts({
                signer: payer.publicKey,
                whitelist: whitelist_tokens_pubkey,
            })
            .rpc()
        console.log({tx})

        const whitelist_account = await program.account.tokenWhitelist.fetch(whitelist_tokens_pubkey)
        assert(whitelist_account.tokens.length === 0, "whitelist already contains token")
    });

    it("should whitelist token", async() => {
        const tx = await program.methods.whitelistToken()
            .accounts({
                signer: payer.publicKey,
                whitelist: whitelist_tokens_pubkey,
                mint
            })
            .rpc()

        const whitelist_account = await program.account.tokenWhitelist.fetch(whitelist_tokens_pubkey)
        console.log(whitelist_account.tokens)
        assert(whitelist_account.tokens.toString().includes(mint.toString()), "token not found in list")
    });

    it("should delist token", async() => {
        const tx = await program.methods.delistToken()
            .accounts({
                signer: payer.publicKey,
                whitelist: whitelist_tokens_pubkey,
                mint
            })
            .rpc()

        const whitelist_account = await program.account.tokenWhitelist.fetch(whitelist_tokens_pubkey)
        assert(!whitelist_account.tokens.includes(mint), "token not remove from list")
    });

    it.skip("should create tree", async () => {
        const createMerkleTreeTxSig = await createMerkleTreeAccount(provider, merkleTreeKeypair, depthSizePair)
        console.log({createMerkleTreeTxSig})

        const tx = await program.methods.createTree(depthSizePair.maxDepth, depthSizePair.maxBufferSize)
            .accounts({
                signer: payer.publicKey,
                treeConfig,
                merkleTree,
                treeOwner,
                mplBubblegumProgram: MPL_BUBBLEGUM_PROGRAM_ID,
                logWrapper: SPL_NOOP_PROGRAM_ID,
                compressionProgram: SPL_ACCOUNT_COMPRESSION_PROGRAM_ID
            })
            .rpc()
        console.log({create_tree_tx: tx})
    });

    it.skip("should create nft", async () => {
        let txSig = await program.methods.mintCnft("KH")
            .accounts({
                signer: payer.publicKey,
                treeConfig,
                merkleTree,
                treeOwner,
                mplBubblegumProgram: MPL_BUBBLEGUM_PROGRAM_ID,
                logWrapper: SPL_NOOP_PROGRAM_ID,
                compressionProgram: SPL_ACCOUNT_COMPRESSION_PROGRAM_ID
            })
            .signers([payer.payer])
            .rpc()
        console.log({txSig})
    });
});