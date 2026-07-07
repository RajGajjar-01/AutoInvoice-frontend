import { readdir } from "node:fs/promises"
import path from "node:path"
import { expect, test } from "@playwright/test"

const repoRoot = path.resolve(import.meta.dirname, "..")
const ignoredDirectories = new Set([
  "node_modules",
  "dist",
  "playwright-report",
  "test-results",
])

async function collectJavaScriptFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(directory, entry.name)

      if (entry.isDirectory()) {
        if (ignoredDirectories.has(entry.name)) {
          return []
        }

        return collectJavaScriptFiles(fullPath)
      }

      if (entry.isFile() && /\.(jsx|js)$/.test(entry.name)) {
        return [path.relative(repoRoot, fullPath)]
      }

      return []
    }),
  )

  return files.flat().sort()
}

test("frontend code, config, and tests are TypeScript-only", async () => {
  await expect(collectJavaScriptFiles(repoRoot)).resolves.toEqual([])
})
