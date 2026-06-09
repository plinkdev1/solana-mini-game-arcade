import type { NFTMetadata } from "./nft-types"

// Generate neon SVG placeholders (client-side render)
const generateNeonSVG = (icon: string, color: string): string => {
  const svg = `<svg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><defs><filter id="n"><feGaussianBlur stdDeviation="2"/></filter></defs><rect fill="#0a0a0a" width="256" height="256"/><rect x="8" y="8" width="240" height="240" fill="none" stroke="${color}" strokeWidth="2" opacity="0.8" filter="url(#n)"/><circle cx="128" cy="128" r="100" fill="none" stroke="${color}" strokeWidth="1" opacity="0.4"/><text x="128" y="150" fontSize="90" textAnchor="middle" fill="${color}" filter="url(#n)" fontWeight="bold">${icon}</text></svg>`
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`
}

export const MOCK_NFTS: NFTMetadata[] = [
  // Common Tier - +10% Boost
  {
    mint: "nft-drip-shades-1",
    name: "Drip Shades #1",
    symbol: "DATX-DRIP",
    image: generateNeonSVG("👓", "#22c55e"),
    rarity: "common",
    boostPercentage: 10,
    description: "Street-smart neon shades for the sewer grind. 'Keep it cool, stay in the shadows.'",
  },
  {
    mint: "nft-poop-chain-2",
    name: "Poop Chain #2",
    symbol: "DATX-CHAIN",
    image: generateNeonSVG("⛓️", "#22c55e"),
    rarity: "common",
    boostPercentage: 10,
    description: "Legendary 24-karat bling that screams dominance. 'Flex on the competition – literally.'",
  },
  // Rare Tier - +20% Boost + Special Effect
  {
    mint: "nft-bandana-1",
    name: "El Shito Bandana",
    symbol: "DATX-BANDANA",
    image: generateNeonSVG("🧣", "#3b82f6"),
    rarity: "rare",
    boostPercentage: 20,
    description:
      "The iconic mask of legends. Glowing eyes pierce the sewer darkness. 'Clog the competition harder!' +20% Power-Up Chance. Exclusive: Preview next power-up type.",
  },
  {
    mint: "nft-crown-1",
    name: "Royal Flush Crown",
    symbol: "DATX-CROWN",
    image: generateNeonSVG("👑", "#3b82f6"),
    rarity: "rare",
    boostPercentage: 20,
    description:
      "Throne of the sewer dynasty. Only true hustlers wear this. +20% Power-Up Chance. Exclusive: Block one enemy power-up per match.",
  },
  // Legendary Tier - +30% Boost + Guaranteed Power-Up
  {
    mint: "nft-plunger-1",
    name: "Golden Plunger Staff",
    symbol: "DATX-PLUNGER",
    image: generateNeonSVG("🪠", "#eab308"),
    rarity: "legendary",
    boostPercentage: 30,
    description:
      "The ultimate weapon of flush dominance. Guarantees unstoppable power. +30% Boost. Exclusive: GUARANTEED Power-Up + Choose Type.",
  },
  {
    mint: "nft-swirl-1",
    name: "Diamond Swirl Vortex",
    symbol: "DATX-SWIRL",
    image: generateNeonSVG("🌀", "#eab308"),
    rarity: "legendary",
    boostPercentage: 30,
    description:
      "Hypnotic diamond-infused vortex. Enemies can't look away. +30% Boost. Exclusive: GUARANTEED Power-Up + Double Effect Duration.",
  },
]

export const COLLECTION_TIERS = {
  common: {
    name: "Common - Street Drip",
    boost: 10,
    count: 2,
    effect: "Basic boost only",
    price: 2.0,
    description: "Entry-level sewer warrior gear. Stack up these basics for pure grinding.",
  },
  rare: {
    name: "Rare - Flush Elite",
    boost: 20,
    count: 2,
    effect: "Exclusive power bonus",
    price: 5.0,
    description: "Mid-tier dominance. Unlock special abilities to clog harder.",
  },
  legendary: {
    name: "Legendary - Flush Royalty",
    boost: 30,
    count: 2,
    effect: "Guaranteed Power-Up",
    price: 15.0,
    description: "Ultimate sewer supremacy. These pieces guarantee victory.",
  },
}

/**
 * PRODUCTION IMPLEMENTATION: Metaplex Real NFT Fetching
 *
 * Current: Mock NFTs for testing and demo purposes
 * Target: Real NFT fetching from Solana blockchain via Metaplex
 *
 * Steps to implement:
 * 1. Install @metaplex-foundation/js and @solana/web3.js
 * 2. Initialize Metaplex with RPC connection (devnet/mainnet)
 * 3. Implement collection verification via COLLECTION_ADDRESS
 * 4. Add caching layer (Redis) with 5-10min TTL
 * 5. Handle network switching and balance updates
 *
 * Reference: https://docs.metaplex.com/programs/token-metadata/overview
 */

export async function fetchUserNFTs(walletAddress: string): Promise<NFTMetadata[]> {
  // Mock implementation - returns MOCK_NFTS for development/testing
  console.log("[v0] NFT Fetch: Using mock NFTs. Production will fetch from Metaplex:", walletAddress)

  // PRODUCTION CODE (comment out for mock):
  // try {
  //   const connection = new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.devnet.solana.com");
  //   const metaplex = Metaplex.make(connection);
  //   const owner = new PublicKey(walletAddress);
  //
  //   const nfts = await metaplex.nfts().findAllByOwner({ owner });
  //   const collectionAddress = new PublicKey(process.env.NEXT_PUBLIC_NFT_COLLECTION_ADDRESS!);
  //
  //   return nfts
  //     .filter(nft => nft.collection?.address.equals(collectionAddress) && nft.collection?.verified)
  //     .map(nft => ({
  //       mint: nft.mint.toString(),
  //       name: nft.name,
  //       symbol: nft.symbol,
  //       image: nft.uri || "/placeholder.svg",
  //       rarity: determineTierFromAttributes(nft.attributes),
  //       boostPercentage: getBoostPercentage(nft.rarity),
  //       description: nft.description || "Sewer Arena Power-Up Booster",
  //     }));
  // } catch (error) {
  //   console.error("[v0] Real NFT fetch failed, using mock:", error);
  //   return MOCK_NFTS;
  // }

  return MOCK_NFTS
}
