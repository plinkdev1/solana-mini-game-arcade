"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"

export function DocsSidebar() {
  const [docs, setDocs] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const searchParams = useSearchParams()
  const currentFile = searchParams.get("file") || "index"

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const response = await fetch("/api/admin/docs?list=true")
        if (!response.ok) throw new Error("Failed to fetch docs list")
        const data = await response.json()
        setDocs(data.files)
      } catch (err) {
        console.error("Failed to load docs list:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchDocs()
  }, [])

  const categories = {
    "Getting Started": ["index"],
    Features: ["implemented-scopes", "to-be-implemented"],
    Roadmap: ["future-expansions"],
    Reference: ["audit-assessment", "deployment-checklist"],
  }

  return (
    <div className="w-64 border-r border-neon-pink/20 bg-background overflow-auto">
      <div className="p-6 border-b border-neon-pink/20">
        <h2 className="font-bold text-neon-pink mb-2">Documentation</h2>
        <p className="text-xs text-neon-cyan/50">Browse project docs</p>
      </div>

      <nav className="p-4 space-y-4">
        {loading ? (
          <p className="text-xs text-neon-cyan/50">Loading...</p>
        ) : (
          Object.entries(categories).map(([category, files]) => (
            <div key={category}>
              <h3 className="text-xs font-bold text-neon-pink/70 uppercase mb-2">{category}</h3>
              <ul className="space-y-1">
                {files
                  .filter((file) => docs.includes(file))
                  .map((file) => (
                    <li key={file}>
                      <Link href={`/admin/docs?file=${file}`}>
                        <Button
                          variant={currentFile === file ? "default" : "outline"}
                          className={`w-full justify-start gap-2 text-sm ${
                            currentFile === file
                              ? "bg-neon-pink text-black hover:bg-neon-pink/80"
                              : "border-neon-pink/30 text-neon-pink hover:bg-neon-pink/10"
                          }`}
                        >
                          {currentFile === file && <ChevronRight size={14} />}
                          {file.replace(/-/g, " ")}
                        </Button>
                      </Link>
                    </li>
                  ))}
              </ul>
            </div>
          ))
        )}
      </nav>
    </div>
  )
}
