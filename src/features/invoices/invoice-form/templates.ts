import type { InvoiceFormData } from "./constants"
import type {
  BankDetails,
  CompanyDetails,
  ComputedRow,
  InvoiceItem,
  SummaryEntry,
} from "./types"
import { getCurrencySymbol } from "./utils"

interface BuildHtmlParams {
  formData: InvoiceFormData
  companyDetails: CompanyDetails
  items: InvoiceItem[]
  invoiceNumber: string
  selectedTemplate: string
  subtotal: number
  totalTax: number
  itemsDiscount: number
  invoiceDiscount: number
  grandTotal: number
  shippingCharge: number
  extraChargeAmount: number
  extraChargeLabel: string
  activeBankDetails: BankDetails | null
}

export function buildInvoiceHtml(params: BuildHtmlParams): string {
  const {
    formData,
    companyDetails,
    items,
    invoiceNumber,
    selectedTemplate,
    subtotal,
    totalTax,
    itemsDiscount,
    invoiceDiscount,
    grandTotal,
    shippingCharge,
    extraChargeAmount,
    extraChargeLabel,
    activeBankDetails,
  } = params

  const cs = getCurrencySymbol(formData.currency)
  const biz = companyDetails || {}
  const validItems = items.filter((i) => i.name)
  const bizName = biz.name || "Your Business"
  const bizEmail = biz.email || ""
  const bizPhone = biz.phone || ""
  const bizAddress = [biz.address, biz.city, biz.state, biz.pincode]
    .filter(Boolean)
    .join(", ")
  const bizGstin = biz.gstin || ""
  const bizTagline = biz.tagline || ""
  const bizLogo = biz.logo || null
  const invoiceFooterNote = biz.invoiceFooter || "Thank you for your business!"

  const cd = {
    name: formData.customerName,
    address: formData.customerAddress,
    gst: formData.customerGst,
    phone: formData.customerPhone,
    email: formData.customerEmail,
  }

  const computedRows: ComputedRow[] = validItems.map((item, idx) => {
    const lineBase = item.quantity * item.price
    const disc =
      item.discountType === "flat"
        ? Math.min(item.discount || 0, lineBase)
        : lineBase * ((item.discount || 0) / 100)
    const taxable = lineBase - disc
    const lineTax = (taxable * item.tax) / 100
    const lineTotal = taxable + lineTax
    return { item, idx, lineBase, disc, taxable, lineTax, lineTotal }
  })

  const summaryEntries: (SummaryEntry | null)[] = [
    { label: "Subtotal", value: cs + subtotal.toFixed(2) },
    itemsDiscount > 0
      ? {
          label: "Item Discounts",
          value: `-${cs}${itemsDiscount.toFixed(2)}`,
          red: true,
        }
      : null,
    invoiceDiscount > 0
      ? {
          label: "Discount",
          value: `-${cs}${invoiceDiscount.toFixed(2)}`,
          red: true,
        }
      : null,
    totalTax > 0 ? { label: "Tax", value: cs + totalTax.toFixed(2) } : null,
    Number(shippingCharge) > 0
      ? { label: "Shipping", value: cs + Number(shippingCharge).toFixed(2) }
      : null,
    Number(extraChargeAmount) > 0
      ? {
          label: extraChargeLabel || "Extra",
          value: cs + Number(extraChargeAmount).toFixed(2),
        }
      : null,
  ].filter((e): e is SummaryEntry => e !== null)

  const bankHtml = buildBankHtml(activeBankDetails)

  const notes = formData.notes || ""
  const paymentTerms = formData.paymentTerms || ""
  const invoiceDate = formData.invoiceDate
  const dueDate = formData.dueDate
  const poNumber = formData.poNumber
  const placeOfSupply = formData.placeOfSupply

  const summaryRows = summaryEntries
    .map(
      (e) =>
        `<tr><td style="padding:6px 20px 6px 0;font-size:12px;color:#64748b;text-align:right">${e.label}</td><td style="padding:6px 0;font-size:12px;text-align:right;font-family:monospace;color:${e.red ? "#ef4444" : "#1a1a1a"}">${e.value}</td></tr>`,
    )
    .join("")

  if (selectedTemplate === "clean-teal")
    return cleanTealTemplate(computedRows, summaryRows, {
      invoiceNumber,
      invoiceDate,
      dueDate,
      poNumber,
      bizName,
      bizTagline,
      bizAddress,
      bizPhone,
      bizEmail,
      bizGstin,
      cd,
      cs,
      grandTotal,
      notes,
      paymentTerms,
      bankHtml,
      invoiceFooterNote,
      placeOfSupply,
    })

  if (selectedTemplate === "geometric")
    return geometricTemplate(computedRows, summaryRows, {
      invoiceNumber,
      invoiceDate,
      dueDate,
      poNumber,
      bizName,
      bizTagline,
      bizAddress,
      bizPhone,
      bizEmail,
      bizGstin,
      cd,
      cs,
      grandTotal,
      notes,
      paymentTerms,
      bankHtml,
      invoiceFooterNote,
      placeOfSupply,
    })

  if (selectedTemplate === "circle-studio")
    return circleStudioTemplate(computedRows, summaryRows, {
      invoiceNumber,
      invoiceDate,
      dueDate,
      poNumber,
      bizName,
      bizTagline,
      bizEmail,
      bizPhone,
      bizAddress,
      bizLogo,
      cd,
      cs,
      grandTotal,
      notes,
      paymentTerms,
      activeBankDetails,
      bizGstin,
      invoiceFooterNote,
      placeOfSupply,
    })

  if (selectedTemplate === "aizen-bold")
    return aizenBoldTemplate(computedRows, summaryRows, {
      invoiceNumber,
      invoiceDate,
      dueDate,
      poNumber,
      bizName,
      bizTagline,
      bizAddress,
      bizPhone,
      bizEmail,
      bizGstin,
      bizLogo,
      cd,
      cs,
      grandTotal,
      notes,
      paymentTerms,
      bankHtml,
      invoiceFooterNote,
      placeOfSupply,
    })

  return defaultTemplate(
    computedRows,
    invoiceNumber,
    invoiceDate,
    cs,
    grandTotal,
    invoiceFooterNote,
  )
}

function buildBankHtml(activeBankDetails: BankDetails | null): string {
  if (
    !activeBankDetails ||
    (!activeBankDetails.bankName &&
      !activeBankDetails.accountNumber &&
      !activeBankDetails.upi)
  )
    return ""
  return [
    activeBankDetails.bankName
      ? `Bank: <strong>${activeBankDetails.bankName}</strong>`
      : "",
    activeBankDetails.accountName
      ? `A/C Name: <strong>${activeBankDetails.accountName}</strong>`
      : "",
    activeBankDetails.accountNumber
      ? `A/C No: <strong>${activeBankDetails.accountNumber}</strong>`
      : "",
    activeBankDetails.ifsc
      ? `IFSC: <strong>${activeBankDetails.ifsc}</strong>`
      : "",
    activeBankDetails.upi
      ? `UPI: <strong>${activeBankDetails.upi}</strong>`
      : "",
  ]
    .filter(Boolean)
    .join(" &nbsp;|&nbsp; ")
}

interface TemplateContext {
  invoiceNumber: string
  invoiceDate: string
  dueDate: string
  poNumber: string
  bizName: string
  bizTagline: string
  bizAddress: string
  bizPhone: string
  bizEmail: string
  bizGstin: string
  cd: {
    name: string
    address: string
    gst: string
    phone: string
    email: string
  }
  cs: string
  grandTotal: number
  notes: string
  paymentTerms: string
  bankHtml: string
  invoiceFooterNote: string
  placeOfSupply: string
}

function cleanTealTemplate(
  rows: ComputedRow[],
  summaryRows: string,
  ctx: TemplateContext,
): string {
  const itemsHtml = rows
    .map(
      (r, i) =>
        `<tr style="border-bottom:1px solid #e2e8f0;background:${i % 2 === 0 ? "#fff" : "#f0fdfe"}">` +
        `<td style="padding:10px 10px;font-size:11px;text-align:center;border-right:1px solid #e2e8f0;color:#555">${i + 1}</td>` +
        `<td style="padding:10px 12px;font-size:12px;color:#1a1a1a">${r.item.name}${r.item.description ? `<div style="font-size:10px;color:#94a3b8;margin-top:2px">${r.item.description}</div>` : ""}</td>` +
        `<td style="padding:10px 12px;font-size:12px;text-align:right;color:#1a1a1a;font-family:monospace">${ctx.cs}${r.lineTotal.toFixed(2)}</td></tr>`,
    )
    .join("")

  const noteHtml =
    ctx.notes || ctx.paymentTerms
      ? `<tr><td colspan="3" style="padding:12px;font-size:11px;border-top:1px solid #e2e8f0;background:#f8fafc"><strong>Note:</strong> ${ctx.notes || ctx.paymentTerms}</td></tr>`
      : ""

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>INVOICE ${ctx.invoiceNumber}</title>
<style>*{box-sizing:border-box;margin:0;padding:0}html,body{height:100%}body{font-family:Arial,sans-serif;background:#fff;color:#1a1a1a;font-size:13px;min-height:100%}@page{size:A4;margin:0}@media print{html,body{height:100%;-webkit-print-color-adjust:exact;print-color-adjust:exact}}</style></head>
<body>
<div style="max-width:794px;margin:0 auto;min-height:100vh;display:flex;flex-direction:column;background:#fff">
  <div style="flex:1;padding:48px 52px 32px;display:flex;flex-direction:column">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:36px">
      <p style="font-size:56px;font-weight:900;color:#0E7490;letter-spacing:-3px;line-height:1">INVOICE</p>
      <div style="text-align:right;border:1px solid #e2e8f0;padding:14px 18px;font-size:12px;color:#555;min-width:200px">
        <div style="margin-bottom:6px"><span style="color:#94a3b8">Date:</span> ${ctx.invoiceDate}</div>
        <div style="margin-bottom:6px"><span style="color:#94a3b8">Invoice No:</span> ${ctx.invoiceNumber}</div>
        ${ctx.dueDate ? `<div style="margin-bottom:4px"><span style="color:#94a3b8">Due:</span> ${ctx.dueDate}</div>` : ""}
        ${ctx.poNumber ? `<div><span style="color:#94a3b8">PO #:</span> ${ctx.poNumber}</div>` : ""}
      </div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:40px;margin-bottom:36px">
      <div>
        <div style="font-size:11px;font-weight:700;color:#555;border-bottom:2.5px solid #0E7490;padding-bottom:5px;margin-bottom:10px;text-transform:uppercase">From</div>
        <p style="font-weight:700;font-size:14px">${ctx.bizName}</p>
        ${ctx.bizTagline ? `<p style="color:#94a3b8;font-size:11px;margin-top:2px">${ctx.bizTagline}</p>` : ""}
        ${ctx.bizAddress ? `<p style="color:#64748b;font-size:12px;margin-top:4px">${ctx.bizAddress}</p>` : ""}
        ${ctx.bizPhone ? `<p style="color:#64748b;font-size:12px">${ctx.bizPhone}</p>` : ""}
        ${ctx.bizEmail ? `<p style="color:#64748b;font-size:12px">${ctx.bizEmail}</p>` : ""}
        ${ctx.bizGstin ? `<p style="color:#64748b;font-size:11px;margin-top:2px">GSTIN: ${ctx.bizGstin}</p>` : ""}
      </div>
      <div>
        <div style="font-size:11px;font-weight:700;color:#555;border-bottom:2.5px solid #0E7490;padding-bottom:5px;margin-bottom:10px;text-transform:uppercase">Bill To</div>
        <p style="font-weight:700;font-size:14px">${ctx.cd.name || "—"}</p>
        ${ctx.cd.address ? `<p style="color:#64748b;font-size:12px;margin-top:4px;line-height:1.5">${ctx.cd.address}</p>` : ""}
        ${ctx.cd.phone ? `<p style="color:#64748b;font-size:12px">${ctx.cd.phone}</p>` : ""}
        ${ctx.cd.email ? `<p style="color:#64748b;font-size:12px">${ctx.cd.email}</p>` : ""}
        ${ctx.cd.gst ? `<p style="color:#64748b;font-size:11px;margin-top:2px">GSTIN: ${ctx.cd.gst}</p>` : ""}
        ${ctx.placeOfSupply ? `<p style="color:#9ca3af;font-size:11px">Place of Supply: ${ctx.placeOfSupply}</p>` : ""}
      </div>
    </div>
    <table style="width:100%;border-collapse:collapse;border:1px solid #cbd5e1">
      <thead><tr style="background:#0E7490;color:#fff">
        <th style="padding:11px 10px;font-size:11px;text-align:center;width:40px">SL</th>
        <th style="padding:11px 14px;font-size:11px;text-align:left">DESCRIPTION</th>
        <th style="padding:11px 14px;font-size:11px;text-align:right">AMOUNT</th>
      </tr></thead>
      <tbody>${itemsHtml}</tbody>
    </table>
    <div style="display:flex;justify-content:flex-end;margin-top:20px;margin-bottom:20px">
      <table style="border-collapse:collapse;min-width:240px">
        ${summaryRows}
        <tr>
          <td style="padding:12px 20px 12px 0;font-size:14px;font-weight:700;color:#0E7490;text-align:right;border-top:2px solid #0E7490">Grand Total</td>
          <td style="padding:12px 0;font-size:24px;font-weight:900;color:#0E7490;text-align:right;font-family:monospace;border-top:2px solid #0E7490">${ctx.cs}${ctx.grandTotal.toFixed(2)}</td>
        </tr>
      </table>
    </div>
    ${noteHtml ? `<div style="padding:12px;font-size:11px;border:1px solid #e2e8f0;background:#f8fafc;margin-bottom:20px"><strong>Note:</strong> ${ctx.notes || ctx.paymentTerms}</div>` : ""}
    <div style="margin-top:auto;padding-top:32px;display:flex;justify-content:space-between;align-items:flex-end">
      <div style="max-width:320px">
        ${ctx.bankHtml ? `<div style="padding:14px 16px;background:#f0fdfe;border:1px solid #cffafe;font-size:12px;color:#555">${ctx.bankHtml}</div>` : ""}
        ${ctx.notes && !noteHtml ? `<div style="margin-top:16px;padding:12px 16px;background:#f8fafc;border-left:3px solid #0E7490;font-size:12px;color:#555"><strong>Note:</strong> ${ctx.notes}</div>` : ""}
        ${ctx.paymentTerms ? `<div style="margin-top:10px;font-size:11px;color:#64748b"><strong>Payment Terms:</strong> ${ctx.paymentTerms}</div>` : ""}
      </div>
      <div style="text-align:right;min-width:180px">
        <div style="border-top:1.5px solid #0E7490;padding-top:8px">
          <p style="font-size:13px;font-weight:700;color:#0E7490">Authorized Signatory</p>
          <p style="font-size:10px;color:#94a3b8;margin-top:2px">For ${ctx.bizName}</p>
        </div>
      </div>
    </div>
  </div>
  <div style="background:#0E7490;padding:14px 52px;display:flex;justify-content:space-between;align-items:center;margin-top:auto">
    <p style="color:rgba(255,255,255,0.9);font-size:12px;font-style:italic">${ctx.invoiceFooterNote}</p>
    <p style="color:rgba(255,255,255,0.55);font-size:10px">Generated by AutoInvoice</p>
  </div>
</div>
</body></html>`
}

function geometricTemplate(
  rows: ComputedRow[],
  summaryRows: string,
  ctx: TemplateContext,
): string {
  const itemsHtml = rows
    .map(
      (r, i) =>
        `<tr style="border-bottom:1px solid #e2e8f0;background:${i % 2 === 0 ? "#fff" : "#f8fffe"}">` +
        `<td style="padding:10px 10px;font-size:11px;text-align:center;color:#555">${i + 1}</td>` +
        `<td style="padding:10px 12px;font-size:12px;color:#1a1a1a">${r.item.name}${r.item.description ? `<div style="font-size:10px;color:#94a3b8;margin-top:1px">${r.item.description}</div>` : ""}</td>` +
        `<td style="padding:10px 12px;font-size:12px;text-align:center;color:#555">${r.item.quantity}${r.item.unit ? ` ${r.item.unit}` : ""}</td>` +
        `<td style="padding:10px 12px;font-size:12px;text-align:right;font-family:monospace;color:#555">${ctx.cs}${Number(r.item.price).toFixed(2)}</td>` +
        `<td style="padding:10px 12px;font-size:12px;text-align:right;font-family:monospace;font-weight:700;color:#0F766E">${ctx.cs}${r.lineTotal.toFixed(2)}</td></tr>`,
    )
    .join("")

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>INVOICE ${ctx.invoiceNumber}</title>
<style>*{box-sizing:border-box;margin:0;padding:0}html,body{height:100%}body{font-family:Arial,sans-serif;background:#fff;color:#1a1a1a;font-size:13px;min-height:100%}@page{size:A4;margin:0}@media print{html,body{height:100%;-webkit-print-color-adjust:exact;print-color-adjust:exact}}</style></head>
<body>
<div style="max-width:794px;margin:0 auto;min-height:100vh;display:flex;flex-direction:column;background:#fff;position:relative;overflow:hidden">
  <div style="position:fixed;top:0;right:0;width:0;height:0;border-left:90px solid transparent;border-top:90px solid #0F766E;pointer-events:none"></div>
  <div style="position:fixed;top:0;right:50px;width:0;height:0;border-left:45px solid transparent;border-top:45px solid #EC4899;pointer-events:none"></div>
  <div style="position:fixed;bottom:0;left:0;width:0;height:0;border-right:70px solid transparent;border-bottom:70px solid #EC4899;pointer-events:none"></div>
  <div style="flex:1;padding:52px 52px 36px;display:flex;flex-direction:column">
    <p style="font-size:48px;font-weight:900;letter-spacing:-2px;color:#1a1a1a;margin-bottom:36px;line-height:1">INVOICE</p>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:40px;margin-bottom:36px">
      <div style="font-size:12px;color:#555">
        <p style="margin-bottom:8px">Date Issued:<br><strong style="font-size:13px;color:#1a1a1a">${ctx.invoiceDate}</strong></p>
        <p style="margin-bottom:8px">Invoice No:<br><strong style="font-size:13px;color:#1a1a1a">${ctx.invoiceNumber}</strong></p>
        ${ctx.dueDate ? `<p>Due Date:<br><strong style="font-size:13px;color:#1a1a1a">${ctx.dueDate}</strong></p>` : ""}
        ${ctx.poNumber ? `<p style="margin-top:6px">PO #: <strong>${ctx.poNumber}</strong></p>` : ""}
      </div>
      <div style="font-size:12px">
        <p style="color:#94a3b8;font-size:10px;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px">Issued By</p>
        <p style="font-weight:700;font-size:13px">${ctx.bizName}</p>
        ${ctx.bizAddress ? `<p style="color:#64748b;font-size:11px;margin-top:2px">${ctx.bizAddress}</p>` : ""}
        ${ctx.bizPhone ? `<p style="color:#64748b;font-size:11px">${ctx.bizPhone}</p>` : ""}
        ${ctx.bizGstin ? `<p style="color:#64748b;font-size:11px">GSTIN: ${ctx.bizGstin}</p>` : ""}
        <p style="color:#94a3b8;font-size:10px;text-transform:uppercase;letter-spacing:1px;margin-top:16px;margin-bottom:6px">Issued To</p>
        <p style="font-weight:700;font-size:13px">${ctx.cd.name || "—"}</p>
        ${ctx.cd.address ? `<p style="color:#64748b;font-size:11px;margin-top:2px;line-height:1.5">${ctx.cd.address}</p>` : ""}
        ${ctx.cd.phone ? `<p style="color:#64748b;font-size:11px">${ctx.cd.phone}</p>` : ""}
        ${ctx.cd.email ? `<p style="color:#64748b;font-size:11px">${ctx.cd.email}</p>` : ""}
        ${ctx.cd.gst ? `<p style="color:#64748b;font-size:11px">GSTIN: ${ctx.cd.gst}</p>` : ""}
      </div>
    </div>
    <table style="width:100%;border-collapse:collapse;border:1px solid #e2e8f0">
      <thead><tr style="background:#f8f8f8;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#666">
        <th style="padding:11px 10px;text-align:center;width:40px;border-bottom:1px solid #e2e8f0">NO</th>
        <th style="padding:11px 14px;text-align:left;border-bottom:1px solid #e2e8f0">DESCRIPTION</th>
        <th style="padding:11px 14px;text-align:center;border-bottom:1px solid #e2e8f0">QTY</th>
        <th style="padding:11px 14px;text-align:right;border-bottom:1px solid #e2e8f0">PRICE</th>
        <th style="padding:11px 14px;text-align:right;border-bottom:1px solid #e2e8f0">SUBTOTAL</th>
      </tr></thead>
      <tbody>${itemsHtml}</tbody>
    </table>
    <div style="display:flex;justify-content:flex-end;margin-top:20px;margin-bottom:20px">
      <table style="border-collapse:collapse;min-width:260px">
        ${summaryRows}
        <tr>
          <td style="padding:12px 20px 12px 0;font-size:14px;font-weight:700;color:#1a1a1a;text-align:right;border-top:1.5px solid #e2e8f0">Grand Total</td>
          <td style="padding:12px 0;font-size:24px;font-weight:900;color:#0F766E;text-align:right;font-family:monospace;border-top:1.5px solid #e2e8f0">${ctx.cs}${ctx.grandTotal.toFixed(2)}</td>
        </tr>
      </table>
    </div>
    <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-top:auto;padding-top:48px">
      <div style="max-width:320px">
        ${ctx.bankHtml ? `<p style="font-size:12px;font-weight:700;margin-bottom:6px;color:#1a1a1a">Payment Details:</p><p style="font-size:12px;color:#64748b;line-height:1.6">${ctx.bankHtml}</p>` : ""}
        ${ctx.notes ? `<p style="font-size:12px;color:#64748b;margin-top:12px"><strong>Note:</strong> ${ctx.notes}</p>` : ""}
        ${ctx.paymentTerms ? `<p style="font-size:12px;color:#64748b;margin-top:4px"><strong>Payment Terms:</strong> ${ctx.paymentTerms}</p>` : ""}
      </div>
      <div style="text-align:right">
        <div style="border-top:1px solid #1a1a1a;padding-top:8px;text-align:center;min-width:160px">
          <div style="font-family:Georgia,serif;font-style:italic;font-size:26px;color:#374151;margin-bottom:4px">Authorized</div>
          <p style="font-size:11px;color:#6b7280">Authorized Signatory</p>
        </div>
      </div>
    </div>
  </div>
  <div style="background:#0F766E;padding:14px 52px;display:flex;justify-content:space-between;align-items:center;margin-top:auto;position:relative;z-index:2">
    <p style="color:rgba(255,255,255,0.9);font-size:12px;font-style:italic">${ctx.invoiceFooterNote}</p>
    <p style="color:rgba(255,255,255,0.55);font-size:10px">Generated by AutoInvoice</p>
  </div>
</div>
</body></html>`
}

function circleStudioTemplate(
  rows: ComputedRow[],
  summaryRows: string,
  ctx: TemplateContext & {
    bizLogo: string | null
    activeBankDetails: BankDetails | null
  },
): string {
  const itemsHtml = rows
    .map(
      (r) =>
        `<tr style="border-bottom:1px solid #e5e7eb">` +
        `<td style="padding:11px 14px;font-size:12px;color:#1a1a1a">${r.item.name}${r.item.description ? `<div style="font-size:10px;color:#9ca3af;margin-top:2px">${r.item.description}</div>` : ""}</td>` +
        `<td style="padding:11px 14px;font-size:12px;text-align:right;font-family:monospace">${ctx.cs}${Number(r.item.price).toFixed(2)}</td>` +
        `<td style="padding:11px 14px;font-size:12px;text-align:right">${r.item.quantity}${r.item.unit ? ` ${r.item.unit}` : ""}</td>` +
        `<td style="padding:11px 14px;font-size:12px;text-align:right;font-family:monospace;font-weight:700">${ctx.cs}${r.lineTotal.toFixed(2)}</td></tr>`,
    )
    .join("")

  const logoHtml = ctx.bizLogo
    ? `<img src="${ctx.bizLogo}" style="width:50px;height:50px;object-fit:contain;border-radius:50%">`
    : `<span style="font-style:italic;font-size:11px;font-family:Georgia,serif;color:#555">the</span><span style="font-weight:900;font-size:12px;letter-spacing:4px">${ctx.bizName.substring(0, 6).toUpperCase()}</span><span style="font-size:8px;letter-spacing:3px;color:#9ca3af;text-transform:uppercase">Studio</span>`

  const bankHtml =
    ctx.activeBankDetails &&
    (ctx.activeBankDetails.bankName || ctx.activeBankDetails.accountNumber)
      ? '<p style="font-weight:700;color:#1a1a1a;margin-bottom:6px;font-size:12px">BANK DETAILS</p>' +
        (ctx.activeBankDetails.bankName
          ? `<p>Bank: ${ctx.activeBankDetails.bankName}</p>`
          : "") +
        (ctx.activeBankDetails.accountName
          ? `<p>Account Name: ${ctx.activeBankDetails.accountName}</p>`
          : "") +
        (ctx.activeBankDetails.accountNumber
          ? `<p>Account No.: ${ctx.activeBankDetails.accountNumber}</p>`
          : "") +
        (ctx.activeBankDetails.ifsc
          ? `<p>IFSC: ${ctx.activeBankDetails.ifsc}</p>`
          : "") +
        (ctx.activeBankDetails.upi
          ? `<p>UPI: ${ctx.activeBankDetails.upi}</p>`
          : "") +
        (ctx.dueDate
          ? `<p style="margin-top:6px">Pay by: ${ctx.dueDate}</p>`
          : "")
      : ""

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>INVOICE ${ctx.invoiceNumber}</title>
<style>*{box-sizing:border-box;margin:0;padding:0}html,body{height:100%}body{font-family:Arial,sans-serif;background:#fff;color:#1a1a1a;font-size:13px;min-height:100%}@page{size:A4;margin:0}@media print{html,body{height:100%;-webkit-print-color-adjust:exact;print-color-adjust:exact}}</style></head>
<body>
<div style="max-width:794px;margin:0 auto;min-height:100vh;display:flex;flex-direction:column;background:#fff">
  <div style="flex:1;padding:48px 52px 36px;display:flex;flex-direction:column">
    <div style="text-align:center;margin-bottom:36px">
      <div style="width:80px;height:80px;border-radius:50%;border:2.5px solid #1a1a1a;display:inline-flex;flex-direction:column;align-items:center;justify-content:center;margin-bottom:8px">${logoHtml}</div>
      <p style="font-size:11px;color:#9ca3af;letter-spacing:1px;text-transform:uppercase">${ctx.bizTagline || ctx.bizEmail || ctx.bizName}</p>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:40px;margin-bottom:32px">
      <div>
        <p style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:10px">ISSUED TO:</p>
        <p style="font-weight:700;font-size:14px">${ctx.cd.name || "—"}</p>
        ${ctx.cd.address ? `<p style="font-size:12px;color:#6b7280;margin-top:4px;line-height:1.5">${ctx.cd.address}</p>` : ""}
        ${ctx.cd.phone ? `<p style="font-size:12px;color:#6b7280">${ctx.cd.phone}</p>` : ""}
        ${ctx.cd.email ? `<p style="font-size:12px;color:#6b7280">${ctx.cd.email}</p>` : ""}
        ${ctx.cd.gst ? `<p style="font-size:11px;color:#6b7280">GSTIN: ${ctx.cd.gst}</p>` : ""}
      </div>
      <div style="text-align:right">
        <p style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:10px">INVOICE NO:</p>
        <p style="font-weight:900;font-size:28px;font-family:monospace">#${ctx.invoiceNumber}</p>
        <p style="font-size:12px;color:#6b7280;margin-top:6px">${ctx.invoiceDate}</p>
        ${ctx.dueDate ? `<p style="font-size:12px;color:#6b7280">Due: ${ctx.dueDate}</p>` : ""}
        ${ctx.poNumber ? `<p style="font-size:12px;color:#6b7280">PO: ${ctx.poNumber}</p>` : ""}
      </div>
    </div>
    <table style="width:100%;border-collapse:collapse">
      <thead><tr style="border-top:2.5px solid #1a1a1a;border-bottom:2.5px solid #1a1a1a;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px">
        <th style="padding:11px 14px;text-align:left">DESCRIPTION</th>
        <th style="padding:11px 14px;text-align:right">UNIT PRICE</th>
        <th style="padding:11px 14px;text-align:right">QTY</th>
        <th style="padding:11px 14px;text-align:right">TOTAL</th>
      </tr></thead>
      <tbody>${itemsHtml}</tbody>
    </table>
    <div style="display:flex;justify-content:flex-end;margin-top:20px;margin-bottom:20px">
      <table style="border-collapse:collapse;min-width:240px">
        ${summaryRows}
      </table>
    </div>
    <div style="border-top:2.5px solid #1a1a1a;border-bottom:2.5px solid #1a1a1a;padding:12px 0;display:flex;justify-content:space-between;font-weight:900;font-size:24px;margin-top:0">
      <span style="letter-spacing:2px">AMOUNT DUE</span><span style="font-family:monospace">${ctx.cs}${ctx.grandTotal.toFixed(2)}</span>
    </div>
    <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-top:auto;padding-top:48px">
      <div style="font-size:12px;color:#6b7280;max-width:280px">
        ${bankHtml || ctx.bizPhone ? `<p>${ctx.bizPhone}</p><p>${ctx.bizEmail}</p>` : ""}
        ${ctx.notes ? `<p style="margin-top:12px"><em>${ctx.notes}</em></p>` : ""}
        ${ctx.paymentTerms ? `<p style="margin-top:4px"><strong>Terms:</strong> ${ctx.paymentTerms}</p>` : ""}
      </div>
      <div style="text-align:right">
        <div style="margin-bottom:24px;border-top:1px solid #1a1a1a;padding-top:8px;display:inline-block;min-width:160px;text-align:center">
          <p style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px">Authorized Signatory</p>
        </div>
        <p style="font-family:Georgia,serif;font-size:36px;font-style:italic;color:#374151">thank you</p>
        <p style="font-size:11px;color:#9ca3af;margin-top:4px">${ctx.invoiceFooterNote}</p>
      </div>
    </div>
  </div>
  <div style="border-top:2px solid #1a1a1a;padding:12px 52px;display:flex;justify-content:space-between;align-items:center;background:#f9fafb;margin-top:auto">
    <p style="font-size:12px;color:#6b7280">${ctx.bizName} &bull; ${ctx.bizEmail || ctx.bizPhone}</p>
    <p style="font-size:10px;color:#9ca3af">Generated by AutoInvoice</p>
  </div>
</div>
</body></html>`
}

function aizenBoldTemplate(
  rows: ComputedRow[],
  summaryRows: string,
  ctx: TemplateContext & { bizLogo: string | null },
): string {
  const itemsHtml = rows
    .map(
      (r, i) =>
        `<tr style="background:${i % 2 === 0 ? "#f9fafb" : "#fff"};border-bottom:1px solid #e5e7eb">` +
        `<td style="padding:11px 14px;font-size:12px;color:#374151">${r.item.name}${r.item.description ? `<div style="font-size:10px;color:#9ca3af;margin-top:2px">${r.item.description}</div>` : ""}</td>` +
        `<td style="padding:11px 14px;font-size:12px;text-align:center;color:#374151">${r.item.quantity}${r.item.unit ? ` ${r.item.unit}` : ""}</td>` +
        `<td style="padding:11px 14px;font-size:12px;text-align:right;font-family:monospace;color:#374151">${ctx.cs}${Number(r.item.price).toFixed(2)}</td>` +
        `<td style="padding:11px 14px;font-size:12px;text-align:right;font-family:monospace;font-weight:700;color:#1a1a1a">${ctx.cs}${r.lineTotal.toFixed(2)}</td></tr>`,
    )
    .join("")

  const logoHtml = ctx.bizLogo
    ? `<img src="${ctx.bizLogo}" style="width:42px;height:42px;object-fit:contain;border-radius:4px">`
    : `<div style="width:42px;height:42px;background:#ef4444;border-radius:4px;display:flex;align-items:center;justify-content:center;font-weight:900;color:#fff;font-size:20px;flex-shrink:0">${ctx.bizName.charAt(0)}</div>`

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>INVOICE ${ctx.invoiceNumber}</title>
<style>*{box-sizing:border-box;margin:0;padding:0}html,body{height:100%}body{font-family:Arial,sans-serif;background:#fff;color:#1a1a1a;font-size:13px;min-height:100%}@page{size:A4;margin:0}@media print{html,body{height:100%;-webkit-print-color-adjust:exact;print-color-adjust:exact}}</style></head>
<body>
<div style="max-width:794px;margin:0 auto;min-height:100vh;display:flex;flex-direction:column;background:#fff">
  <div style="padding:24px 44px 20px;position:relative;overflow:hidden;display:flex;align-items:center;gap:16px;background:#fff;border-bottom:1px solid #e5e7eb">
    <div style="position:absolute;top:0;right:0;width:0;height:0;border-left:70px solid transparent;border-top:70px solid #1a1a1a"></div>
    <div style="position:absolute;top:0;right:38px;width:0;height:0;border-left:36px solid transparent;border-top:36px solid #ef4444"></div>
    ${logoHtml}
    <div>
      <p style="font-weight:900;font-size:16px;line-height:1.1;color:#1a1a1a">${ctx.bizName.toUpperCase()}</p>
      <p style="font-size:10px;color:#9ca3af;letter-spacing:2px;text-transform:uppercase">${ctx.bizTagline || "Professional Services"}</p>
    </div>
  </div>
  <p style="text-align:center;font-weight:900;font-size:30px;letter-spacing:8px;padding:14px 0;border-bottom:1px solid #e5e7eb;margin:0">INVOICE</p>
  <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:20px;padding:20px 44px;border-bottom:1px solid #e5e7eb;font-size:12px">
    <div>
      <p style="color:#9ca3af;margin-bottom:4px;font-size:10px;text-transform:uppercase;letter-spacing:1px">Invoice To:</p>
      <p style="font-weight:700;font-size:13px">${ctx.cd.name || "—"}</p>
      ${ctx.cd.address ? `<p style="color:#6b7280;margin-top:2px;line-height:1.5">${ctx.cd.address}</p>` : ""}
      ${ctx.cd.phone ? `<p style="color:#6b7280">${ctx.cd.phone}</p>` : ""}
      ${ctx.cd.email ? `<p style="color:#6b7280">${ctx.cd.email}</p>` : ""}
      ${ctx.cd.gst ? `<p style="color:#6b7280">GSTIN: ${ctx.cd.gst}</p>` : ""}
    </div>
    <div>
      <p style="color:#9ca3af;margin-bottom:4px;font-size:10px;text-transform:uppercase;letter-spacing:1px">From:</p>
      <p style="font-weight:700;font-size:13px">${ctx.bizName}</p>
      ${ctx.bizAddress ? `<p style="color:#6b7280;margin-top:2px;line-height:1.5">${ctx.bizAddress}</p>` : ""}
      ${ctx.bizPhone ? `<p style="color:#6b7280">${ctx.bizPhone}</p>` : ""}
      ${ctx.bizGstin ? `<p style="color:#6b7280">GSTIN: ${ctx.bizGstin}</p>` : ""}
    </div>
    <div style="text-align:right">
      <p style="color:#9ca3af;margin-bottom:4px">Date: ${ctx.invoiceDate}</p>
      <p style="font-family:monospace">Invoice: ${ctx.invoiceNumber}</p>
      ${ctx.dueDate ? `<p style="color:#6b7280">Due: ${ctx.dueDate}</p>` : ""}
      ${ctx.poNumber ? `<p style="color:#6b7280">PO #: ${ctx.poNumber}</p>` : ""}
    </div>
  </div>
  <div style="flex:1;padding:0 44px 36px;display:flex;flex-direction:column">
    <table style="width:100%;border-collapse:collapse;margin-top:20px">
      <thead><tr style="background:#f3f4f6;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#6b7280">
        <th style="padding:11px 14px;text-align:left">Description</th>
        <th style="padding:11px 14px;text-align:center">Qty</th>
        <th style="padding:11px 14px;text-align:right">Price</th>
        <th style="padding:11px 14px;text-align:right">Total</th>
      </tr></thead>
      <tbody>${itemsHtml}</tbody>
    </table>
    <div style="display:flex;justify-content:flex-end;margin-top:24px;margin-bottom:24px">
      <table style="border-collapse:collapse;min-width:280px">
        ${summaryRows}
        <tr>
          <td style="padding:16px 24px 16px 0;font-size:16px;font-weight:900;color:#1a1a1a;text-align:right;text-transform:uppercase;letter-spacing:1px">Grand Total</td>
          <td style="padding:0;text-align:right">
            <div style="background:#ef4444;color:#fff;font-weight:900;font-size:26px;padding:12px 24px;border-radius:4px;white-space:nowrap;display:inline-block">
              ${ctx.cs}${ctx.grandTotal.toFixed(2)}
            </div>
          </td>
        </tr>
      </table>
    </div>
    <div style="margin-top:auto;padding-top:40px;display:flex;justify-content:space-between;align-items:flex-end">
      <div style="max-width:320px">
        ${ctx.bankHtml ? `<div style="font-size:12px;color:#6b7280"><strong style="color:#1a1a1a">Payment Details</strong><br>${ctx.bankHtml}</div>` : ""}
        ${ctx.notes ? `<div style="margin-top:16px;font-size:12px;color:#6b7280"><strong>Note:</strong> ${ctx.notes}</div>` : ""}
        ${ctx.paymentTerms ? `<div style="margin-top:8px;font-size:12px;color:#6b7280"><strong>Payment Terms:</strong> ${ctx.paymentTerms}</div>` : ""}
      </div>
      <div style="text-align:right;min-width:180px">
        <div style="display:inline-block;border-top:2px solid #1a1a1a;padding-top:8px;text-align:center">
          <p style="font-size:14px;font-weight:900;text-transform:uppercase;letter-spacing:1px">Authorized</p>
          <p style="font-size:10px;color:#9ca3af;margin-top:2px">Official Signatory</p>
        </div>
      </div>
    </div>
  </div>
  <div style="background:#1a1a1a;padding:14px 44px;display:flex;justify-content:space-between;align-items:center;margin-top:auto">
    <p style="color:rgba(255,255,255,0.9);font-size:12px">${ctx.invoiceFooterNote}</p>
    <p style="color:rgba(255,255,255,0.55);font-size:10px">Generated by AutoInvoice</p>
  </div>
</div>
</body></html>`
}

function defaultTemplate(
  rows: ComputedRow[],
  invoiceNumber: string,
  invoiceDate: string,
  cs: string,
  grandTotal: number,
  invoiceFooterNote: string,
): string {
  const itemsHtml = rows
    .map(
      (r, i) =>
        `<tr style="border-bottom:1px solid #e2e8f0;background:${i % 2 === 0 ? "#fff" : "#f0fdfe"}">` +
        `<td style="padding:8px 10px;font-size:11px;text-align:center;border-right:1px solid #e2e8f0;color:#555">${i + 1}</td>` +
        `<td style="padding:8px 12px;font-size:12px;color:#1a1a1a">${r.item.name}</td>` +
        `<td style="padding:8px 12px;font-size:12px;text-align:right;color:#1a1a1a">${cs}${r.lineTotal.toFixed(2)}</td></tr>`,
    )
    .join("")
  return (
    '<!DOCTYPE html><html><head><meta charset="utf-8"><title>INVOICE ' +
    invoiceNumber +
    '</title><style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:Arial,sans-serif;background:#fff;font-size:13px}@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}</style></head><body><div style="max-width:800px;margin:0 auto;padding:36px">' +
    '<div style="display:flex;justify-content:space-between;margin-bottom:28px"><p style="font-size:48px;font-weight:900;color:#0E7490;letter-spacing:-2px;line-height:1">INVOICE</p><div style="text-align:right;border:1px solid #e2e8f0;padding:10px 16px;font-size:11px"><div><span style="color:#94a3b8">Date:</span> ' +
    invoiceDate +
    '</div><div><span style="color:#94a3b8">Invoice No:</span> ' +
    invoiceNumber +
    "</div></div></div>" +
    '<table style="width:100%;border-collapse:collapse;border:1px solid #cbd5e1"><thead><tr style="background:#0E7490;color:#fff"><th style="padding:9px 10px;font-size:11px;text-align:center;width:36px">SL</th><th style="padding:9px 12px;font-size:11px;text-align:left">Description</th><th style="padding:9px 12px;font-size:11px;text-align:right">Amount</th></tr></thead><tbody>' +
    itemsHtml +
    '<tr style="border-top:2px solid #0E7490"><td colspan="2" style="padding:10px 12px;font-size:12px;font-weight:700;text-align:right">Total</td><td style="padding:10px 12px;font-size:13px;font-weight:800;text-align:right;color:#0E7490">' +
    cs +
    grandTotal.toFixed(2) +
    "</td></tr></tbody></table>" +
    '<div style="margin-top:16px;text-align:center;font-size:10px;color:#94a3b8;border-top:1px solid #e2e8f0;padding-top:10px">' +
    invoiceFooterNote +
    " &bull; Generated by AutoInvoice</div>" +
    "</div></body></html>"
  )
}
