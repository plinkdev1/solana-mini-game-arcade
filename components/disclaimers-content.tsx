"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { AlertTriangle, Zap, Info } from "lucide-react"

const sections = [
  {
    id: "financial",
    title: "No Financial Advice",
    icon: Zap,
    content: `Sewer Arena is a game platform only. Nothing here is financial advice:
    • $DATX mock bets are for entertainment, not investment
    • Your gameplay outcomes have zero real-world financial impact
    • We are not financial advisors, brokers, or investment firms
    • Do not make real-money decisions based on mock game results
    
    Play responsibly. Treat all bets as fun, not returns.`,
  },
  {
    id: "mock",
    title: "Mock Mode – No Real Money",
    icon: Info,
    content: `This is a beta platform using mock currency:
    • $DATX balances are simulated for gameplay only
    • No real money is exchanged, deposited, or withdrawn
    • Mock bets have zero real-world value
    • The platform may transition to real tokenomics in future versions
    • Your current mock balances will NOT convert to real value
    
    We reserve the right to reset or modify mock data at any time.`,
  },
  {
    id: "notgambling",
    title: "Not Gambling",
    icon: Info,
    content: `Sewer Arena is explicitly NOT a gambling platform:
    • No real money wagering – only mock gameplay
    • No random number generation for outcome manipulation
    • All games are skill-based with deterministic rules
    • No house edge or rake that benefits an operator unfairly
    • Mock bets do not create gambling addiction liability
    
    This is a competitive gaming platform, not a casino.`,
  },
  {
    id: "ip",
    title: "Intellectual Property",
    icon: Info,
    content: `All game assets, code, and branding are owned by Sewer Arena:
    • Game rules, mechanics, and artwork are proprietary
    • Your in-game data (stats, game history) belongs to us
    • Reverse engineering, cloning, or unauthorized use is prohibited
    • Wallet addresses are publicly visible on leaderboards (by design)
    • You grant us rights to use your gameplay data for stats/leaderboards
    
    Unauthorized copying or commercial use will result in legal action.`,
  },
  {
    id: "liability",
    title: "Limitation of Liability",
    icon: AlertTriangle,
    content: `We are not liable for:
    • Game bugs, crashes, or unexpected gameplay behavior
    • Loss of mock balances due to platform errors or resets
    • Connection failures, browser crashes, or data loss
    • Third-party wallet integration issues (Solana)
    • Leaderboard disputes or ranking calculation errors
    • Any indirect, incidental, or consequential damages
    
    Use at your own risk. We provide this service "as is" with no warranties.`,
  },
  {
    id: "age",
    title: "18+ Age Requirement",
    icon: AlertTriangle,
    content: `Sewer Arena is for adults only:
    • You must be 18+ (or legal age in your jurisdiction) to play
    • Use by minors is prohibited
    • We reserve the right to ban underage accounts
    • Guardians are responsible for monitoring access
    
    By playing, you confirm you meet age requirements and accept these disclaimers.`,
  },
  {
    id: "responsible",
    title: "Responsible Play",
    icon: Zap,
    content: `We encourage responsible gaming:
    • Play for fun, not profit
    • Set personal limits on playtime
    • Never share your wallet or login credentials
    • Report bugs or abuse via support
    • Take breaks and maintain perspective
    
    If gaming becomes problematic, seek help from a professional.`,
  },
  {
    id: "beta",
    title: "Beta Software Notice",
    icon: Zap,
    content: `This is beta software:
    • Features may change without notice
    • Data may be reset between versions
    • Performance and stability are not guaranteed
    • Critical bugs may occur
    • Backward compatibility is not assured
    
    By playing, you accept that you are testing unfinished software.`,
  },
]

export function DisclaimersContent() {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-12">
      <Accordion type="single" collapsible defaultValue="financial" className="space-y-3">
        {sections.map((section) => {
          const Icon = section.icon
          return (
            <AccordionItem
              key={section.id}
              value={section.id}
              className="border border-destructive/50 rounded-lg px-6 py-4 bg-background/50 hover:bg-background/80 transition-colors data-[state=open]:bg-destructive/5 data-[state=open]:border-destructive/70"
            >
              <AccordionTrigger className="text-lg font-semibold text-foreground hover:text-destructive transition-colors flex items-center gap-3">
                <Icon className="w-5 h-5 text-destructive flex-shrink-0" />
                {section.title}
              </AccordionTrigger>
              <AccordionContent className="text-foreground/80 whitespace-pre-wrap leading-relaxed pt-4 text-sm md:text-base">
                {section.content}
              </AccordionContent>
            </AccordionItem>
          )
        })}
      </Accordion>

      <div className="mt-12 p-6 rounded-lg border border-destructive/50 bg-destructive/5">
        <p className="text-sm text-foreground/70">
          <strong>Legal Notice:</strong> By using Sewer Arena, you acknowledge that you have read and agreed to these
          disclaimers. If you do not agree, do not use this platform. We reserve the right to modify these terms at any
          time.
        </p>
      </div>
    </div>
  )
}
