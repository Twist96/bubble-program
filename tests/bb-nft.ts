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

    // This type enforces a valid `maxDepth` and `maxBufferSize` pair.
    const depthSizePair: ValidDepthSizePair = {
        maxDepth: 3,
        maxBufferSize: 8,
    };

    it("should create tree", async () => {
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

    it.only("should create nft", async () => {
        let txSig = await program.methods.mintCnft("Kick House", "KH", "https://nftcalendar.io/storage/uploads/2021/12/02/5_1202202103451761a8414d49b7d.png")
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