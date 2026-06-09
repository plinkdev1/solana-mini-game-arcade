import { DisclaimersHero } from "@/components/disclaimers-hero"
import { DisclaimersContent } from "@/components/disclaimers-content"

export const metadata = {
  title: "Disclaimers – Sewer Arena",
  description: "Legal disclaimers for Sewer Arena. No financial advice, mock mode only, beta software.",
}

export default function DisclaimersPage() {
  return (
    <main className="min-h-screen bg-background">
      <DisclaimersHero />
      <DisclaimersContent />
      <div className="h-12" />
    </main>
  )
}
