// Generate neon SVG placeholders for mock NFT images
export function generateNeonPlaceholder(type: string, rarity: "common" | "rare" | "legendary"): string {
  const rarityColors = {
    common: { glow: "#22c55e", dark: "#1a4d2e" },
    rare: { glow: "#3b82f6", dark: "#1e3a8a" },
    legendary: { glow: "#eab308", dark: "#713f12" },
  }

  const colors = rarityColors[rarity]
  const icons = {
    drip_shades: "👓",
    poop_chain: "⛓️",
    bandana: "🧣",
    crown: "👑",
    plunger: "🪠",
    swirl: "🌀",
  }

  // Return data URL of SVG placeholder with neon styling
  const svg = `
    <svg width="256" height="256" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
      <defs>
        <filter id="neon" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${colors.dark};stop-opacity:1" />
          <stop offset="100%" style="stop-color:#000;stop-opacity:1" />
        </linearGradient>
      </defs>
      <!-- Background -->
      <rect width="256" height="256" fill="url(#grad)"/>
      <!-- Neon border -->
      <rect x="8" y="8" width="240" height="240" fill="none" stroke="${colors.glow}" stroke-width="3" opacity="0.6" filter="url(#neon)"/>
      <!-- Inner glow -->
      <circle cx="128" cy="128" r="100" fill="none" stroke="${colors.glow}" stroke-width="1" opacity="0.3" filter="url(#neon)"/>
      <!-- Center icon -->
      <text x="128" y="140" font-size="80" text-anchor="middle" fill="${colors.glow}" filter="url(#neon)" font-weight="bold">${icons[type as keyof typeof icons] || "🪠"}</text>
      <!-- Sludge swirls -->
      <path d="M 50 100 Q 100 80, 150 100 T 250 100" stroke="${colors.glow}" stroke-width="2" fill="none" opacity="0.4" filter="url(#neon)"/>
      <path d="M 50 200 Q 100 220, 150 200 T 250 200" stroke="${colors.glow}" stroke-width="2" fill="none" opacity="0.4" filter="url(#neon)"/>
    </svg>
  `.trim()

  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`
}
