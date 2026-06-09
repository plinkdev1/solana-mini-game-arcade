"use client"

import { useEffect } from "react"

export function WalletModalOverlay() {
  useEffect(() => {
    const handleMutations = () => {
      const modal = document.querySelector("[role='dialog']")
      if (modal && !modal.hasAttribute("data-themed")) {
        modal.setAttribute("data-themed", "true")
        applyThemeOverlay(modal as HTMLElement)
      }
    }

    const observer = new MutationObserver(handleMutations)
    observer.observe(document.body, { childList: true, subtree: true })

    // Inject theme styles once
    injectThemeStyles()

    return () => observer.disconnect()
  }, [])

  const applyThemeOverlay = (modal: HTMLElement) => {
    modal.style.borderColor = "#e91e63"
    modal.style.borderWidth = "2px"
    modal.style.animation = "border-flicker 3s ease-in-out infinite"

    const content = modal.querySelector("[role='presentation']") || modal

    // Top drip
    const topDrip = document.createElement("div")
    topDrip.className =
      "absolute -top-2 left-1/4 w-1 h-6 bg-gradient-to-b from-amber-700/40 to-transparent pointer-events-none"
    topDrip.style.animation = "drip-sludge 2s ease-in infinite"
    content.appendChild(topDrip)

    // Bottom drip
    const bottomDrip = document.createElement("div")
    bottomDrip.className =
      "absolute -bottom-2 right-1/4 w-1 h-6 bg-gradient-to-t from-amber-800/40 to-transparent pointer-events-none"
    bottomDrip.style.animation = "drip-sludge 2.5s ease-in infinite 0.5s"
    content.appendChild(bottomDrip)

    const silhouette = document.createElement("div")
    silhouette.className = "absolute inset-0 rounded-lg opacity-5 pointer-events-none"
    silhouette.style.background =
      'url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M50,10c15.3,0 28,12.7 28,28s-12.7,28-28,28s-28,-12.7-28,-28s12.7,-28 28,-28z" fill="%23e91e63" opacity="0.1"/></svg>\') no-repeat center'
    silhouette.style.backgroundSize = "contain"
    content.appendChild(silhouette)
  }

  const injectThemeStyles = () => {
    if (document.getElementById("wallet-theme-styles")) return

    const style = document.createElement("style")
    style.id = "wallet-theme-styles"
    style.innerHTML = `
      @keyframes border-flicker {
        0%, 100% {
          border-color: #e91e63;
          box-shadow: 0 0 30px rgba(233, 30, 99, 0.6), inset 0 0 20px rgba(93, 64, 55, 0.3);
        }
        50% {
          border-color: #d4691a;
          box-shadow: 0 0 40px rgba(233, 30, 99, 0.8), inset 0 0 25px rgba(212, 105, 26, 0.4);
        }
      }
      [role="dialog"][data-themed="true"] {
        background-color: rgba(10, 10, 10, 0.95) !important;
        border-radius: 0.5rem !important;
      }
    `
    document.head.appendChild(style)
  }

  return null
}
