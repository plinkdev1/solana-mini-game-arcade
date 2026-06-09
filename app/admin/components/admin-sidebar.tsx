"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAdminStore } from "@/lib/stores/admin-store"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Menu, X, Settings, MessageSquare, BarChart3, TrendingUp, LogOut, BookOpen } from "lucide-react"
import { useState } from "react"

const sections = [
  { name: "Settings", href: "/admin/settings", icon: Settings },
  { name: "Feedback", href: "/admin/feedback", icon: MessageSquare },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { name: "Stats", href: "/admin/stats", icon: TrendingUp },
  { name: "Docs", href: "/admin/docs", icon: BookOpen },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { logout, isAuthenticated } = useAdminStore()
  const { toast } = useToast()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => {
    logout()
    // Clear session storage
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("admin_token")
      sessionStorage.removeItem("admin_token_expires")
    }
    toast({
      title: "Logged Out",
      description: "Admin session ended. Redirecting...",
      className: "border-neon-red bg-neon-red/10 text-neon-red",
    })
    // Redirect to home after logout
    setTimeout(() => router.push("/"), 1000)
  }

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-50 md:hidden p-2 rounded-lg bg-neon-pink/20 hover:bg-neon-pink/30 text-neon-pink"
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <nav
        className={cn(
          "fixed md:static inset-y-0 left-0 z-40 w-64 bg-background border-r border-neon-pink/20 transition-transform",
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        <div className="p-6 border-b border-neon-pink/20">
          <h1
            className="text-2xl font-bold text-neon-pink drop-shadow-lg"
            style={{ textShadow: "0 0 10px rgba(255, 20, 147, 0.5)" }}
          >
            El Shito Admin
          </h1>
          <p className="text-neon-cyan/70 text-sm mt-2">Flush Control Panel</p>
          {isAuthenticated && (
            <div className="mt-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-neon-lime animate-pulse" />
              <span className="text-xs text-neon-lime">Authenticated</span>
            </div>
          )}
        </div>

        <div className="p-4 space-y-2">
          {sections.map(({ name, href, icon: Icon }) => (
            <Link key={href} href={href}>
              <Button
                variant={pathname === href ? "default" : "outline"}
                className={cn(
                  "w-full justify-start gap-3",
                  pathname === href
                    ? "bg-neon-pink text-black hover:bg-neon-pink/80"
                    : "border-neon-pink/30 text-neon-pink hover:bg-neon-pink/10",
                )}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon size={18} />
                {name}
              </Button>
            </Link>
          ))}
        </div>

        <div className="absolute bottom-6 left-4 right-4">
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full justify-start gap-3 border-neon-red/30 text-neon-red hover:bg-neon-red/10 bg-transparent"
          >
            <LogOut size={18} />
            Logout Admin
          </Button>
        </div>
      </nav>
    </>
  )
}
