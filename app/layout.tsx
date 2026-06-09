import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { Providers } from "@/components/providers"
import { Footer } from "@/components/footer"
import { CookieConsentBanner } from "@/components/cookie-consent-banner"

export const metadata: Metadata = {
  title: "Sewer Arena – DatXit Private Club",
  description: "Bet $DATX on strategy. Losers feed the Reserve Hole.",
  metadataBase: new URL("https://sewerarena.com"),
  openGraph: {
    title: "Sewer Arena – DatXit Private Club",
    description: "P2P gaming arena on Solana. Bet $DATX across 20 strategy games with neon velvet vibes.",
    url: "https://sewerarena.com",
    siteName: "Sewer Arena",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Sewer Arena Gaming Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sewer Arena – DatXit Private Club",
    description: "P2P gaming arena on Solana. Bet $DATX across 20 strategy games.",
    creator: "@sewerarena",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
    ],
  },
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`antialiased bg-background text-foreground overflow-x-hidden`}>
        <Providers>
          <CookieConsentBanner />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  )
}
