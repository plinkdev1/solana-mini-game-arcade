import { PrivacyHero } from "@/components/privacy-hero"
import { PrivacyContent } from "@/components/privacy-content"

export const metadata = {
  title: "Privacy Policy – Sewer Arena",
  description: "GDPR-compliant privacy policy. Your data stays in the Reserve Hole.",
}

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background">
      <PrivacyHero />
      <PrivacyContent />
      <div className="h-12" />
    </main>
  )
}
