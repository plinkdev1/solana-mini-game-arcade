"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Scale, Shield, Gavel, Eye, Zap, Lock } from "lucide-react"

const sections = [
  {
    id: "acceptance",
    title: "Acceptance of Terms",
    icon: Scale,
    content: `By accessing and using Sewer Arena, you agree to be bound by these terms:
    • You acknowledge these are the complete legal agreement
    • Continued use after modifications means acceptance
    • If you don't agree, cease using the platform immediately
    • We reserve the right to refuse service to any user
    • Age 18+ requirement is non-negotiable
    
    These terms are governed by EU law.`,
  },
  {
    id: "userrights",
    title: "User Rights & Responsibilities",
    icon: Shield,
    content: `You retain rights to your account and data:
    • You own your wallet address and associated data
    • You grant us a license to use gameplay data for leaderboards/stats
    • You are responsible for keeping your credentials secure
    • You may not share your account or transfer ownership
    • You must not engage in cheating, exploits, or hacking
    
    Violations may result in permanent account suspension.`,
  },
  {
    id: "conduct",
    title: "Prohibited Conduct",
    icon: Gavel,
    content: `You may not:
    • Cheat or exploit game bugs for unfair advantage
    • Use bots, automation, or unauthorized scripts
    • Harass, spam, or abuse other players
    • Reverse engineer the platform or steal code
    • Attempt to access unauthorized data or accounts
    • Engage in fraudulent wallet transactions
    • Use profanity or abusive language in public chats
    
    Violators face warnings, mutes, or permanent bans.`,
  },
  {
    id: "intellectual",
    title: "Intellectual Property Rights",
    icon: Lock,
    content: `Sewer Arena owns all game IP:
    • All game code, mechanics, artwork, and branding are proprietary
    • Your mock $DATX and stats belong to the platform
    • You cannot monetize, sell, or license game content
    • Fair use (personal non-commercial use) is permitted
    • Streaming/content creation is allowed with credit to Sewer Arena
    
    Unauthorized commercial use will result in legal action.`,
  },
  {
    id: "warranty",
    title: "Warranty Disclaimer",
    icon: Eye,
    content: `This service is provided "as is":
    • No warranties of merchantability or fitness for purpose
    • No guarantee of uninterrupted uptime or bug-free operation
    • Mock data may be reset or lost without compensation
    • We are not liable for third-party wallet failures
    • Beta software may have critical bugs
    
    You use Sewer Arena at your own risk. Back up important data.`,
  },
  {
    id: "liability",
    title: "Limitation of Liability",
    icon: Gavel,
    content: `We are not liable for:
    • Loss of mock balances or game progress
    • Connection failures or data corruption
    • Leaderboard calculation errors
    • Player disputes or ranking appeals
    • Wallet sync or blockchain issues
    • Any indirect or consequential damages
    
    Maximum liability (if any) does not exceed mock $DATX value lost.`,
  },
  {
    id: "privacy",
    title: "Privacy & Data",
    icon: Lock,
    content: `Your data is handled per our Privacy Policy:
    • Wallet addresses are public on leaderboards
    • Game history is retained for stat calculation
    • We don't sell data to third parties
    • GDPR rights are fully supported
    • You can delete your account anytime
    
    See our Privacy Policy for full details on data handling.`,
  },
  {
    id: "mockfunds",
    title: "Mock Currency Terms",
    icon: Zap,
    content: `$DATX mock currency terms:
    • Mock balances are granted for gameplay only
    • No real monetary value whatsoever
    • Mock balances may be reset between updates
    • We reserve the right to adjust starting balances
    • Lost mock funds cannot be recovered or refunded
    • Transfers to other accounts are not permitted
    
    Mock data is never converted to real money.`,
  },
  {
    id: "termination",
    title: "Account Termination",
    icon: Gavel,
    content: `We may suspend or terminate accounts:
    • For violations of these terms
    • For prohibited conduct or cheating
    • For suspicious activity or fraud
    • For extended inactivity (notification provided)
    • At our sole discretion without liability
    
    Upon termination, all data and mock funds are forfeited.`,
  },
  {
    id: "modifications",
    title: "Modification of Terms",
    icon: Scale,
    content: `We may modify these terms:
    • Changes will be posted on this page with effective date
    • Major changes will be announced on-site
    • Your continued use means acceptance
    • We will notify users of material changes if possible
    • Disagreement with changes means you should stop using the platform
    
    Last modified: January 2026.`,
  },
]

export function TermsContent() {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-12">
      <Accordion type="single" collapsible defaultValue="acceptance" className="space-y-3">
        {sections.map((section) => {
          const Icon = section.icon
          return (
            <AccordionItem
              key={section.id}
              value={section.id}
              className="border border-primary/50 rounded-lg px-6 py-4 bg-background/50 hover:bg-background/80 transition-colors data-[state=open]:bg-primary/5 data-[state=open]:border-primary/70"
            >
              <AccordionTrigger className="text-lg font-semibold text-foreground hover:text-primary transition-colors flex items-center gap-3">
                <Icon className="w-5 h-5 text-primary flex-shrink-0" />
                {section.title}
              </AccordionTrigger>
              <AccordionContent className="text-foreground/80 whitespace-pre-wrap leading-relaxed pt-4 text-sm md:text-base">
                {section.content}
              </AccordionContent>
            </AccordionItem>
          )
        })}
      </Accordion>

      <div className="mt-12 p-6 rounded-lg border border-primary/50 bg-primary/5">
        <p className="text-sm text-foreground/70">
          <strong>Effective Date:</strong> January 1, 2026. These terms are binding and enforceable. By using Sewer
          Arena, you accept full responsibility for compliance.
        </p>
      </div>
    </div>
  )
}
