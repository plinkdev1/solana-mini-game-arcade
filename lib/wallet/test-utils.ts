import { useWalletStore } from "@/lib/stores/wallet-store"

export const WalletTestScenarios = {
  // Mock connection scenario
  testMockConnect: async () => {
    console.log("[v0] Test: Mock wallet connection")
    useWalletStore.setState({
      isConnected: true,
      publicKey: "mock_wallet_" + Date.now(),
      datxBalance: 1000,
      mode: "mock",
      mockMode: true,
    })
  },

  // Real wallet connection failure
  testRealConnectionFail: async () => {
    console.log("[v0] Test: Real wallet connection failure")
    useWalletStore.setState({
      error: "Failed to connect to Phantom wallet",
      isConnected: false,
    })
  },

  // Network switch scenario
  testNetworkSwitch: async (network: "devnet" | "mainnet") => {
    console.log(`[v0] Test: Switching to ${network}`)
    useWalletStore.setState({ network })
  },

  // Low balance scenario
  testLowBalance: async () => {
    console.log("[v0] Test: Low balance warning")
    useWalletStore.setState({ datxBalance: 0.05 })
  },

  // Disconnect mid-game
  testDisconnect: async () => {
    console.log("[v0] Test: Wallet disconnect")
    useWalletStore.setState({
      isConnected: false,
      publicKey: null,
      error: "Wallet disconnected",
    })
  },

  // Balance refresh
  testBalanceRefresh: async () => {
    console.log("[v0] Test: Balance refresh")
    useWalletStore.setState({ isFetchingBalance: true })
    await new Promise((resolve) => setTimeout(resolve, 1000))
    useWalletStore.setState({ isFetchingBalance: false, lastBalanceUpdate: Date.now() })
  },
}
