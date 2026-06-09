import { readFile } from "fs/promises"
import { join } from "path"
import { NextRequest, NextResponse } from "next/server"

// Allowed docs to prevent directory traversal
const ALLOWED_DOCS = ["index", "implemented-scopes", "to-be-implemented", "future-expansions", "audit-assessment", "deployment-checklist"]

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const listParam = searchParams.get("list")
    const fileParam = searchParams.get("file")

    if (listParam === "true") {
      // Return list of available docs
      return NextResponse.json({ files: ALLOWED_DOCS })
    }

    if (!fileParam || !ALLOWED_DOCS.includes(fileParam)) {
      return NextResponse.json({ error: "Invalid or missing file parameter" }, { status: 400 })
    }

    // Read markdown file from docs folder
    const docsDir = join(process.cwd(), "docs")
    const filePath = join(docsDir, `${fileParam}.md`)

    const content = await readFile(filePath, "utf-8")

    return NextResponse.json({ content, fileName: fileParam })
  } catch (error) {
    console.error("Failed to fetch doc:", error)
    return NextResponse.json({ error: "Failed to load document" }, { status: 500 })
  }
}
