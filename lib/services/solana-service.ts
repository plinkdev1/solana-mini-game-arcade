import { Connection, PublicKey } from "@solana/web3.js"

const RPC_URL = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com"
const DATX_MINT = "DATXjMYYnVCH3hfhtbvipLJECYZA1chTZctqQMoN8c6" // Placeholder - update with real mint

export const solanaService = {
  connection: new Connection(RPC_URL, "confirmed"),

  // Fetch SOL balance
  async getBalance(publicKey: string): Promise<number> {
    try {
      const pk = new PublicKey(publicKey)
      const balance = await this.connection.getBalance(pk)
      return balance / 1e9 // Convert lamports to SOL
    } catch (error) {
      console.error("[v0] Error fetching SOL balance:", error)
      return 0
    }
  },

  // Fetch $DATX token balance
  async getTokenBalance(publicKey: string): Promise<number> {
    try {
      const pk = new PublicKey(publicKey)
      const mintPk = new PublicKey(DATX_MINT)

      const accounts = await this.connection.getTokenAccountsByOwner(pk, {
        mint: mintPk,
      })

      if (accounts.value.length === 0) {
        return 0
      }

      const accountInfo = await this.connection.getParsedAccountInfo(accounts.value[0].pubkey)
      if (accountInfo.value?.data.type === "mint") {
        return 0
      }

      const parsedData = accountInfo.value?.data
      if (parsedData?.parsed?.info?.tokenAmount?.uiAmount) {
        return parsedData.parsed.info.tokenAmount.uiAmount
      }

      return 0
    } catch (error) {
      console.error("[v0] Error fetching $DATX balance:", error)
      return 0
    }
  },

  // Validate public key
  isValidPublicKey(key: string): boolean {
    try {
      new PublicKey(key)
      return true
    } catch {
      return false
    }
  },
}
