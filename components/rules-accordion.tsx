"use client"

import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { Zap, Dices, Crown, Grid3x3, Trophy, Gamepad2, DollarSign, Wallet } from "lucide-react"

export function RulesAccordion() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 px-6">
      <Accordion type="single" collapsible className="space-y-4">
        {/* Tic-Tac-Toe */}
        <AccordionItem
          value="tic-tac-toe"
          className="border border-pink-500/30 rounded-lg px-4 hover:border-pink-500/60 transition"
        >
          <AccordionTrigger className="text-lg font-semibold flex items-center gap-3">
            <Dices className="w-5 h-5 text-pink-500" />
            Poop Tic-Tac-Toe
          </AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-3">
            <div>
              <h4 className="font-semibold text-foreground mb-2">Objective</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>Get 3 of your symbols in a row (horizontal, vertical, or diagonal)</li>
                <li>Block opponent from achieving 3-in-row</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Betting</h4>
              <p>0.01–0.1 $DATX per player. Winner takes 90% of pot, 7% to Treasury, 3% to Team.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">El Shito Power-Up</h4>
              <p>Random chance to place two marks in one turn – flush your opponent with style.</p>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Checkers */}
        <AccordionItem
          value="checkers"
          className="border border-pink-500/30 rounded-lg px-4 hover:border-pink-500/60 transition"
        >
          <AccordionTrigger className="text-lg font-semibold flex items-center gap-3">
            <Crown className="w-5 h-5 text-pink-500" />
            Poop Checkers
          </AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-3">
            <div>
              <h4 className="font-semibold text-foreground mb-2">Core Rules</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>Move pieces diagonally on dark squares only</li>
                <li>Capture opponent pieces by jumping over them</li>
                <li>Mandatory jumps if available (chain jumps required)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Kings</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>Reach the back row to become a King</li>
                <li>Kings move unlimited distance diagonally (forward/backward)</li>
                <li>30-second timer after king promotion – timeout loses the game</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Betting</h4>
              <p>0.01–0.1 $DATX per player. 10% rake split applies to all outcomes.</p>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Gomoku */}
        <AccordionItem
          value="gomoku"
          className="border border-pink-500/30 rounded-lg px-4 hover:border-pink-500/60 transition"
        >
          <AccordionTrigger className="text-lg font-semibold flex items-center gap-3">
            <Grid3x3 className="w-5 h-5 text-pink-500" />
            Infinite Poop Gomoku
          </AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-3">
            <div>
              <h4 className="font-semibold text-foreground mb-2">Objective</h4>
              <p>Get 5 of your symbols in a row on an infinite board to dominate the sewer.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Gameplay</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>Players alternate placing symbols</li>
                <li>Board expands dynamically</li>
                <li>First to 5-in-a-row (any direction) wins</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Betting</h4>
              <p>0.01–0.1 $DATX per player. Winner gets 90% of combined pot.</p>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Dots & Boxes */}
        <AccordionItem
          value="dots-boxes"
          className="border border-pink-500/30 rounded-lg px-4 hover:border-pink-500/60 transition"
        >
          <AccordionTrigger className="text-lg font-semibold flex items-center gap-3">
            <Zap className="w-5 h-5 text-pink-500" />
            Poop Boxes
          </AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-3">
            <div>
              <h4 className="font-semibold text-foreground mb-2">Objective</h4>
              <p>Complete more boxes than your opponent by drawing the final line of each box.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Gameplay</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>Players take turns drawing lines between dots</li>
                <li>Completing a box scores 1 point and grants another turn</li>
                <li>Most boxes completed wins</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Betting</h4>
              <p>0.01–0.1 $DATX per player. 10% rake deducted on game end.</p>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Halma */}
        <AccordionItem
          value="halma"
          className="border border-pink-500/30 rounded-lg px-4 hover:border-pink-500/60 transition"
        >
          <AccordionTrigger className="text-lg font-semibold flex items-center gap-3">
            <Trophy className="w-5 h-5 text-pink-500" />
            Poop Halma
          </AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-3">
            <div>
              <h4 className="font-semibold text-foreground mb-2">Objective</h4>
              <p>Move all your pieces from one corner to the opposite corner of the board.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Gameplay</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>Players take turns moving pieces</li>
                <li>Move pieces one space horizontally, vertically, or diagonally</li>
                <li>Jump over adjacent pieces (multi-jump allowed)</li>
                <li>First player to reach target corner wins</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Betting</h4>
              <p>0.01–0.1 $DATX per player. Winner receives 90% of full pot.</p>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Nine Men's Morris */}
        <AccordionItem
          value="nine-mills"
          className="border border-pink-500/30 rounded-lg px-4 hover:border-pink-500/60 transition"
        >
          <AccordionTrigger className="text-lg font-semibold flex items-center gap-3">
            <Gamepad2 className="w-5 h-5 text-pink-500" />
            Poop Mills
          </AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-3">
            <div>
              <h4 className="font-semibold text-foreground mb-2">Objective</h4>
              <p>Form mills (3-in-a-row) to capture opponent pieces and reduce them to 2 pieces.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Gameplay</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>Place 9 pieces on board nodes</li>
                <li>Form a mill = remove opponent piece</li>
                <li>Once all placed, pieces move along lines</li>
                <li>Win by reducing opponent to 2 pieces</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Betting</h4>
              <p>0.01–0.1 $DATX per player. 10% rake applies to all outcomes.</p>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Battle Flush */}
        <AccordionItem
          value="battleship"
          className="border border-cyan-500/30 rounded-lg px-4 hover:border-cyan-500/60 transition"
        >
          <AccordionTrigger className="text-lg font-semibold flex items-center gap-3">
            <Zap className="w-5 h-5 text-cyan-500" />
            Battle Breach (Battleship)
          </AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-3">
            <div>
              <h4 className="font-semibold text-foreground mb-2">Objective</h4>
              <p>Sink all opponent plunger fleet ships before they sink yours.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Gameplay</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>Place 5 ships on 10x10 grid (Battleship, Cruiser, Destroyer, Submarine, Patrol Boat)</li>
                <li>Take turns guessing opponent ship locations by clicking grid squares</li>
                <li>Hits damage ships, misses reveal nothing</li>
                <li>First player to sink all opponent ships wins</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Betting</h4>
              <p>0.05 $DATX per player. Winner gets 90% of combined pot, 7% to Treasury, 3% to Team.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">El Shito Power-Up</h4>
              <p>Radar Swirl: Reveal one hidden enemy ship location – scout the sewers!</p>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Ludo Leak */}
        <AccordionItem
          value="ludo"
          className="border border-green-500/30 rounded-lg px-4 hover:border-green-500/60 transition"
        >
          <AccordionTrigger className="text-lg font-semibold flex items-center gap-3">
            <Dices className="w-5 h-5 text-green-500" />
            Ludo Leak (Ludo)
          </AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-3">
            <div>
              <h4 className="font-semibold text-foreground mb-2">Objective</h4>
              <p>Home all 4 pieces before opponent – race to flush them all home.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Gameplay</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>Roll dice to move pieces around 58-position board</li>
                <li>Roll 6 to enter or move again</li>
                <li>Land on opponent piece to send them back</li>
                <li>First to home all pieces wins</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Betting</h4>
              <p>0.04 $DATX per player. Standard 10% rake split applies.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">El Shito Power-Up</h4>
              <p>Plunger Roll: Extra dice roll to leap ahead – suction your way to victory!</p>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Go with the Flow */}
        <AccordionItem
          value="go"
          className="border border-purple-500/30 rounded-lg px-4 hover:border-purple-500/60 transition"
        >
          <AccordionTrigger className="text-lg font-semibold flex items-center gap-3">
            <Grid3x3 className="w-5 h-5 text-purple-500" />
            Go with the Flow (Go)
          </AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-3">
            <div>
              <h4 className="font-semibold text-foreground mb-2">Objective</h4>
              <p>Control more territory than opponent on 19x19 board – dominate the sewer grid.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Gameplay</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>Place black/white stones on intersections</li>
                <li>Capture opponent stones by surrounding them (cut liberties)</li>
                <li>Claim territory by surrounding empty spaces</li>
                <li>Highest territory score with Komi handicap wins</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Betting</h4>
              <p>0.1 $DATX per player. Winner takes 90% of full pot.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">El Shito Power-Up</h4>
              <p>Clog Territory: Block opponent area temporarily – spread the sludge!</p>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Scrabble Sludge */}
        <AccordionItem
          value="scrabble"
          className="border border-yellow-500/30 rounded-lg px-4 hover:border-yellow-500/60 transition"
        >
          <AccordionTrigger className="text-lg font-semibold flex items-center gap-3">
            <Gamepad2 className="w-5 h-5 text-yellow-500" />
            Scrabble Sludge (Scrabble)
          </AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-3">
            <div>
              <h4 className="font-semibold text-foreground mb-2">Objective</h4>
              <p>Form words on 15x15 grid to reach 500+ points first – spell your dominance.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Gameplay</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>Draw 7 letter tiles from rack</li>
                <li>Drag tiles to board to form words (minimum 2 letters)</li>
                <li>Score based on letter values (A=1, Z=10)</li>
                <li>Lore words FLUSH (+50), CLOG (+40) grant bonus points</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Betting</h4>
              <p>0.06 $DATX per player. First to 500 points wins rake split.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">El Shito Power-Up</h4>
              <p>Swirl Triple: 3x word score multiplier – triple your sludge score!</p>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Ticket Flush */}
        <AccordionItem
          value="ticket-to-ride"
          className="border border-orange-500/30 rounded-lg px-4 hover:border-orange-500/60 transition"
        >
          <AccordionTrigger className="text-lg font-semibold flex items-center gap-3">
            <Trophy className="w-5 h-5 text-orange-500" />
            Transit Trench (Ticket to Ride)
          </AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-3">
            <div>
              <h4 className="font-semibold text-foreground mb-2">Objective</h4>
              <p>Claim sewer pipe routes between cities to dominate the network – connect the flow.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Gameplay</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>Draw route cards and claim colored routes by matching card colors</li>
                <li>Each route claims points based on distance (distance × 2 + 10)</li>
                <li>First to claim 5 routes or highest score wins</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Betting</h4>
              <p>0.08 $DATX per player. Winner claims 90% of combined pot.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">El Shito Power-Up</h4>
              <p>Plunger Route: Draw extra route cards – extend your pipeline!</p>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Risk Clog */}
        <AccordionItem
          value="risk"
          className="border border-red-500/30 rounded-lg px-4 hover:border-red-500/60 transition"
        >
          <AccordionTrigger className="text-lg font-semibold flex items-center gap-3">
            <Crown className="w-5 h-5 text-red-500" />
            Risk the Rats (Risk)
          </AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-3">
            <div>
              <h4 className="font-semibold text-foreground mb-2">Objective</h4>
              <p>Conquer all sewer territories with your poop troop armies – dominate the sewers.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Gameplay</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>Place army units in territories during placement phase</li>
                <li>Attack adjacent territories by rolling dice</li>
                <li>Highest roll wins – move victorious armies forward</li>
                <li>Control all territories to win</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Betting</h4>
              <p>0.1 $DATX per player. Conquest yields 90% pot to victor.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">El Shito Power-Up</h4>
              <p>Clog Attack: Extra attack die – roll for overwhelming plunger force!</p>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Poop Poker */}
        <AccordionItem
          value="poker"
          className="border border-blue-500/30 rounded-lg px-4 hover:border-blue-500/60 transition"
        >
          <AccordionTrigger className="text-lg font-semibold flex items-center gap-3">
            <Wallet className="w-5 h-5 text-blue-500" />
            Poker Pit (Texas Hold'em)
          </AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-3">
            <div>
              <h4 className="font-semibold text-foreground mb-2">Objective</h4>
              <p>Win chips by making best 5-card hand or bluffing opponents to fold – read the sludge.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Gameplay</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>Receive 2 hole cards (private)</li>
                <li>Betting rounds: Pre-flop, Flop (3 community cards), Turn (4th), River (5th)</li>
                <li>Form best 5-card hand: high card through royal flush</li>
                <li>Highest hand wins pot at showdown</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Betting</h4>
              <p>0.05 $DATX per player. Fold/Call/Raise through 4 betting rounds.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">El Shito Power-Up</h4>
              <p>Bandana Bluff: Hide hand – read the room and bluff with confidence!</p>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Rummy Clog */}
        <AccordionItem
          value="rummy"
          className="border border-indigo-500/30 rounded-lg px-4 hover:border-indigo-500/60 transition"
        >
          <AccordionTrigger className="text-lg font-semibold flex items-center gap-3">
            <Zap className="w-5 h-5 text-indigo-500" />
            Rummy Rush (Rummy)
          </AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-3">
            <div>
              <h4 className="font-semibold text-foreground mb-2">Objective</h4>
              <p>Meld all cards into sets/runs to empty hand first – clog the table with strategy.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Gameplay</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>Hold 10 cards, draw/discard each turn</li>
                <li>Form sets (3+ same rank, "clog groups") or runs (3+ consecutive same suit)</li>
                <li>Meld cards to table to reduce hand size</li>
                <li>First to empty hand wins 100 points + opponent hand penalties</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Betting</h4>
              <p>0.04 $DATX per player. Winner takes 90% combined pot.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">El Shito Power-Up</h4>
              <p>Swirl Draw: Extra card draw – clog up your hand with power!</p>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Uno Flush */}
        <AccordionItem
          value="uno"
          className="border border-lime-500/30 rounded-lg px-4 hover:border-lime-500/60 transition"
        >
          <AccordionTrigger className="text-lg font-semibold flex items-center gap-3">
            <Gamepad2 className="w-5 h-5 text-lime-500" />
            Uno Underground (Uno)
          </AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-3">
            <div>
              <h4 className="font-semibold text-foreground mb-2">Objective</h4>
              <p>Empty hand first by playing matching color/number cards – flush the deck!</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Gameplay</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>Draw 7 cards to start</li>
                <li>Play cards matching top discard by color or number</li>
                <li>Action cards: Skip (next player), Reverse (direction), +2 (draw 2)</li>
                <li>Wild/+4 Wild cards: play anytime, choose new color</li>
                <li>First to empty hand wins</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Betting</h4>
              <p>0.03 $DATX per player. Lowest bet for quick sewer thrills.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">El Shito Power-Up</h4>
              <p>Plunger Wild: Extra wild card – reverse the tide and flush your foes!</p>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* General Betting Rules */}
        <AccordionItem
          value="general-betting"
          className="border border-amber-500/30 rounded-lg px-4 hover:border-amber-500/60 transition"
        >
          <AccordionTrigger className="text-lg font-semibold flex items-center gap-3">
            <DollarSign className="w-5 h-5 text-amber-500" />
            General Betting Rules
          </AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-3">
            <div>
              <h4 className="font-semibold text-foreground mb-2">Bet Flow</h4>
              <ol className="list-decimal list-inside space-y-1">
                <li>Connect your wallet (required)</li>
                <li>Enter bet amount: 0.01–0.1 $DATX</li>
                <li>Both players fund escrow (mock or real)</li>
                <li>Play game – first to win condition wins pot</li>
              </ol>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Reserve Hole Rake (10% Total)</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>7% goes to Treasury (DAO wallet)</li>
                <li>3% goes to Team wallet</li>
                <li>Rake applied to all game outcomes (win/loss/draw)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Payouts</h4>
              <p>Winner receives 90% of combined pot. Loser receives nothing. Rake split goes to Treasury/Team.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Mock Mode (Testing)</h4>
              <p>
                All bets are simulated with mock $DATX. Real on-chain transactions will replace mock mode after launch.
              </p>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Wallet & Connection */}
        <AccordionItem
          value="wallet"
          className="border border-cyan-500/30 rounded-lg px-4 hover:border-cyan-500/60 transition"
        >
          <AccordionTrigger className="text-lg font-semibold flex items-center gap-3">
            <Wallet className="w-5 h-5 text-cyan-500" />
            Wallet Connection
          </AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-3">
            <div>
              <h4 className="font-semibold text-foreground mb-2">Required for Betting</h4>
              <p>Click "Connect Wallet" in header to link Phantom, Solflare, or Ledger wallet.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Supported Networks</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>Solana Mainnet (production)</li>
                <li>Devnet (testing)</li>
                <li>Mock mode (no transaction)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">$DATX Token</h4>
              <p>Betting uses $DATX token. Ensure wallet has sufficient balance before placing bets.</p>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
