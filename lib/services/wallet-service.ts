// Mock wallet connection service for testing
export interface WalletService {
  connect(): Promise<string | null>
  disconnect(): Promise<void>
  getBalance(address: string): Promise<number>
}

export const mockWalletService: WalletService = {
  connect: async () => {
    // Mock: Return a fake wallet address
    return "DatXit" + Math.random().toString(36).substring(7)
  },

  disconnect: async () => {
    // Mock: Just resolve
  },

  getBalance: async (address: string) => {
    // Mock: Return random balance for testing
    return Math.random() * 10
  },
}
