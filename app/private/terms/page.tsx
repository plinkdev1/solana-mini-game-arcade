import { TermsHero } from "@/components/terms-hero"
import { TermsContent } from "@/components/terms-content"

export const metadata = {
  title: "Terms of Service – Sewer Arena",
  description: "Terms of Service for Sewer Arena. Complete legal framework for platform usage.",
}

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-background">
      <TermsHero />
      <TermsContent />
      <div className="h-12" />
    </main>
  )
}
