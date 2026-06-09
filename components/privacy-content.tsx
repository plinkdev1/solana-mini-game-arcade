"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const sections = [
  {
    id: "collected",
    title: "Data We Collect",
    content: `We collect minimal data necessary for gameplay:
    • Wallet address (Solana public key) for leaderboard identification
    • Game moves and outcomes (for stats and leaderboard ranking)
    • Mock balance data (gameplay only, never stored with real value)
    • Session data for turn management and game state
    
    We do NOT collect personally identifiable information (PII), email addresses, real names, or payment methods beyond what Solana auth provides.`,
  },
  {
    id: "purpose",
    title: "Purpose of Data Use",
    content: `Your data is used solely for:
    • Displaying your personal stats dashboard (wins, losses, win rate)
    • Calculating your leaderboard rank globally
    • Managing game turns and preventing stalling
    • Securing your mock bets in the betting system
    • Improving game mechanics and balancing
    
    Your data is never used for marketing, profiling, or any secondary purpose.`,
  },
  {
    id: "storage",
    title: "Data Storage & Security",
    content: `Data is stored in multiple locations for redundancy:
    • Browser localStorage (game state, personal stats)
    • Supabase EU servers (leaderboard, game history) - encrypted at rest
    • All data is encrypted in transit (HTTPS)
    
    We follow EU data protection standards. Data is retained for as long as your account is active. Upon account deletion (see Rights below), all associated data is permanently removed.`,
  },
  {
    id: "sharing",
    title: "Data Sharing",
    content: `We do not share your data with third parties. Your wallet address is visible on the public leaderboard (by design), but no other personal data is shared. 
    
    Exception: If legally required by EU authorities, we comply with lawful requests while notifying users when possible.`,
  },
  {
    id: "rights",
    title: "Your Privacy Rights (GDPR)",
    content: `You have the following rights under GDPR:
    • Right of Access: Request a copy of all your data
    • Right to Erasure: Delete your account and all associated data
    • Right to Rectification: Correct inaccurate data
    • Right to Portability: Export your stats and game history
    • Right to Restrict Processing: Pause data collection
    
    To exercise any right, contact support via the site. Requests are processed within 30 days.`,
  },
  {
    id: "cookies",
    title: "Cookies & Tracking",
    content: `We use only essential cookies for core functionality:
    • Session cookies (game state, user authentication)
    • localStorage tokens (wallet connection, game history)
    
    We do NOT use third-party analytics, ad tracking, or non-essential cookies. No Google Analytics, no ad pixels.`,
  },
  {
    id: "changes",
    title: "Policy Changes",
    content: `We will notify you of any material changes to this policy:
    • Updated policy will be posted on this page with effective date
    • Major changes (data types, usage) will be announced on-site
    • Your continued use of Sewer Arena implies acceptance of updates
    
    Check this page regularly for updates. Last updated: January 2026.`,
  },
  {
    id: "explicit",
    title: "Explicit Statements",
    content: `Clear guarantees:
    • We don't sell your data to brokers or advertisers
    • This is a solo project – no corporate overhead or investor pressure
    • Your mock bets are for gameplay only – no real financial exposure
    • EU servers and GDPR compliance are non-negotiable
    • Deletion means deletion – no hidden backups or dark data`,
  },
]

export function PrivacyContent() {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-12">
      <Accordion type="single" collapsible defaultValue="collected" className="space-y-3">
        {sections.map((section) => (
          <AccordionItem
            key={section.id}
            value={section.id}
            className="border border-accent/50 rounded-lg px-6 py-4 bg-background/50 hover:bg-background/80 transition-colors data-[state=open]:bg-background/80 data-[state=open]:border-primary/50"
          >
            <AccordionTrigger className="text-lg font-semibold text-foreground hover:text-primary transition-colors">
              {section.title}
            </AccordionTrigger>
            <AccordionContent className="text-foreground/80 whitespace-pre-wrap leading-relaxed pt-4 text-sm md:text-base">
              {section.content}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <div className="mt-12 p-6 rounded-lg border border-primary/50 bg-primary/5">
        <p className="text-sm text-foreground/70">
          <strong>Contact Privacy Officer:</strong> For data requests, deletions, or privacy concerns, reach out via the
          site's support link. Response time: 30 days maximum (GDPR compliant).
        </p>
      </div>
    </div>
  )
}
