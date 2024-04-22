import {AnchorProvider, Program, Wallet, web3} from "@coral-xyz/anchor";
import idl from "../target/idl/bb_nft.json";
import {BbNft, IDL} from "../target/types/bb_nft";
import {
    SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
    SPL_NOOP_PROGRAM_ID,
    ValidDepthSizePair
} from "@solana/spl-account-compression";
import { PublicKey} from "@solana/web3.js";
import {MPL_BUBBLEGUM_PROGRAM_ID} from "@metaplex-foundation/mpl-bubblegum";
import * as anchor from "@coral-xyz/anchor";
import {keypairFromSecret, keypairSignerFromSecret, loadWalletKey, umi} from "./utils";
import {
    KeypairSigner,
    percentAmount,
    publicKey
} from "@metaplex-foundation/umi";
import {createNft} from "@metaplex-foundation/mpl-token-metadata";

let solanaURL = "https://api.devnet.solana.com"

const connection = new web3.Connection(solanaURL);
const walletKeypair = loadWalletKey();
const wallet = new Wallet(walletKeypair)

const programId = new web3.PublicKey("23UbaEAHYvXWG3Af7BeVVsSDHfS3HcxHiWqSGrZR7S86")
const provider = new AnchorProvider(connection, wallet, {})
const program = new Program<BbNft>(IDL, programId, provider)

const merkleTreeSecret = [
    233,  76, 207, 113,  59, 217, 235, 251,  77, 135,   3,
    180, 171, 163,  93, 237, 210, 187,  59,  74, 185,   7,
    58,  11, 133,  12, 198,  30, 151, 131, 218, 183, 170,
    241, 236,  60, 160, 189,  98, 213,  44, 113,   2, 204,
    8,  46, 100,  72, 151,  59,  64,  77,  64, 110,  69,
    7,   9, 108, 191,  36,  28, 147, 221,   8
]
// public key: CWJGT52bvc1zhfuEPvYMc7Lhfpax36WAuL9xZr2h6prj
const merkleTreeKeypair = keypairFromSecret(merkleTreeSecret)
const merkleTree = merkleTreeKeypair.publicKey

const nftCollectionSecret = [
    107, 133, 249,  17,  87, 242, 88,  24,  55, 201, 123,
    150, 173,  88, 181, 217, 112, 54,   1, 117, 194,  35,
    124,  21,  77,  44, 186, 147, 80, 184, 247,  35, 191,
    255, 116,  58,  15,  56, 184, 97,  34, 181,   0,   2,
    110, 182, 185, 184, 212, 204, 67, 109, 167, 164, 193,
    108, 200,  16,  94, 232,  21, 34,   5, 225
]
// public key: DvUo7hWPfw76yGdmAKdJqSVQbvKYNqV5V5bxtKBGXHHa
const nftCollectionKeypairSigner = keypairSignerFromSecret(nftCollectionSecret)

const [treeConfig] = PublicKey.findProgramAddressSync(
    [merkleTree.toBuffer()],
    new PublicKey(MPL_BUBBLEGUM_PROGRAM_ID)
)

const [treeOwner] = PublicKey.findProgramAddressSync(
    [
        anchor.utils.bytes.utf8.encode("tree_owner"),
        merkleTree.toBuffer()
    ],
    program.programId
);

const depthSizePair: ValidDepthSizePair = {
    maxDepth: 3,
    maxBufferSize: 8,
};

async function createCollection(collectionMint: KeypairSigner) {
    const txSig = await createNft(umi, {
        mint: collectionMint,
        name: "NY Homes",
        uri: "https://nftcalendar.io/storage/uploads/2021/12/02/5_1202202103451761a8414d49b7d.png",
        sellerFeeBasisPoints: percentAmount(7.5),
        isCollection: true
    }).sendAndConfirm(umi)
    console.log({txSig: txSig})
}

async function createTree() {
    // const treeAccTxSig = await createMerkleTreeAccount(provider, merkleTreeKeypair, depthSizePair)
    // console.log({treeAccTxSig})

    const treeTxSig = await program.methods.createTree(depthSizePair.maxDepth, depthSizePair.maxBufferSize)
        .accounts({
            signer: wallet.publicKey,
            treeConfig,
            merkleTree,
            treeOwner,
            mplBubblegumProgram: MPL_BUBBLEGUM_PROGRAM_ID,
            logWrapper: SPL_NOOP_PROGRAM_ID,
            compressionProgram: SPL_ACCOUNT_COMPRESSION_PROGRAM_ID
        }).rpc()
    console.log({treeTxSig})
}

async function mintNft() {
   const createMintSig = await program.methods.mintCnft("Kick House", "KH", "https://nftcalendar.io/storage/uploads/2021/12/02/5_1202202103451761a8414d49b7d.png")
       .accounts({
           signer: wallet.publicKey,
           treeConfig,
           merkleTree,
           treeOwner,
           nftCollection: nftCollectionKeypairSigner.publicKey,
           mplBubblegumProgram: MPL_BUBBLEGUM_PROGRAM_ID,
           logWrapper: SPL_NOOP_PROGRAM_ID,
           compressionProgram: SPL_ACCOUNT_COMPRESSION_PROGRAM_ID
       }).rpc()
    console.log({createMintSig})
}

async function fetchCNFTs() {
    const value = await umi.rpc.getAssetsByOwner({owner: publicKey(wallet.publicKey)})
    console.log({cnfts: value.items})
}

async function main() {
    // await createCollection(nftCollectionKeypairSigner)
    // await createTree()
    // await mintNft()
    await fetchCNFTs()

    //fetch asset by leaf id
    const value = await umi.rpc.getAsset(publicKey("4cVTwrXyH9qsRcf74K9EE7Ais1hAeMFFJ5MUou9mvX7V"))
    console.log(value)
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
