import { useWalletStore } from "@/lib/stores/wallet-store"
import { solanaService } from "./solana-service"

// Phantom adapter
export const phantomAdapter = {
  name: "Phantom",
  icon: "👻",

  async connect() {
    if (typeof window === "undefined") return null

    const provider = (window as any).solana
    if (!provider) {
      alert("Phantom wallet not installed")
      return null
    }

    try {
      const response = await provider.connect()
      const publicKey = response.publicKey.toString()

      console.log("[v0] Phantom connected:", publicKey)

      // Fetch balances
      const solBalance = await solanaService.getBalance(publicKey)
      const datxBalance = await solanaService.getTokenBalance(publicKey)

      useWalletStore.setState({
        isConnected: true,
        publicKey,
        solBalance,
        datxBalance: datxBalance || useWalletStore.getState().datxBalance,
        mockMode: false, // Real mode
      })

      return publicKey
    } catch (error: any) {
      console.error("[v0] Phantom connection error:", error)
      useWalletStore.setState({
        error: error.message || "Failed to connect Phantom wallet",
      })
      return null
    }
  },

  async disconnect() {
    const provider = (window as any).solana
    if (provider?.disconnect) {
      await provider.disconnect()
      console.log("[v0] Phantom disconnected")
    }
    useWalletStore.setState({
      isConnected: false,
      publicKey: null,
      mockMode: true, // Back to mock
    })
  },
}

// Solflare adapter
export const solflareAdapter = {
  name: "Solflare",
  icon: "🔥",

  async connect() {
    if (typeof window === "undefined") return null

    const provider = (window as any).solflare
    if (!provider) {
      alert("Solflare wallet not installed")
      return null
    }

    try {
      await provider.connect()
      const publicKey = provider.publicKey.toString()

      console.log("[v0] Solflare connected:", publicKey)

      const solBalance = await solanaService.getBalance(publicKey)
      const datxBalance = await solanaService.getTokenBalance(publicKey)

      useWalletStore.setState({
        isConnected: true,
        publicKey,
        solBalance,
        datxBalance: datxBalance || useWalletStore.getState().datxBalance,
        mockMode: false,
      })

      return publicKey
    } catch (error: any) {
      console.error("[v0] Solflare connection error:", error)
      useWalletStore.setState({
        error: error.message || "Failed to connect Solflare wallet",
      })
      return null
    }
  },

  async disconnect() {
    const provider = (window as any).solflare
    if (provider?.disconnect) {
      await provider.disconnect()
      console.log("[v0] Solflare disconnected")
    }
    useWalletStore.setState({
      isConnected: false,
      publicKey: null,
      mockMode: true,
    })
  },
}

// Ledger adapter (stub for now - requires @ledgerhq/web3-substrate)
export const ledgerAdapter = {
  name: "Ledger",
  icon: "🔐",

  async connect() {
    console.log("[v0] Ledger adapter - stub implementation")
    alert("Ledger support coming soon - use mock mode for testing")
    return null
  },

  async disconnect() {
    console.log("[v0] Ledger disconnected")
    useWalletStore.setState({
      isConnected: false,
      publicKey: null,
      mockMode: true,
    })
  },
}

// Mock adapter for testing
export const mockAdapter = {
  name: "Mock (Dev)",
  icon: "🧪",

  async connect() {
    const mockAddress = "DatXitSewer" + Math.random().toString(36).substring(2, 10).toUpperCase()
    console.log("[v0] Mock wallet connected:", mockAddress)

    useWalletStore.setState({
      isConnected: true,
      publicKey: mockAddress,
      solBalance: 1.5,
      datxBalance: 1000,
      mockMode: true,
    })

    return mockAddress
  },

  async disconnect() {
    console.log("[v0] Mock wallet disconnected")
    useWalletStore.setState({
      isConnected: false,
      publicKey: null,
      mockMode: true,
    })
  },
}

export const WALLET_ADAPTERS = [mockAdapter, phantomAdapter, solflareAdapter, ledgerAdapter]
