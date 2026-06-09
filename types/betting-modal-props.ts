export interface BettingModalProps {
  isOpen: boolean
  onClose: () => void
  onBetPlaced: (betAmount: number) => void
  gameTitle: string
}
