/**
 * Price oracle service for DATX memecoin
 * Fetches real-time price from multiple sources with fallback strategy
 * Priority: Chainlink → DexScreener → CoinGecko
 * Used for dynamic minimum bet calculation based on USD equivalent
 */

export interface PriceData {
  price: number // USD price per DATX
  source: "chainlink" | "dexscreener" | "coingecko" | "mock"
  timestamp: number
  error?: string
}

// Mock DATX price (for development)
const MOCK_DATX_PRICE = 0.0001 // $0.0001 USD per DATX (example)

/**
 * Fetch DATX price from Chainlink (most reliable for Solana tokens)
 */
async function fetchChainlinkPrice(): Promise<PriceData | null> {
  try {
    // Note: Chainlink integration would require on-chain Solana program interaction
    // For now, this is a placeholder that would integrate with Switchboard VRF later
    console.log("[v0] Chainlink price fetch - would integrate with Solana program")
    return null
  } catch (error) {
    console.error("[v0] Chainlink price fetch failed:", error)
    return null
  }
}

/**
 * Fetch DATX price from DexScreener (real-time DEX data)
 */
async function fetchDexScreenerPrice(): Promise<PriceData | null> {
  try {
    const response = await fetch("https://api.dexscreener.com/latest/dex/tokens/YOUR_DATX_MINT")
    if (!response.ok) throw new Error("DexScreener API failed")

    const data = await response.json()
    const pair = data.pairs?.[0]

    if (pair?.priceUsd) {
      return {
        price: Number.parseFloat(pair.priceUsd),
        source: "dexscreener",
        timestamp: Date.now(),
      }
    }
    return null
  } catch (error) {
    console.error("[v0] DexScreener price fetch failed:", error)
    return null
  }
}

/**
 * Fetch DATX price from CoinGecko (reliable fallback)
 */
async function fetchCoinGeckoPrice(): Promise<PriceData | null> {
  try {
    const response = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=YOUR_DATX_ID&vs_currencies=usd")
    if (!response.ok) throw new Error("CoinGecko API failed")

    const data = await response.json()
    const price = data?.YOUR_DATX_ID?.usd

    if (price) {
      return {
        price,
        source: "coingecko",
        timestamp: Date.now(),
      }
    }
    return null
  } catch (error) {
    console.error("[v0] CoinGecko price fetch failed:", error)
    return null
  }
}

/**
 * Main price fetcher with fallback strategy
 */
export async function getDatexPrice(): Promise<PriceData> {
  console.log("[v0] Fetching DATX price...")

  // Try Chainlink first
  const chainlinkPrice = await fetchChainlinkPrice()
  if (chainlinkPrice) return chainlinkPrice

  // Fallback to DexScreener
  const dexscreenerPrice = await fetchDexScreenerPrice()
  if (dexscreenerPrice) return dexscreenerPrice

  // Fallback to CoinGecko
  const coingeckoPrice = await fetchCoinGeckoPrice()
  if (coingeckoPrice) return coingeckoPrice

  // Final fallback to mock price (for development)
  console.warn("[v0] All price sources failed, using mock price")
  return {
    price: MOCK_DATX_PRICE,
    source: "mock",
    timestamp: Date.now(),
    error: "Using mock price - oracle unavailable",
  }
}

/**
 * Calculate minimum bet in DATX based on USD equivalent
 * Ensures bet >= $0.01 USD (minimum to cover Solana tx fees)
 */
export async function calculateMinBetInDatx(): Promise<number> {
  const priceData = await getDatexPrice()
  const USD_MIN_BET = 0.01 // $0.01 minimum
  const minBetInDatx = Math.ceil(USD_MIN_BET / priceData.price)
  return Math.max(minBetInDatx, 1) // Always at least 1 DATX
}

/**
 * Format price for display
 */
export function formatDatxPrice(price: number): string {
  if (price < 0.0001) {
    return `$${price.toExponential(2)}`
  }
  return `$${price.toFixed(6)}`
}
