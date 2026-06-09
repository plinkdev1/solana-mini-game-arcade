"use client"

import Header from "@/components/header"
import { RulesHero } from "@/components/rules-hero"
import { RulesAccordion } from "@/components/rules-accordion"

export default function RulesPage() {
  return (
    <main className="min-h-screen bg-background flex flex-col">
      <Header />

      <div
        className="fixed inset-0 -z-10 top-20"
        style={{
          background: `
            radial-gradient(ellipse at 20% 50%, rgba(233, 30, 99, 0.15) 0%, transparent 40%),
            radial-gradient(ellipse at 80% 80%, rgba(139, 69, 19, 0.15) 0%, transparent 50%),
            linear-gradient(135deg, #1a0f1a 0%, #0a0a0a 50%, #0f1a0a 100%)
          `,
        }}
      />

      <div className="relative z-10 flex-1 py-12">
        <RulesHero />
        <div className="py-12">
          <RulesAccordion />
        </div>
      </div>
    </main>
  )
}
