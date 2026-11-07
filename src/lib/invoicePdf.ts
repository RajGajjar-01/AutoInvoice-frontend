import axios from "axios"
import { OpenAPI } from "@/client"
import { api } from "@/lib/api"

/**
 * Invoice PDFs are made by the backend from the saved invoice, on request.
 * Nothing is rendered or stored in the browser.
 */

export interface InvoicePdfOptions {
  /** Built-in template id. The backend uses the active template when omitted. */
  template?: string
}

const invoiceUrl = (id: string, path: "pdf" | "preview-html") =>
  `${OpenAPI.BASE}/api/v1/invoices/${encodeURIComponent(id)}/${path}`

/** Same file name the backend uses: "invoice_INV-001.pdf", "delivery_challan_…". */
export function invoicePdfFilename(
  documentTitle: string,
  invoiceNumber: string,
): string {
  const label = documentTitle.trim().toLowerCase().replace(/\s+/g, "_")
  return `${label || "invoice"}_${invoiceNumber}.pdf`
}

/** Error responses arrive as a Blob when responseType is "blob". */
async function readErrorDetail(error: unknown): Promise<string | undefined> {
  if (!axios.isAxiosError(error)) return undefined
  const data: unknown = error.response?.data
  try {
    const text = data instanceof Blob ? await data.text() : JSON.stringify(data)
    const parsed: unknown = JSON.parse(text)
    if (parsed && typeof parsed === "object" && "detail" in parsed) {
      const detail = (parsed as { detail: unknown }).detail
      if (typeof detail === "string") return detail
    }
  } catch {
    // Not JSON: fall through to the generic message.
  }
  return undefined
}

export class InvoicePdfError extends Error {}

/** Downloads the PDF bytes for a saved invoice as a File. */
export async function fetchInvoicePdf(
  id: string,
  filename: string,
  options: InvoicePdfOptions = {},
): Promise<File> {
  try {
    const response = await api.get<Blob>(invoiceUrl(id, "pdf"), {
      params: options.template ? { template: options.template } : undefined,
      responseType: "blob",
      withCredentials: true,
      // A cold Lambda plus WeasyPrint can take several seconds.
      timeout: 60_000,
    })
    return new File([response.data], filename, { type: "application/pdf" })
  } catch (error) {
    throw new InvoicePdfError(
      (await readErrorDetail(error)) ?? "Could not create the PDF",
    )
  }
}

/** The exact HTML the backend makes the PDF from, for the preview dialog. */
export async function fetchInvoicePreviewHtml(
  id: string,
  options: InvoicePdfOptions = {},
): Promise<string> {
  const response = await api.get<string>(invoiceUrl(id, "preview-html"), {
    params: options.template ? { template: options.template } : undefined,
    responseType: "text",
    withCredentials: true,
    timeout: 30_000,
  })
  return response.data
}
