"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Download, Copy, Check } from "lucide-react"

interface DocsViewerProps {
  docName: string
}

export function DocsViewer({ docName }: DocsViewerProps) {
  const [content, setContent] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [tableOfContents, setTableOfContents] = useState<Array<{ level: number; text: string; id: string }>>([])

  useEffect(() => {
    const fetchDoc = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/admin/docs?file=${docName}`)
        if (!response.ok) throw new Error("Failed to fetch document")
        const data = await response.json()
        setContent(data.content)

        // Generate table of contents from markdown headers
        const lines = data.content.split("\n")
        const toc: Array<{ level: number; text: string; id: string }> = []
        lines.forEach((line: string) => {
          const match = line.match(/^(#+)\s+(.+)$/)
          if (match) {
            const level = match[1].length
            const text = match[2]
            const id = text.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "")
            toc.push({ level, text, id })
          }
        })
        setTableOfContents(toc)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load document")
      } finally {
        setLoading(false)
      }
    }

    fetchDoc()
  }, [docName])

  const handleCopyLink = () => {
    const url = `${window.location.origin}/admin/docs?file=${docName}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleExportPDF = async () => {
    try {
      const element = document.getElementById("doc-content")
      if (!element) return

      // Basic HTML to PDF conversion (requires print-to-pdf browser feature)
      window.print()
    } catch (err) {
      console.error("PDF export failed:", err)
    }
  }

  if (loading) {
    return <div className="text-neon-cyan/50 p-6">Loading document...</div>
  }

  if (error) {
    return <div className="text-neon-red p-6">Error: {error}</div>
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="border-b border-neon-pink/20 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold text-neon-pink drop-shadow-lg" style={{ textShadow: "0 0 10px rgba(255, 20, 147, 0.5)" }}>
            {docName.replace(/-/g, " ").replace(/\.md$/, "")}
          </h2>
          <div className="flex gap-2">
            <Button
              onClick={handleCopyLink}
              variant="outline"
              size="sm"
              className="border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/10 bg-transparent"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? "Copied" : "Copy Link"}
            </Button>
            <Button
              onClick={handleExportPDF}
              variant="outline"
              size="sm"
              className="border-neon-lime/30 text-neon-lime hover:bg-neon-lime/10 bg-transparent"
            >
              <Download size={16} />
              Export PDF
            </Button>
          </div>
        </div>

        {/* Table of Contents */}
        {tableOfContents.length > 0 && (
          <div className="border-t border-neon-pink/20 pt-4">
            <h3 className="text-sm font-bold text-neon-cyan mb-2">Table of Contents</h3>
            <ul className="space-y-1">
              {tableOfContents.map((item) => (
                <li key={item.id} style={{ paddingLeft: `${(item.level - 2) * 1.5}rem` }}>
                  <a href={`#${item.id}`} className="text-xs text-neon-pink/70 hover:text-neon-pink transition-colors">
                    {item.text}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div
          id="doc-content"
          className="prose prose-invert max-w-none prose-headings:text-neon-pink prose-p:text-neon-cyan/80 prose-a:text-neon-pink prose-code:text-neon-lime prose-pre:bg-neon-pink/10 prose-table:border-neon-pink/30"
          dangerouslySetInnerHTML={{
            __html: content
              .split("\n")
              .map((line) => {
                // Convert markdown to HTML (basic)
                if (line.startsWith("# ")) return `<h1>${line.slice(2)}</h1>`
                if (line.startsWith("## ")) return `<h2>${line.slice(3)}</h2>`
                if (line.startsWith("### ")) return `<h3>${line.slice(4)}</h3>`
                if (line.startsWith("- ")) return `<li>${line.slice(2)}</li>`
                if (line.startsWith("| ")) return `<table><tr><td>${line.slice(2)}</td></tr></table>`
                if (line.match(/^```/)) return "<pre>"
                if (line.trim() === "") return "<br/>"
                return `<p>${line}</p>`
              })
              .join(""),
          }}
        />
      </div>
    </div>
  )
}
