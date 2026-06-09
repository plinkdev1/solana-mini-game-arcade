import type { Metadata } from "next"
import { CookieHero } from "@/components/cookie-hero"
import { CookieContent } from "@/components/cookie-content"

export const metadata: Metadata = {
  title: "Cookie Consent – Sewer Arena",
  description: "Transparent cookie policy explaining how Sewer Arena uses essential cookies for gameplay.",
}

export default function CookiesPage() {
  return (
    <main className="min-h-screen bg-background">
      <CookieHero />
      <CookieContent />
    </main>
  )
}
