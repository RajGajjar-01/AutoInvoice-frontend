import { toast } from "sonner"

const isAbort = (e: unknown) =>
  e instanceof DOMException && e.name === "AbortError"

/** True on phones (and some desktops) that can put a file in the native share sheet. */
export function canShareFiles() {
  if (typeof navigator === "undefined" || !navigator.canShare) return false
  const probe = new File([""], "x.pdf", { type: "application/pdf" })
  return navigator.canShare({ files: [probe] })
}

function download(file: File) {
  const url = URL.createObjectURL(file)
  const a = document.createElement("a")
  a.href = url
  a.download = file.name
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/**
 * Opens the share sheet with the file, or downloads it where sharing is not possible.
 * Safari drops the tap after a slow PDF build (NotAllowedError); then one more tap on
 * the toast opens the sheet.
 */
export async function shareFile(file: File, title: string, text?: string) {
  const data = { files: [file], title, text }
  if (!navigator.canShare?.(data)) return download(file)
  try {
    await navigator.share(data)
  } catch (e) {
    if (isAbort(e)) return
    if (e instanceof DOMException && e.name === "NotAllowedError") {
      toast("Your PDF is ready", {
        duration: 15000,
        action: {
          label: "Share",
          onClick: () => navigator.share(data).catch(() => {}),
        },
      })
      return
    }
    download(file)
  }
}

/** Shares a short text. Copies it to the clipboard where there is no share sheet. */
export async function shareText(title: string, text: string) {
  if (navigator.share) {
    try {
      await navigator.share({ title, text })
    } catch (e) {
      if (!isAbort(e)) toast.error("Could not open the share sheet")
    }
    return
  }
  await navigator.clipboard.writeText(text)
  toast.success("Copied to clipboard")
}
