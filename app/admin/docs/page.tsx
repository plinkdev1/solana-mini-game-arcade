"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { DocsViewer } from "@/app/admin/components/docs-viewer"
import { DocsSidebar } from "@/app/admin/components/docs-sidebar"

function DocsContent() {
  const searchParams = useSearchParams()
  const file = searchParams.get("file") || "index"

  return (
    <div className="flex-1 flex overflow-hidden">
      <DocsSidebar />
      <DocsViewer docName={file} />
    </div>
  )
}

export default function DocsPage() {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center text-neon-cyan/50">Loading docs...</div>}>
      <DocsContent />
    </Suspense>
  )
}
