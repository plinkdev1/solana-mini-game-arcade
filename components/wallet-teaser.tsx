"use client"
import { WalletModalFooter } from "@/components/wallet/wallet-modal-footer"

export default function WalletTeaser() {
  return (
    <section className="relative z-10 py-16 px-6 border-t border-border overflow-hidden">
      <div
        className="absolute inset-0 -z-20 bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(0, 0, 0, 0.8) 0%, rgba(26, 15, 26, 0.85) 50%, rgba(10, 10, 10, 0.8) 100%), url('/images/flush-with-us.png')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div className="absolute inset-0 -z-20 bg-black/60 backdrop-blur-sm" />

      <div className="max-w-4xl mx-auto text-center relative">
        <div className="inline-block p-6 bg-black/60 backdrop-blur border-2 border-accent rounded-lg mb-8 relative">
          <p className="text-sm text-muted-foreground mb-3">🔗 Wallet connection incoming...</p>
          <p className="text-xs text-accent italic">"No wallet? Get Phantom. It's free and already full of shit."</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="p-6 bg-black/50 backdrop-blur border border-primary/30 rounded-lg">
            <p className="text-sm font-bold text-primary mb-2">Join the Revolution</p>
            <p className="text-xs text-muted-foreground">"Flush it. Burn it. Meme it."</p>
          </div>
          <div className="p-6 bg-black/50 backdrop-blur border border-accent/30 rounded-lg">
            <p className="text-sm font-bold text-accent mb-2">El Shito Approves</p>
            <p className="text-xs text-muted-foreground">"Tag the world, get rekt IRL"</p>
          </div>
        </div>

        <WalletModalFooter />

        <footer className="mt-12 text-xs text-muted-foreground border-t border-border pt-6">
          <p className="mb-2">Built on Solana. Runs on cope.</p>
          <p className="mb-4">💩🚽💩🚽💩🚽💩🚽💩🚽💩🚽💩</p>
          <p className="font-bold text-primary">The shitty world ends where DatXit begins.</p>
        </footer>
      </div>
    </section>
  )
}
