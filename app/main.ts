import * as anchor from "@coral-xyz/anchor";
import {AnchorProvider, Program, Wallet, web3} from "@coral-xyz/anchor";
import {BbNft, IDL} from "../target/types/bb_nft";
import {
    ConcurrentMerkleTreeAccount,
    SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
    SPL_NOOP_PROGRAM_ID,
    ValidDepthSizePair
} from "@solana/spl-account-compression";
import {AccountMeta, PublicKey} from "@solana/web3.js";
import {
    findLeafAssetIdPda,
    findTreeConfigPda,
    MPL_BUBBLEGUM_PROGRAM_ID,
    parseLeafFromMintToCollectionV1Transaction
} from "@metaplex-foundation/mpl-bubblegum";
import {keypairFromSecret, keypairSignerFromSecret, loadWalletKey, umi} from "./utils";
import {KeypairSigner, percentAmount, publicKey, PublicKey as UmiPk} from "@metaplex-foundation/umi";
import {createNft} from "@metaplex-foundation/mpl-token-metadata";
import { getOrCreateAssociatedTokenAccount } from "@solana/spl-token";
import bs58 from 'bs58';

let solanaURL = "https://api.devnet.solana.com"

const connection = new web3.Connection(solanaURL);
const walletKeypair = loadWalletKey();
const wallet = new Wallet(walletKeypair)

const programId = new web3.PublicKey("23UbaEAHYvXWG3Af7BeVVsSDHfS3HcxHiWqSGrZR7S86")
const provider = new AnchorProvider(connection, wallet, {})
const program = new Program<BbNft>(IDL, programId, provider)

const bonk_token = new PublicKey("GwtTWkdrbpn1JgXhsmzCpNhQpgph6FMMWg3ecU8nYUjD")
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

const whitelist_tokens_pubkey = PublicKey.findProgramAddressSync([
    Buffer.from("token_whitelist")
], program.programId)[0]

async function init() {
    return await program.methods.init()
        .accounts({
            signer: wallet.publicKey,
            whitelist: whitelist_tokens_pubkey,
        }).rpc()
}
async function whitelist_token(token: PublicKey) {
    return await program.methods.whitelistToken()
        .accounts({
            signer: wallet.publicKey,
            whitelist: whitelist_tokens_pubkey,
            mint: token,
        }).rpc()
}

async function delist_token(token: PublicKey) {
    return await program.methods.delistToken()
        .accounts({
            signer: wallet.publicKey,
            whitelist: whitelist_tokens_pubkey,
            mint: token
        }).rpc()
}

async function mintNft(asset: PublicKey) {
   const createMintSig = await program.methods.mintCnft("COLA")
       .accounts({
           signer: wallet.publicKey,
           assetInfo: asset,
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

async function derive_cnft_id(mintSig: string) {
    let sig = Buffer.from(mintSig)
    const leaf = await parseLeafFromMintToCollectionV1Transaction(umi, sig)
    console.log({leaf})
    return findLeafAssetIdPda(umi, {merkleTree: mintSig as UmiPk, leafIndex: leaf.nonce})
}

const cnft_pubkey = new PublicKey("24GnX7R9rPsxpoUb73nKDtdCwWwFs81gURJVVfnzhU2L")
async function lock_cnft(cnft: PublicKey, assetInfo: PublicKey) {
    const signerBonkAta = await getOrCreateAssociatedTokenAccount(connection, wallet.payer, bonk_token, wallet.publicKey, false, "confirmed");
    const cnftStakeVault = PublicKey.findProgramAddressSync([Buffer.from("stake_vault"), cnft.toBuffer()], programId)[0];
    const stakeInfo = PublicKey.findProgramAddressSync([Buffer.from("stake_info"), cnft.toBuffer()], programId)[0];

    return await program.methods.lockFund()
        .accounts({
            signer: wallet.publicKey,
            cnft,
            assetInfo,
            signerTokenAta: signerBonkAta.address,
            cnftStakeVault,
            stakeInfo,
            whitelist: whitelist_tokens_pubkey,
            txTokenMint: bonk_token
        }).rpc()
}

async function burnNFT(asset: string) {
    const assetId = publicKey(asset)
    const assetProof = await umi.rpc.getAssetProof(assetId)
    const treeAccount = await ConcurrentMerkleTreeAccount.fromAccountAddress(
        connection,
        merkleTree
    )
    const canopyDepth = treeAccount.getCanopyDepth()
    const proof: AccountMeta[] = assetProof.proof
        .slice(0, assetProof.proof.length - (!!canopyDepth ? canopyDepth : 0))
        .map((node: string) => ({
            pubkey: new PublicKey(node),
            isSigner: false,
            isWritable: false
        }));
    const rpcAsset = await umi.rpc.getAsset(assetId)
    const treeConfig = findTreeConfigPda(umi, {merkleTree: merkleTree.toBase58() as UmiPk})[0]

    const treeConfigPublicKey = new anchor.web3.PublicKey(treeConfig)
    const root: number[] = Array.from(bs58.decode(assetProof.root)) //[...new PublicKey(assetProof.root.trim()).toBytes()]
    const dataHash: number[] = Array.from(bs58.decode(rpcAsset.compression.data_hash)) //[...new PublicKey(rpcAsset.compression.data_hash.trim()).toBytes()]
    const creatorHash: number[] = Array.from(bs58.decode(rpcAsset.compression.creator_hash)) //[...new PublicKey(rpcAsset.compression.creator_hash.trim()).toBytes()]

    const nonce = new anchor.BN(rpcAsset.compression.leaf_id)
    const index = rpcAsset.compression.leaf_id

    let cnft = new PublicKey(cnft_pubkey)
    const stakeInfo = PublicKey.findProgramAddressSync([Buffer.from("stake_info"), cnft.toBuffer()], programId)[0];
    const cnftStakeVault = PublicKey.findProgramAddressSync([Buffer.from("stake_vault"), cnft.toBuffer()], programId)[0];
    const signerBonkAta = await getOrCreateAssociatedTokenAccount(connection, wallet.payer, bonk_token, wallet.publicKey, false, "confirmed");

    return await program.methods
        .burnCnft(
            root,
            dataHash,
            creatorHash,
            nonce,
            index
        )
        .accounts({
            signer: wallet.publicKey,
            // stakeInfo,
            // tokenVault: cnftStakeVault,
            // signerTokenAccount: signerBonkAta.address,
            // cnft,
            treeConfig: treeConfigPublicKey,
            merkleTree,
            logWrapper: SPL_NOOP_PROGRAM_ID,
            compressionProgram: SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
            bubblegumProgram: MPL_BUBBLEGUM_PROGRAM_ID,
            systemProgram: anchor.web3.SystemProgram.programId
        })
        .signers([wallet.payer])
        .remainingAccounts(proof)
        .rpc({
            skipPreflight: false
        })
}

async function fetchCNFTs() {
    const value = await umi.rpc.getAssetsByOwner({owner: publicKey(wallet.publicKey)})
    console.log({cnfts: value.items})
}

async function main() {
    const nftId = "2Xc6tWR8QmTpg5K5opXdCpHbaHFgrd1dnC9Mh3giX9vs"

    // const init_tx = await init()
    // console.log({init_tx})


    // const whitelist_token_tx = await whitelist_token(bonk_token)
    // console.log({whitelist_token_tx})

    // await createCollection(nftCollectionKeypairSigner)
    // await createTree()

    let assetInfo = new PublicKey("9jcPQz32ZnzH3x861wXVnRPKv4wWqBJTo7XYPzFf8FUt");
    // await mintNft(assetInfo)
    // const lock_tx = await lock_cnft(cnft_pubkey, assetInfo)
    // console.log({lock_tx})

    // const stakeInfo = PublicKey.findProgramAddressSync(
    //     [Buffer.from("stake_info"),
    //         cnft_pubkey.toBuffer()], programId)[0];
    // const stakeInfoAccount = await program.account.stakeInfo.fetch(new PublicKey(stakeInfo))
    // console.log({assetOwner: stakeInfoAccount.owner.toString()})

    // await fetchCNFTs()

    const burnTx = await burnNFT(nftId)
    console.log({burnTx})

    //fetch asset by leaf id
    // const asset = await umi.rpc.getAsset(publicKey(nftId))
    // console.log({asset})

    // fetch oracle data
    // let accounts = await connection.getParsedProgramAccounts(
    //     new PublicKey("EP8gh6mMC4o6zzDWU8PPKyAXLHfhsHo3yti9wxtkQyTo")
    // )
    // console.log({accounts})

    /// can't get this to work at the moment
    // const cnft_id = await derive_cnft_id("63Q5DJ6Fr264915mE3i8CL9QJ8NGZnSjJRuK4XoCQ1jx6LekreR6hwpoQA8WDFGD7tZVGAfVPmqUVtpnUUtExbpE")
    // console.log({cnft_id})
}

main()
.then(_ => {
    console.log("Execution finished")
})
.catch(err => {
    console.log(err)
})
.finally(() => {
    console.log("DONE")
})

// mintCnft("Kick House", "KH", "https://nftcalendar.io/storage/uploads/2021/12/02/5_1202202103451761a8414d49b7d.png")