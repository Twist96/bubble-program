import {createUmi} from "@metaplex-foundation/umi-bundle-defaults";
import {mplBubblegum} from "@metaplex-foundation/mpl-bubblegum";

export const umi = createUmi("https://api.devnet.solana.com")
    .use(mplBubblegum())
