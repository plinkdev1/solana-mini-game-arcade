import Header from "@/components/header"
import Hero from "@/components/hero"
import GamesCarousel from "@/components/games-carousel"
import WalletTeaser from "@/components/wallet-teaser"
import ArenaFeatures from "@/components/arena-features"
import LoreSection from "@/components/lore-section"
import { EquipBoosterButton } from "@/components/nft/equip-booster-button"
import { FeedbackButton } from "@/components/feedback/feedback-button"
import { SettingsButton } from "@/components/settings/settings-button"
import { WalletBalance } from "@/components/wallet/wallet-balance"

export default function Home() {
  return (
    <main className="min-h-screen bg-background overflow-hidden">
      {/* Neon Club Lounge Background */}
      <div
        className="fixed inset-0 -z-10"
        style={{
          background: `
            radial-gradient(ellipse at 20% 50%, rgba(233, 30, 99, 0.15) 0%, transparent 40%),
            radial-gradient(ellipse at 80% 80%, rgba(0, 255, 65, 0.1) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 0%, rgba(255, 0, 255, 0.1) 0%, transparent 60%),
            linear-gradient(135deg, #1a0f1a 0%, #0a0a0a 50%, #0f1a0a 100%)
          `,
        }}
      />
      <div className="fixed inset-0 -z-10 bg-red-900/80 backdrop-blur-sm" />

      <Header />
      <div className="relative z-40 border-b border-border bg-black/40 backdrop-blur px-6 py-3 flex justify-between items-center">
        <WalletBalance />
        <div className="flex justify-end gap-3">
          <FeedbackButton />
          <EquipBoosterButton />
          <SettingsButton />
        </div>
      </div>
      <Hero />
      <ArenaFeatures />
      <LoreSection />
      <GamesCarousel />
      <WalletTeaser />
    </main>
  )
}
