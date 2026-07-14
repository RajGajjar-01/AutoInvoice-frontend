import axios from "axios"
import { OpenAPI } from "@/client"
import html2pdf from "html2pdf.js"
import { toast } from "sonner"

export function toRupeesInWords(num) {
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", 
                "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  
  function convert(n) {
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + ones[n % 10] : "");
    if (n < 1000) return ones[Math.floor(n / 100)] + " Hundred" + (n % 100 !== 0 ? " " + convert(n % 100) : "");
    if (n < 100000) return convert(Math.floor(n / 1000)) + " Thousand" + (n % 1000 !== 0 ? " " + convert(n % 1000) : "");
    if (n < 10000000) return convert(Math.floor(n / 100000)) + " Lakh" + (n % 100000 !== 0 ? " " + convert(n % 100000) : "");
    return convert(Math.floor(n / 10000000)) + " Crore" + (n % 10000000 !== 0 ? " " + convert(n % 10000000) : "");
  }

  const absNum = Math.abs(num);
  if (absNum === 0) return "Zero Rupees Only";
  
  const parts = absNum.toFixed(2).split(".");
  const rupees = parseInt(parts[0], 10);
  const paise = parseInt(parts[1], 10);
  
  let result = "";
  if (rupees > 0) {
    result += convert(rupees) + " Rupees";
  }
  if (paise > 0) {
    if (rupees > 0) result += " and ";
    result += convert(paise) + " Paise";
  }
  result += " Only";
  return (num < 0 ? "Negative " : "") + result;
}

export function buildInvoiceHtml(invoice, companyDetails = {}, selectedTemplate = "clean-teal", importedTemplate = null) {
  const currency = invoice.currency || "INR"
  const cs = currency === "INR" ? "₹" : currency === "USD" ? "$" : currency === "EUR" ? "€" : currency === "GBP" ? "£" : currency
  const cd = invoice.customer || {}
  const biz = companyDetails
  const items = invoice.items || []
  const docType = invoice.type || "invoice"
  const docTitle = docType === "quotation" ? "Quotation" : docType === "challan" ? "Delivery Challan" : docType === "proforma" ? "Proforma Invoice" : "Invoice"
  const docTitleUpper = docTitle.toUpperCase()

  const bizName = biz.name || 'Your Business'
  const bizEmail = biz.email || ''
  const bizPhone = biz.phone || ''
  const bizAddress = [biz.address, biz.city, biz.state, biz.pincode].filter(Boolean).join(', ')
  const bizGstin = biz.gstin || ''
  const bizTagline = biz.tagline || ''
  const bizLogo = biz.logo || null
  const invoiceFooterNote = biz.invoiceFooter || 'Thank you for your business!'

  const activeBankDetails = invoice.bankDetails || (
    (biz.bankName || biz.accountNumber || biz.upi) ? {
      bankName: biz.bankName || '',
      accountName: biz.accountName || '',
      accountNumber: biz.accountNumber || '',
      ifsc: biz.ifsc || '',
      branch: biz.branch || '',
      upi: biz.upi || '',
    } : null
  )

  const isChallan = docType === "challan"
  const isQuote = docType === "quotation"
  const isProforma = docType === "proforma"

  const validItems = items.filter((i) => i.name)
  const computedRows = validItems.map((item, idx) => {
    const lineBase = item.quantity * item.price
    const disc = item.discountType === 'flat'
      ? Math.min(item.discount || 0, lineBase)
      : lineBase * ((item.discount || 0) / 100)
    const taxable = lineBase - disc
    const lineTax = (taxable * item.tax) / 100
    const lineTotal = taxable + lineTax
    return { item, idx, lineBase, disc, taxable, lineTax, lineTotal }
  })

  const subtotal = invoice.subtotal || 0
  const itemsDiscount = invoice.itemsDiscount || 0
  const invoiceDiscount = invoice.invoiceDiscount || 0
  const totalTax = invoice.totalTax || 0
  const shippingCharge = invoice.shippingCharge || 0
  const extraChargeLabel = invoice.extraChargeLabel || ""
  const extraChargeAmount = invoice.extraChargeAmount || 0
  const roundOff = invoice.roundOff || false
  const grandTotal = invoice.grandTotal || 0
  const rawGrandTotal = subtotal - itemsDiscount - invoiceDiscount + totalTax + Number(shippingCharge) + Number(extraChargeAmount)

  const amountInWords = toRupeesInWords(grandTotal)
  const summaryEntries = [
    { label: 'Subtotal', value: cs + subtotal.toFixed(2) },
    itemsDiscount > 0 ? { label: 'Item Discounts', value: '-' + cs + itemsDiscount.toFixed(2), red: true } : null,
    invoiceDiscount > 0 ? { label: 'Discount', value: '-' + cs + invoiceDiscount.toFixed(2), red: true } : null,
    totalTax > 0 ? { label: 'Tax', value: cs + totalTax.toFixed(2) } : null,
    Number(shippingCharge) > 0 ? { label: 'Shipping', value: cs + Number(shippingCharge).toFixed(2) } : null,
    Number(extraChargeAmount) > 0 ? { label: extraChargeLabel || 'Extra', value: cs + Number(extraChargeAmount).toFixed(2) } : null,
    (roundOff && (grandTotal - rawGrandTotal) !== 0) ? { label: 'Round Off', value: ((grandTotal - rawGrandTotal) >= 0 ? '+' : '') + cs + (grandTotal - rawGrandTotal).toFixed(2) } : null,
  ].filter(Boolean)

  const bankHtml = (activeBankDetails && (activeBankDetails.bankName || activeBankDetails.accountNumber || activeBankDetails.upi))
    ? [
      activeBankDetails.bankName ? 'Bank: <strong>' + activeBankDetails.bankName + '</strong>' : '',
      activeBankDetails.accountName ? 'A/C Name: <strong>' + activeBankDetails.accountName + '</strong>' : '',
      activeBankDetails.accountNumber ? 'A/C No: <strong>' + activeBankDetails.accountNumber + '</strong>' : '',
      activeBankDetails.ifsc ? 'IFSC: <strong>' + activeBankDetails.ifsc + '</strong>' : '',
      activeBankDetails.upi ? 'UPI: <strong>' + activeBankDetails.upi + '</strong>' : '',
    ].filter(Boolean).join(' &nbsp;|&nbsp; ')
    : ''

  const notes = invoice.notes || ""
  const paymentTerms = invoice.paymentTerms || ""
  const invoiceNumber = invoice.invoiceNumber || ""
  const invoiceDate = invoice.invoiceDate || ""
  const dueDate = invoice.dueDate || ""
  const validityDate = invoice.validityDate || ""
  const vehicleInfo = invoice.vehicleInfo || ""
  const deliveryNotes = invoice.deliveryNotes || ""
  const poNumber = invoice.poNumber || ""
  const placeOfSupply = invoice.placeOfSupply || ""
  const reverseCharge = invoice.reverseCharge || false

  // ── TEMPLATE 1: CLEAN TEAL ────────────────────────────────────────────────
  if (selectedTemplate === 'clean-teal') {
    const rows = computedRows.map((r, i) =>
      '<tr style="border-bottom:1px solid #e2e8f0;background:' + (i % 2 === 0 ? '#fff' : '#f0fdfe') + '">' +
      '<td style="padding:10px 10px;font-size:11px;text-align:center;border-right:1px solid #e2e8f0;color:#555">' + (i + 1) + '</td>' +
      '<td style="padding:10px 12px;font-size:12px;color:#1a1a1a">' +
      r.item.name +
      (r.item.description ? '<div style="font-size:10px;color:#94a3b8;margin-top:2px">' + r.item.description + '</div>' : '') +
      '</td>' +
      '<td style="padding:10px 12px;font-size:12px;text-align:center;color:#555">' + r.item.quantity + '</td>' +
      (!isChallan ? `
      <td style="padding:10px 12px;font-size:12px;text-align:right;color:#1a1a1a;font-family:monospace">${cs}${Number(r.item.price).toFixed(2)}</td>
      <td style="padding:10px 12px;font-size:12px;text-align:right;color:#1a1a1a;font-family:monospace">${cs}${r.lineTotal.toFixed(2)}</td>
      ` : '') +
      '</tr>'
    ).join('')

    const noteHtml = (notes || paymentTerms) ? '<tr><td colspan="5" style="padding:12px;font-size:11px;border-top:1px solid #e2e8f0;background:#f8fafc"><strong>Note:</strong> ' + (notes || paymentTerms) + '</td></tr>' : ''

    return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${docTitleUpper} ${invoiceNumber}</title>
<style>*{box-sizing:border-box;margin:0;padding:0}html,body{height:100%}body{font-family:Arial,sans-serif;background:#fff;color:#1a1a1a;font-size:13px;min-height:100%}@page{size:A4;margin:0}@media print{html,body{height:100%;-webkit-print-color-adjust:exact;print-color-adjust:exact}}</style></head>
<body>
<div style="max-width:794px;margin:0 auto;min-height:100vh;display:flex;flex-direction:column;background:#fff">
  <div style="flex:1;padding:48px 52px 32px;display:flex;flex-direction:column">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:36px">
      <p style="font-size:56px;font-weight:900;color:#0E7490;letter-spacing:-3px;line-height:1">${docTitleUpper}</p>
      <div style="text-align:right;border:1px solid #e2e8f0;padding:14px 18px;font-size:12px;color:#555;min-width:200px">
        <div style="margin-bottom:6px"><span style="color:#94a3b8">Date:</span> ${invoiceDate}</div>
        <div style="margin-bottom:6px"><span style="color:#94a3b8">${docTitle} No:</span> ${invoiceNumber}</div>
        ${dueDate && !validityDate ? '<div style="margin-bottom:4px"><span style="color:#94a3b8">Due:</span> ' + dueDate + '</div>' : ''}
        ${validityDate ? '<div style="margin-bottom:4px"><span style="color:#94a3b8">Valid Till:</span> ' + validityDate + '</div>' : ''}
        ${vehicleInfo ? '<div style="margin-bottom:4px"><span style="color:#94a3b8">Vehicle:</span> ' + vehicleInfo + '</div>' : ''}
        ${poNumber ? '<div><span style="color:#94a3b8">PO #:</span> ' + poNumber + '</div>' : ''}
      </div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:40px;margin-bottom:36px">
      <div>
        <div style="font-size:11px;font-weight:700;color:#555;border-bottom:2.5px solid #0E7490;padding-bottom:5px;margin-bottom:10px;text-transform:uppercase">From</div>
        <p style="font-weight:700;font-size:14px">${bizName}</p>
        ${bizTagline ? '<p style="color:#94a3b8;font-size:11px;margin-top:2px">' + bizTagline + '</p>' : ''}
        ${bizAddress ? '<p style="color:#64748b;font-size:12px;margin-top:4px">' + bizAddress + '</p>' : ''}
        ${bizPhone ? '<p style="color:#64748b;font-size:12px">' + bizPhone + '</p>' : ''}
        ${bizEmail ? '<p style="color:#64748b;font-size:12px">' + bizEmail + '</p>' : ''}
        ${bizGstin ? '<p style="color:#64748b;font-size:11px;margin-top:2px">GSTIN: ' + bizGstin + '</p>' : ''}
      </div>
      <div>
        <div style="font-size:11px;font-weight:700;color:#555;border-bottom:2.5px solid #0E7490;padding-bottom:5px;margin-bottom:10px;text-transform:uppercase">Bill To</div>
        <p style="font-weight:700;font-size:14px">${cd.name || '—'}</p>
        ${cd.address ? '<p style="color:#64748b;font-size:12px;margin-top:4px;line-height:1.5">' + cd.address + '</p>' : ''}
        ${cd.phone ? '<p style="color:#64748b;font-size:12px">' + cd.phone + '</p>' : ''}
        ${cd.email ? '<p style="color:#64748b;font-size:12px">' + cd.email + '</p>' : ''}
        ${cd.gst ? '<p style="color:#64748b;font-size:11px;margin-top:2px">GSTIN: ' + cd.gst + '</p>' : ''}
        ${placeOfSupply ? '<p style="color:#9ca3af;font-size:11px">Place of Supply: ' + placeOfSupply + '</p>' : ''}
      </div>
    </div>
    <table style="width:100%;border-collapse:collapse;border:1px solid #cbd5e1">
      <thead><tr style="background:#0E7490;color:#fff">
        <th style="padding:11px 10px;font-size:11px;text-align:center;width:40px">SL</th>
        <th style="padding:11px 14px;font-size:11px;text-align:left">DESCRIPTION</th>
        <th style="padding:11px 14px;font-size:11px;text-align:center">QTY</th>
        ${!isChallan ? `
        <th style="padding:11px 14px;font-size:11px;text-align:right">PRICE</th>
        <th style="padding:11px 14px;font-size:11px;text-align:right">AMOUNT</th>
        ` : ''}
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>
    ${!isChallan ? `
    <div style="display:flex;justify-content:flex-end;margin-top:20px;margin-bottom:20px">
      <table style="border-collapse:collapse;min-width:240px">
        ${summaryEntries.map(e => `
          <tr>
            <td style="padding:6px 20px 6px 0;font-size:12px;color:#64748b;text-align:right">${e.label}</td>
            <td style="padding:6px 0;font-size:12px;text-align:right;font-family:monospace;color:${e.red ? '#ef4444' : '#1a1a1a'}">${e.value}</td>
          </tr>
        `).join('')}
        <tr>
          <td style="padding:12px 20px 12px 0;font-size:14px;font-weight:700;color:#0E7490;text-align:right;border-top:2px solid #0E7490">Grand Total</td>
          <td style="padding:12px 0;font-size:24px;font-weight:900;color:#0E7490;text-align:right;font-family:monospace;border-top:2px solid #0E7490">${cs}${grandTotal.toFixed(2)}</td>
        </tr>
      </table>
    </div>
    <div style="text-align:right;font-size:11px;color:#64748b;margin-bottom:20px;margin-top:-10px"><strong>Amount in Words:</strong> ${amountInWords}</div>
    ` : ''}
    ${(deliveryNotes || notes || paymentTerms) ? `<div style="padding:12px;font-size:11px;border:1px solid #e2e8f0;background:#f8fafc;margin-bottom:20px">
      ${deliveryNotes ? `<div><strong>Delivery Notes:</strong> ${deliveryNotes}</div>` : ''}
      ${notes ? `<div style="${deliveryNotes ? 'margin-top:4px' : ''}"><strong>Note:</strong> ${notes}</div>` : ''}
      ${paymentTerms ? `<div style="${(deliveryNotes || notes) ? 'margin-top:4px' : ''}"><strong>Terms:</strong> ${paymentTerms}</div>` : ''}
    </div>` : ''}
    <div style="margin-top:auto;padding-top:32px;display:flex;justify-content:space-between;align-items:flex-end">
      <div style="max-width:320px">
        ${bankHtml ? '<div style="padding:14px 16px;background:#f0fdfe;border:1px solid #cffafe;font-size:12px;color:#555">' + bankHtml + '</div>' : ''}
        ${notes && !noteHtml ? '<div style="margin-top:16px;padding:12px 16px;background:#f8fafc;border-left:3px solid #0E7490;font-size:12px;color:#555"><strong>Note:</strong> ' + notes + '</div>' : ''}
        ${paymentTerms ? '<div style="margin-top:10px;font-size:11px;color:#64748b"><strong>Payment Terms:</strong> ' + paymentTerms + '</div>' : ''}
      </div>
      <div style="text-align:right;min-width:180px">
        <div style="border-top:1.5px solid #0E7490;padding-top:8px">
          <p style="font-size:13px;font-weight:700;color:#0E7490">Authorized Signatory</p>
          <p style="font-size:10px;color:#94a3b8;margin-top:2px">For ${bizName}</p>
        </div>
      </div>
    </div>
  </div>
  <div style="background:#0E7490;padding:14px 52px;display:flex;justify-content:space-between;align-items:center;margin-top:auto">
    <p style="color:rgba(255,255,255,0.9);font-size:12px;font-style:italic">${invoiceFooterNote}</p>
    <p style="color:rgba(255,255,255,0.55);font-size:10px">Generated by UnifiedDesk</p>
  </div>
</div>
</body></html>`
  }

  // ── TEMPLATE 2: GEOMETRIC ─────────────────────────────────────────────────
  if (selectedTemplate === 'geometric') {
    const rows = computedRows.map((r, i) => `
      <tr style="border-bottom:1px solid #e2e8f0;background:${i % 2 === 0 ? '#fff' : '#f8fffe'}">
        <td style="padding:10px 10px;font-size:11px;text-align:center;color:#555">${i + 1}</td>
        <td style="padding:10px 12px;font-size:12px;color:#1a1a1a">${r.item.name}${r.item.description ? '<div style="font-size:10px;color:#94a3b8;margin-top:1px">' + r.item.description + '</div>' : ''}</td>
        <td style="padding:10px 12px;font-size:12px;text-align:center;color:#555">${r.item.quantity}${r.item.unit ? ' ' + r.item.unit : ''}</td>
        ${!isChallan ? `
        <td style="padding:10px 12px;font-size:12px;text-align:right;font-family:monospace;color:#555">${cs}${Number(r.item.price).toFixed(2)}</td>
        <td style="padding:10px 12px;font-size:12px;text-align:right;font-family:monospace;font-weight:700;color:#0F766E">${cs}${r.lineTotal.toFixed(2)}</td>
        ` : ''}
      </tr>
    `).join('')

    const sumRows = summaryEntries.map(e =>
      '<tr><td style="padding:5px 0;font-size:12px;color:#64748b;text-align:right;padding-right:20px">' + e.label + '</td><td style="padding:5px 0;font-size:12px;text-align:right;color:' + (e.red ? '#ef4444' : '#1a1a1a') + ';font-family:monospace">' + e.value + '</td></tr>'
    ).join('')

    return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${docTitleUpper} ${invoiceNumber}</title>
<style>*{box-sizing:border-box;margin:0;padding:0}html,body{height:100%}body{font-family:Arial,sans-serif;background:#fff;color:#1a1a1a;font-size:13px;min-height:100%}@page{size:A4;margin:0}@media print{html,body{height:100%;-webkit-print-color-adjust:exact;print-color-adjust:exact}}</style></head>
<body>
<div style="max-width:794px;margin:0 auto;min-height:100vh;display:flex;flex-direction:column;background:#fff;position:relative;overflow:hidden">
  <div style="position:fixed;top:0;right:0;width:0;height:0;border-left:90px solid transparent;border-top:90px solid #0F766E;pointer-events:none"></div>
  <div style="position:fixed;top:0;right:50px;width:0;height:0;border-left:45px solid transparent;border-top:45px solid #EC4899;pointer-events:none"></div>
  <div style="position:fixed;bottom:0;left:0;width:0;height:0;border-right:70px solid transparent;border-bottom:70px solid #EC4899;pointer-events:none"></div>
  <div style="flex:1;padding:52px 52px 36px;display:flex;flex-direction:column">
    <p style="font-size:48px;font-weight:900;letter-spacing:-2px;color:#1a1a1a;margin-bottom:36px;line-height:1">${docTitleUpper}</p>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:40px;margin-bottom:36px">
      <div style="font-size:12px;color:#555">
        <p style="margin-bottom:8px">Date Issued:<br><strong style="font-size:13px;color:#1a1a1a">${invoiceDate}</strong></p>
        <p style="margin-bottom:8px">${docTitle} No:<br><strong style="font-size:13px;color:#1a1a1a">${invoiceNumber}</strong></p>
        ${docType === "quotation" ? (
          `<p>Valid Till:<br><strong style="font-size:13px;color:#1a1a1a">${validityDate || "—"}</strong></p>`
        ) : (
          `<p>Due Date:<br><strong style="font-size:13px;color:#1a1a1a">${dueDate || "—"}</strong></p>`
        )}
        ${poNumber ? '<p style="margin-top:6px">PO #: <strong>' + poNumber + '</strong></p>' : ''}
      </div>
      <div style="font-size:12px">
        <p style="color:#94a3b8;font-size:10px;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px">Issued By</p>
        <p style="font-weight:700;font-size:13px">${bizName}</p>
        ${bizAddress ? '<p style="color:#64748b;font-size:11px;margin-top:2px">' + bizAddress + '</p>' : ''}
        ${bizPhone ? '<p style="color:#64748b;font-size:11px">' + bizPhone + '</p>' : ''}
        ${bizGstin ? '<p style="color:#64748b;font-size:11px">GSTIN: ' + bizGstin + '</p>' : ''}
        <p style="color:#94a3b8;font-size:10px;text-transform:uppercase;letter-spacing:1px;margin-top:16px;margin-bottom:6px">Issued To</p>
        <p style="font-weight:700;font-size:13px">${cd.name || '—'}</p>
        ${cd.address ? '<p style="color:#64748b;font-size:11px;margin-top:2px;line-height:1.5">' + cd.address + '</p>' : ''}
        ${cd.phone ? '<p style="color:#64748b;font-size:11px">' + cd.phone + '</p>' : ''}
        ${cd.email ? '<p style="color:#64748b;font-size:11px">' + cd.email + '</p>' : ''}
        ${cd.gst ? '<p style="color:#64748b;font-size:11px">GSTIN: ' + cd.gst + '</p>' : ''}
      </div>
    </div>
    ${vehicleInfo ? `
    <div style="margin-bottom:32px;display:inline-block;background:#f8fafc;border-left:4px solid #0F766E;padding:12px 20px">
      <p style="font-size:10px;text-transform:uppercase;color:#94a3b8;margin-bottom:4px">Vehicle / Delivery Info</p>
      <p style="font-weight:700;font-size:13px">${vehicleInfo}</p>
      ${deliveryNotes ? '<p style="font-size:11px;color:#64748b;margin-top:4px">' + deliveryNotes + '</p>' : ''}
    </div>
    ` : ''}
    <table style="width:100%;border-collapse:collapse;border:1px solid #e2e8f0">
      <thead><tr style="background:#f8f8f8;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#666">
        <th style="padding:11px 10px;text-align:center;width:40px;border-bottom:1px solid #e2e8f0">NO</th>
        <th style="padding:11px 14px;text-align:left;border-bottom:1px solid #e2e8f0">DESCRIPTION</th>
        <th style="padding:11px 14px;text-align:center;border-bottom:1px solid #e2e8f0">QTY</th>
        ${!isChallan ? `
        <th style="padding:11px 14px;text-align:right;border-bottom:1px solid #e2e8f0">PRICE</th>
        <th style="padding:11px 14px;text-align:right;border-bottom:1px solid #e2e8f0">SUBTOTAL</th>
        ` : ''}
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>
    ${!isChallan ? `
    <div style="display:flex;justify-content:flex-end;margin-top:20px;margin-bottom:20px">
      <table style="border-collapse:collapse;min-width:260px">
        ${sumRows}
        <tr>
          <td style="padding:12px 20px 12px 0;font-size:14px;font-weight:700;color:#1a1a1a;text-align:right;border-top:1.5px solid #e2e8f0">Grand Total</td>
          <td style="padding:12px 0;font-size:24px;font-weight:900;color:#0F766E;text-align:right;font-family:monospace;border-top:1.5px solid #e2e8f0">${cs}${grandTotal.toFixed(2)}</td>
        </tr>
      </table>
    </div>
    <div style="text-align:right;font-size:11px;color:#64748b;margin-bottom:20px;margin-top:-10px"><strong>Amount in Words:</strong> ${amountInWords}</div>
    ` : ''}
    <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-top:auto;padding-top:48px">
      <div style="max-width:320px">
        ${deliveryNotes ? '<p style="font-size:12px;color:#1a1a1a;margin-bottom:8px"><strong>Delivery Notes:</strong> ' + deliveryNotes + '</p>' : ''}
        ${bankHtml ? '<p style="font-size:12px;font-weight:700;margin-bottom:6px;color:#1a1a1a">Payment Details:</p><p style="font-size:12px;color:#64748b;line-height:1.6">' + bankHtml + '</p>' : ''}
        ${notes ? '<p style="font-size:12px;color:#64748b;margin-top:12px"><strong>Note:</strong> ' + notes + '</p>' : ''}
        ${paymentTerms ? '<p style="font-size:12px;color:#64748b;margin-top:4px"><strong>Payment Terms:</strong> ' + paymentTerms + '</p>' : ''}
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
    <p style="color:rgba(255,255,255,0.9);font-size:12px;font-style:italic">${invoiceFooterNote}</p>
    <p style="color:rgba(255,255,255,0.55);font-size:10px">Generated by UnifiedDesk</p>
  </div>
</div>
</body></html>`
  }

  // ── TEMPLATE 3: CIRCLE STUDIO ─────────────────────────────────────────────
  if (selectedTemplate === 'circle-studio') {
    const rows = computedRows.map((r, i) => `
      <tr style="border-bottom:1px solid #e5e7eb">
        <td style="padding:11px 14px;font-size:12px;color:#1a1a1a">
          <div style="font-weight:700">${r.item.name}</div>
          ${r.item.description ? '<div style="font-size:10px;color:#9ca3af;margin-top:2px">' + r.item.description + '</div>' : ''}
        </td>
        ${!isChallan ? `
        <td style="padding:11px 14px;font-size:12px;text-align:right;font-family:monospace">${cs}${Number(r.item.price).toFixed(2)}</td>
        ` : ''}
        <td style="padding:11px 14px;font-size:12px;text-align:right">${r.item.quantity}${r.item.unit ? ' ' + r.item.unit : ''}</td>
        ${!isChallan ? `
        <td style="padding:11px 14px;font-size:12px;text-align:right;font-family:monospace;font-weight:700">${cs}${r.lineTotal.toFixed(2)}</td>
        ` : ''}
      </tr>
    `).join('')

    const sumRows = summaryEntries.filter(e => e.label !== 'Subtotal').map(e =>
      '<tr><td style="padding:4px 16px 4px 0;font-size:12px;color:#6b7280">' + e.label + '</td><td style="padding:4px 0;font-size:12px;text-align:right;font-family:monospace;color:' + (e.red ? '#ef4444' : '#1a1a1a') + '">' + e.value + '</td></tr>'
    ).join('')

    return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>INVOICE ${invoiceNumber}</title>
<style>*{box-sizing:border-box;margin:0;padding:0}html,body{height:100%}body{font-family:Arial,sans-serif;background:#fff;color:#1a1a1a;font-size:13px;min-height:100%}@page{size:A4;margin:0}@media print{html,body{height:100%;-webkit-print-color-adjust:exact;print-color-adjust:exact}}</style></head>
<body>
<div style="max-width:794px;margin:0 auto;min-height:100vh;display:flex;flex-direction:column;background:#fff">
  <div style="flex:1;padding:48px 52px 36px;display:flex;flex-direction:column">
    <div style="text-align:center;margin-bottom:36px">
      <div style="width:80px;height:80px;border-radius:50%;border:2.5px solid #1a1a1a;display:inline-flex;flex-direction:column;align-items:center;justify-content:center;margin-bottom:8px">
        ${bizLogo
          ? '<img src="' + bizLogo + '" style="width:50px;height:50px;object-fit:contain;border-radius:50%">'
          : '<span style="font-style:italic;font-size:11px;font-family:Georgia,serif;color:#555">the</span><span style="font-weight:900;font-size:12px;letter-spacing:4px">' + bizName.substring(0, 6).toUpperCase() + '</span><span style="font-size:8px;letter-spacing:3px;color:#9ca3af;text-transform:uppercase">Studio</span>'
        }
      </div>
      <p style="font-size:11px;color:#9ca3af;letter-spacing:1px;text-transform:uppercase">${bizTagline || bizEmail || bizName}</p>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:40px;margin-bottom:32px">
      <div>
        <p style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:10px">ISSUED TO:</p>
        <p style="font-weight:700;font-size:14px">${cd.name || '—'}</p>
        ${cd.address ? '<p style="font-size:12px;color:#6b7280;margin-top:4px;line-height:1.5">' + cd.address + '</p>' : ''}
        ${cd.phone ? '<p style="font-size:12px;color:#6b7280">' + cd.phone + '</p>' : ''}
        ${cd.email ? '<p style="font-size:12px;color:#6b7280">' + cd.email + '</p>' : ''}
        ${cd.gst ? '<p style="font-size:11px;color:#6b7280">GSTIN: ' + cd.gst + '</p>' : ''}
      </div>
      <div style="text-align:right">
        <p style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:10px">${docTitleUpper} NO:</p>
        <p style="font-weight:900;font-size:28px;font-family:monospace">#${invoiceNumber}</p>
        <p style="font-size:12px;color:#6b7280;margin-top:6px">${invoiceDate}</p>
        ${docType === "quotation" ? (
          validityDate ? '<p style="font-size:12px;color:#6b7280">Valid Till: ' + validityDate + '</p>' : ''
        ) : (
          dueDate ? '<p style="font-size:12px;color:#6b7280">Due: ' + dueDate + '</p>' : ''
        )}
        ${poNumber ? '<p style="font-size:12px;color:#6b7280">PO: ' + poNumber + '</p>' : ''}
      </div>
    </div>
    <table style="width:100%;border-collapse:collapse">
      <thead><tr style="border-top:2.5px solid #1a1a1a;border-bottom:2.5px solid #1a1a1a;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px">
        <th style="padding:11px 14px;text-align:left">DESCRIPTION</th>
        ${!isChallan ? '<th style="padding:11px 14px;text-align:right">UNIT PRICE</th>' : ''}
        <th style="padding:11px 14px;text-align:right">QTY</th>
        ${!isChallan ? '<th style="padding:11px 14px;text-align:right">TOTAL</th>' : ''}
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>
    ${!isChallan ? `
    <div style="display:flex;justify-content:flex-end;margin-top:20px;margin-bottom:20px">
      <table style="border-collapse:collapse;min-width:240px">
        ${summaryEntries.filter(e => e.label !== 'Subtotal').map(e => `
          <tr>
            <td style="padding:6px 24px 6px 0;font-size:12px;color:#6b7280;text-align:right;text-transform:uppercase;letter-spacing:1px">${e.label}</td>
            <td style="padding:6px 0;font-size:12px;text-align:right;font-family:monospace;color:${e.red ? '#ef4444' : '#1a1a1a'}">${e.value}</td>
          </tr>
        `).join('')}
      </table>
    </div>
    <div style="border-top:2.5px solid #1a1a1a;border-bottom:2.5px solid #1a1a1a;padding:12px 0;display:flex;justify-content:space-between;font-weight:900;font-size:24px;margin-top:0">
      <span style="letter-spacing:2px">AMOUNT DUE</span><span style="font-family:monospace">${cs}${grandTotal.toFixed(2)}</span>
    </div>
    <div style="text-align:right;font-size:11px;color:#6b7280;margin-top:8px"><strong>Amount in Words:</strong> ${amountInWords}</div>
    ` : ''}
    <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-top:auto;padding-top:48px">
      <div style="font-size:12px;color:#6b7280;max-width:280px">
        ${(activeBankDetails && (activeBankDetails.bankName || activeBankDetails.accountNumber))
          ? '<p style="font-weight:700;color:#1a1a1a;margin-bottom:6px;font-size:12px">BANK DETAILS</p>' +
          (activeBankDetails.bankName ? '<p>Bank: ' + activeBankDetails.bankName + '</p>' : '') +
          (activeBankDetails.accountName ? '<p>Account Name: ' + activeBankDetails.accountName + '</p>' : '') +
          (activeBankDetails.accountNumber ? '<p>Account No.: ' + activeBankDetails.accountNumber + '</p>' : '') +
          (activeBankDetails.ifsc ? '<p>IFSC: ' + activeBankDetails.ifsc + '</p>' : '') +
          (activeBankDetails.upi ? '<p>UPI: ' + activeBankDetails.upi + '</p>' : '') +
          (dueDate ? '<p style="margin-top:6px">Pay by: ' + dueDate + '</p>' : '')
          : (bizAddress ? '<p>' + bizPhone + '</p><p>' + bizEmail + '</p>' : '')
        }
        ${notes ? '<p style="margin-top:12px"><em>' + notes + '</em></p>' : ''}
        ${paymentTerms ? '<p style="margin-top:4px"><strong>Terms:</strong> ' + paymentTerms + '</p>' : ''}
      </div>
      <div style="text-align:right">
        <div style="margin-bottom:24px;border-top:1px solid #1a1a1a;padding-top:8px;display:inline-block;min-width:160px;text-align:center">
          <p style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px">Authorized Signatory</p>
        </div>
        <p style="font-family:Georgia,serif;font-size:36px;font-style:italic;color:#374151">thank you</p>
        <p style="font-size:11px;color:#9ca3af;margin-top:4px">${invoiceFooterNote}</p>
      </div>
    </div>
  </div>
  <div style="border-top:2px solid #1a1a1a;padding:12px 52px;display:flex;justify-content:space-between;align-items:center;background:#f9fafb;margin-top:auto">
    <p style="font-size:12px;color:#6b7280">${bizName} &bull; ${bizEmail || bizPhone}</p>
    <p style="font-size:10px;color:#9ca3af">Generated by UnifiedDesk</p>
  </div>
</div>
</body></html>`
  }

  // ── TEMPLATE 4: AIZEN BOLD ────────────────────────────────────────────────
  if (selectedTemplate === 'aizen-bold') {
    const rows = computedRows.map((r, i) =>
      '<tr style="background:' + (i % 2 === 0 ? '#f9fafb' : '#fff') + ';border-bottom:1px solid #e5e7eb">' +
      '<td style="padding:11px 14px;font-size:12px;color:#374151">' + r.item.name + (r.item.description ? '<div style="font-size:10px;color:#9ca3af;margin-top:2px">' + r.item.description + '</div>' : '') + '</td>' +
      '<td style="padding:11px 14px;font-size:12px;text-align:center;color:#374151">' + r.item.quantity + (r.item.unit ? ' ' + r.item.unit : '') + '</td>' +
      '<td style="padding:11px 14px;font-size:12px;text-align:right;font-family:monospace;color:#374151">' + cs + Number(r.item.price).toFixed(2) + '</td>' +
      '<td style="padding:11px 14px;font-size:12px;text-align:right;font-family:monospace;font-weight:700;color:#1a1a1a">' + cs + r.lineTotal.toFixed(2) + '</td>' +
      '</tr>'
    ).join('')

    return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${docTitleUpper} ${invoiceNumber}</title>
<style>*{box-sizing:border-box;margin:0;padding:0}html,body{height:100%}body{font-family:Arial,sans-serif;background:#fff;color:#1a1a1a;font-size:13px;min-height:100%}@page{size:A4;margin:0}@media print{html,body{height:100%;-webkit-print-color-adjust:exact;print-color-adjust:exact}}</style></head>
<body>
<div style="max-width:794px;margin:0 auto;min-height:100vh;display:flex;flex-direction:column;background:#fff">
  <div style="padding:24px 44px 20px;position:relative;overflow:hidden;display:flex;align-items:center;gap:16px;background:#fff;border-bottom:1px solid #e5e7eb">
    <div style="position:absolute;top:0;right:0;width:0;height:0;border-left:70px solid transparent;border-top:70px solid #1a1a1a"></div>
    <div style="position:absolute;top:0;right:38px;width:0;height:0;border-left:36px solid transparent;border-top:36px solid #ef4444"></div>
    ${bizLogo
      ? '<img src="' + bizLogo + '" style="width:42px;height:42px;object-fit:contain;border-radius:4px">'
      : '<div style="width:42px;height:42px;background:#ef4444;border-radius:4px;display:flex;align-items:center;justify-content:center;font-weight:900;color:#fff;font-size:20px;flex-shrink:0">' + bizName.charAt(0) + '</div>'
    }
    <div>
      <p style="font-weight:900;font-size:16px;line-height:1.1;color:#1a1a1a">${bizName.toUpperCase()}</p>
      <p style="font-size:10px;color:#9ca3af;letter-spacing:2px;text-transform:uppercase">${bizTagline || 'Professional Services'}</p>
    </div>
  </div>
  <p style="text-align:center;font-weight:900;font-size:30px;letter-spacing:8px;padding:14px 0;border-bottom:1px solid #e5e7eb;margin:0">${docTitleUpper}</p>
  <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:20px;padding:20px 44px;border-bottom:1px solid #e5e7eb;font-size:12px">
    <div>
      <p style="color:#9ca3af;margin-bottom:4px;font-size:10px;text-transform:uppercase;letter-spacing:1px">${docTitle} To:</p>
      <p style="font-weight:700;font-size:13px">${cd.name || '—'}</p>
      ${cd.address ? '<p style="color:#6b7280;margin-top:2px;line-height:1.5">' + cd.address + '</p>' : ''}
      ${cd.phone ? '<p style="color:#6b7280">' + cd.phone + '</p>' : ''}
      ${cd.email ? '<p style="color:#6b7280">' + cd.email + '</p>' : ''}
      ${cd.gst ? '<p style="color:#6b7280">GSTIN: ' + cd.gst + '</p>' : ''}
    </div>
    <div>
      <p style="color:#9ca3af;margin-bottom:4px;font-size:10px;text-transform:uppercase;letter-spacing:1px">From:</p>
      <p style="font-weight:700;font-size:13px">${bizName}</p>
      ${bizAddress ? '<p style="color:#6b7280;margin-top:2px;line-height:1.5">' + bizAddress + '</p>' : ''}
      ${bizPhone ? '<p style="color:#6b7280">' + bizPhone + '</p>' : ''}
      ${bizGstin ? '<p style="color:#6b7280">GSTIN: ' + bizGstin + '</p>' : ''}
    </div>
    <div style="text-align:right">
      <p style="color:#9ca3af;margin-bottom:4px">Date: ${invoiceDate}</p>
      <p style="font-family:monospace">${docTitle}: ${invoiceNumber}</p>
      ${docType === "quotation" ? (
          validityDate ? '<p style="color:#6b7280">Valid Till: ' + validityDate + '</p>' : ''
        ) : (
          dueDate ? '<p style="color:#6b7280">Due: ' + dueDate + '</p>' : ''
        )}
      ${poNumber ? '<p style="color:#6b7280">PO #: ' + poNumber + '</p>' : ''}
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
      <tbody>${rows}</tbody>
    </table>
    <div style="display:flex;justify-content:flex-end;margin-top:24px;margin-bottom:24px">
      <table style="border-collapse:collapse;min-width:280px">
        ${summaryEntries.map(e => `
          <tr>
            <td style="padding:6px 24px 6px 0;font-size:12px;color:#6b7280;text-align:right;text-transform:uppercase;letter-spacing:1px">${e.label}</td>
            <td style="padding:6px 0;font-size:12px;text-align:right;font-family:monospace;color:${e.red ? '#ef4444' : '#1a1a1a'}">${e.value}</td>
          </tr>
        `).join('')}
        <tr>
          <td style="padding:16px 24px 16px 0;font-size:16px;font-weight:900;color:#1a1a1a;text-align:right;text-transform:uppercase;letter-spacing:1px">Grand Total</td>
          <td style="padding:0;text-align:right">
            <div style="background:#ef4444;color:#fff;font-weight:900;font-size:26px;padding:12px 24px;border-radius:4px;white-space:nowrap;display:inline-block">
              ${cs}${grandTotal.toFixed(2)}
            </div>
          </td>
        </tr>
      </table>
    </div>
    <div style="text-align:right;font-size:11px;color:#6b7280;margin-bottom:20px;margin-top:-10px"><strong>Amount in Words:</strong> ${amountInWords}</div>
    <div style="margin-top:auto;padding-top:40px;display:flex;justify-content:space-between;align-items:flex-end">
      <div style="max-width:320px">
        ${bankHtml ? '<div style="font-size:12px;color:#6b7280"><strong style="color:#1a1a1a">Payment Details</strong><br>' + bankHtml + '</div>' : ''}
        ${notes ? '<div style="margin-top:16px;font-size:12px;color:#6b7280"><strong>Note:</strong> ' + notes + '</div>' : ''}
        ${paymentTerms ? '<div style="margin-top:8px;font-size:12px;color:#6b7280"><strong>Payment Terms:</strong> ' + paymentTerms + '</div>' : ''}
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
    <p style="color:rgba(255,255,255,0.8);font-size:12px;font-style:italic">${invoiceFooterNote}</p>
    <p style="color:rgba(255,255,255,0.4);font-size:10px">Generated by UnifiedDesk</p>
  </div>
</div>
</body></html>`
  }

  // ── TEMPLATE 5: SIMPLE BOXED ──────────────────────────────────────────────
  if (selectedTemplate === 'simple-boxed') {
    const rows = computedRows.map((r, i) =>
      '<tr style="background:' + (i % 2 === 0 ? '#fff' : '#f8f9fb') + ';border-bottom:1px solid #edf0f5">' +
      '<td style="padding:11px 10px;font-size:12px;text-align:center;color:#6b7280;width:40px;border-right:1px solid #edf0f5">' + (i + 1) + '</td>' +
      '<td style="padding:11px 14px;font-size:12px;color:#1e2d5b">' + r.item.name + (r.item.description ? '<div style="font-size:10px;color:#9ca3af;margin-top:2px">' + r.item.description + '</div>' : '') + '</td>' +
      '<td style="padding:11px 14px;font-size:12px;text-align:center;color:#374151">' + r.item.quantity + (r.item.unit ? ' ' + r.item.unit : '') + '</td>' +
      '<td style="padding:11px 14px;font-size:12px;text-align:right;font-family:monospace;color:#374151">' + cs + Number(r.item.price).toFixed(2) + '</td>' +
      '<td style="padding:11px 14px;font-size:12px;text-align:right;font-family:monospace;font-weight:700;color:#1e2d5b">' + cs + r.lineTotal.toFixed(2) + '</td>' +
      '</tr>'
    ).join('')

    const sumRows = summaryEntries.map(e =>
      '<tr><td style="padding:5px 20px 5px 0;font-size:12px;color:#6b7280;text-align:right">' + e.label + '</td><td style="padding:5px 0;font-size:12px;text-align:right;font-family:monospace;color:' + (e.red ? '#ef4444' : '#1e2d5b') + '">' + e.value + '</td></tr>'
    ).join('')

    return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>INVOICE ${invoiceNumber}</title>
<style>*{box-sizing:border-box;margin:0;padding:0}html,body{height:100%}body{font-family:Arial,sans-serif;background:#fff;color:#1a1a1a;font-size:13px;min-height:100%}@page{size:A4;margin:0}@media print{html,body{height:100%;-webkit-print-color-adjust:exact;print-color-adjust:exact}}</style></head>
<body>
<div style="max-width:794px;margin:0 auto;min-height:100vh;display:flex;flex-direction:column;background:#fff">
  <div style="background:#1e2d5b;padding:28px 48px;display:flex;justify-content:space-between;align-items:center">
    <div>
      ${bizLogo
        ? '<img src="' + bizLogo + '" style="height:40px;max-width:110px;object-fit:contain;display:block;margin-bottom:8px">'
        : '<div style="width:40px;height:40px;background:#f47321;border-radius:4px;display:flex;align-items:center;justify-content:center;font-weight:900;color:#fff;font-size:20px;margin-bottom:8px">' + bizName.charAt(0) + '</div>'
      }
      <p style="color:#fff;font-weight:700;font-size:14px">${bizName}</p>
      <p style="color:rgba(255,255,255,0.55);font-size:11px">${bizTagline || bizEmail || ''}</p>
      ${bizPhone ? '<p style="color:rgba(255,255,255,0.5);font-size:10px">' + bizPhone + '</p>' : ''}
    </div>
    <div style="text-align:right">
      <p style="font-weight:900;font-size:38px;color:#fff;letter-spacing:4px;line-height:1">INVOICE</p>
      <p style="font-size:11px;color:rgba(255,255,255,0.6);margin-top:8px">Ref No. ${invoiceNumber}</p>
      <p style="font-size:11px;color:rgba(255,255,255,0.6)">Date: ${invoiceDate}</p>
      ${dueDate ? '<p style="font-size:11px;color:#f47321">Due: ' + dueDate + '</p>' : ''}
    </div>
  </div>
  <div style="background:#eef1f7;padding:9px 48px;border-bottom:1px solid #dce1ed;font-size:11px;color:#6b7280">
    <strong style="color:#1e2d5b">${bizName}</strong> &nbsp;|&nbsp;
    ${[bizAddress, bizGstin ? 'GSTIN: ' + bizGstin : '', bizPhone ? 'Tel: ' + bizPhone : '', bizEmail].filter(Boolean).join('  |  ')}
  </div>
  <div style="flex:1;padding:32px 48px 36px;display:flex;flex-direction:column">
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:32px;margin-bottom:28px;padding-bottom:24px;border-bottom:1px solid #edf0f5">
      <div>
        <p style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#9ca3af;margin-bottom:10px">Billed To</p>
        <p style="font-weight:700;font-size:14px;color:#1e2d5b">${cd.name || '—'}</p>
        ${cd.address ? '<p style="font-size:12px;color:#6b7280;margin-top:4px;line-height:1.5">' + cd.address + '</p>' : ''}
        ${cd.phone ? '<p style="font-size:12px;color:#6b7280">' + cd.phone + '</p>' : ''}
        ${cd.email ? '<p style="font-size:12px;color:#6b7280">' + cd.email + '</p>' : ''}
        ${cd.gst ? '<p style="font-size:11px;color:#6b7280">GSTIN: ' + cd.gst + '</p>' : ''}
        ${placeOfSupply ? '<p style="font-size:10px;color:#9ca3af;margin-top:3px">Place of Supply: ' + placeOfSupply + '</p>' : ''}
      </div>
      <div>
        <p style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#9ca3af;margin-bottom:10px">Invoice Details</p>
        <table style="font-size:12px;border-collapse:collapse;width:100%">
          <tr><td style="color:#6b7280;padding-bottom:5px;width:50%">Invoice No.</td><td style="font-family:monospace;color:#1e2d5b;font-weight:600">${invoiceNumber}</td></tr>
          <tr><td style="color:#6b7280;padding-bottom:5px">Invoice Date</td><td style="color:#1e2d5b">${invoiceDate}</td></tr>
          <tr><td style="color:#6b7280;padding-bottom:5px">Currency</td><td style="color:#1e2d5b">${currency}</td></tr>
          ${poNumber ? '<tr><td style="color:#6b7280;padding-bottom:5px">PO Number</td><td style="color:#1e2d5b;font-family:monospace">' + poNumber + '</td></tr>' : ''}
          ${reverseCharge ? '<tr><td style="color:#6b7280">Reverse Charge</td><td style="color:#ef4444;font-weight:600">Applicable</td></tr>' : ''}
        </table>
      </div>
    </div>
    <table style="width:100%;border-collapse:collapse">
      <thead><tr style="background:#1e2d5b">
        <th style="padding:11px 10px;text-align:center;font-size:11px;font-weight:600;color:#fff;width:40px">No.</th>
        <th style="padding:11px 14px;text-align:left;font-size:11px;font-weight:600;color:#fff">Description</th>
        <th style="padding:11px 14px;text-align:center;font-size:11px;font-weight:600;color:#fff">Quantity</th>
        <th style="padding:11px 14px;text-align:right;font-size:11px;font-weight:600;color:#fff">Unit Price</th>
        <th style="padding:11px 14px;text-align:right;font-size:11px;font-weight:600;color:#fff">Amount</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <div style="display:flex;justify-content:flex-end;margin-top:24px;margin-bottom:24px">
      <table style="border-collapse:collapse;min-width:280px">
        ${sumRows}
        <tr>
          <td style="padding:16px 24px 16px 0;font-size:14px;font-weight:700;color:#1e2d5b;text-align:right;border-top:2.5px solid #1e2d5b">Amount Due</td>
          <td style="padding:14px 20px;background:#1e2d5b;font-size:26px;font-weight:900;color:#fff;font-family:monospace;text-align:right;white-space:nowrap;border-radius:0 0 4px 4px">${cs}${grandTotal.toFixed(2)}</td>
        </tr>
      </table>
    </div>
    <div style="text-align:right;font-size:11px;color:#6b7280;margin-bottom:20px;margin-top:-10px"><strong>Amount in Words:</strong> ${amountInWords}</div>
    ${roundOff ? '<div style="text-align:right;font-size:10px;color:#9ca3af;margin-top:4px">* Amount rounded off</div>' : ''}
    <div style="margin-top:auto;padding-top:48px;display:flex;justify-content:space-between;align-items:flex-end">
      <div style="max-width:320px;font-size:12px;color:#6b7280">
        ${bankHtml ? '<p style="font-weight:700;color:#1e2d5b;margin-bottom:5px">Bank / Payment Details</p><p>' + bankHtml + '</p>' : ''}
        ${notes ? '<p style="margin-top:10px"><strong>Notes:</strong> ' + notes + '</p>' : ''}
        ${paymentTerms ? '<p style="margin-top:4px"><strong>Payment Terms:</strong> ' + paymentTerms + '</p>' : ''}
      </div>
      <div style="text-align:right;min-width:180px">
        <div style="border-top:2px solid #1e2d5b;padding-top:8px;text-align:center">
          <p style="font-size:13px;font-weight:700;color:#1e2d5b">Authorized Signatory</p>
          <p style="font-size:10px;color:#9ca3af;margin-top:2px">For ${bizName}</p>
        </div>
      </div>
    </div>
  </div>
  <div style="background:#eef1f7;padding:14px 48px;display:flex;justify-content:space-between;align-items:center;border-top:2.5px solid #1e2d5b;margin-top:auto">
    <p style="font-size:12px;color:#6b7280;font-style:italic">${invoiceFooterNote}</p>
    <p style="font-size:10px;color:#9ca3af">Generated by UnifiedDesk</p>
  </div>
</div>
</body></html>`
  }

  // ── TEMPLATE 6: FALLBACK (clean-teal) ─────────────────────────────────────
  const rows = computedRows.map((r, i) =>
    '<tr style="border-bottom:1px solid #e2e8f0;background:' + (i % 2 === 0 ? '#fff' : '#f0fdfe') + '">' +
    '<td style="padding:8px 10px;font-size:11px;text-align:center;border-right:1px solid #e2e8f0;color:#555">' + (i + 1) + '</td>' +
    '<td style="padding:8px 12px;font-size:12px;color:#1a1a1a">' + r.item.name + '</td>' +
    '<td style="padding:8px 12px;font-size:12px;text-align:right;color:#1a1a1a">' + cs + r.lineTotal.toFixed(2) + '</td>' +
    '</tr>'
  ).join('')
  return '<!DOCTYPE html><html><head><meta charset="utf-8"><title>' + docTitleUpper + ' ' + invoiceNumber + '</title><style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:Arial,sans-serif;background:#fff;font-size:13px}@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}</style></head><body><div style="max-width:800px;margin:0 auto;padding:36px">' +
    '<div style="display:flex;justify-content:space-between;margin-bottom:28px"><p style="font-size:48px;font-weight:900;color:#0E7490;letter-spacing:-2px;line-height:1">' + docTitleUpper + '</p><div style="text-align:right;border:1px solid #e2e8f0;padding:10px 16px;font-size:11px"><div><span style="color:#94a3b8">Date:</span> ' + invoiceDate + '</div><div><span style="color:#94a3b8">' + docTitle + ' No:</span> ' + invoiceNumber + '</div></div></div>' +
    '<table style="width:100%;border-collapse:collapse;border:1px solid #cbd5e1"><thead><tr style="background:#0E7490;color:#fff"><th style="padding:9px 10px;font-size:11px;text-align:center;width:36px">SL</th><th style="padding:9px 12px;font-size:11px;text-align:left">Description</th><th style="padding:9px 12px;font-size:11px;text-align:right">Amount</th></tr></thead><tbody>' + rows + '<tr style="border-top:2px solid #0E7490"><td colspan="2" style="padding:10px 12px;font-size:12px;font-weight:700;text-align:right">Total</td><td style="padding:10px 12px;font-size:13px;font-weight:800;text-align:right;color:#0E7490">' + cs + grandTotal.toFixed(2) + '</td></tr></tbody></table>' +
    (!isChallan ? '<div style="text-align:right;font-size:11px;color:#64748b;margin-top:8px"><strong>Amount in Words:</strong> ' + amountInWords + '</div>' : '') +
    '<div style="margin-top:16px;text-align:center;font-size:10px;color:#94a3b8;border-top:1px solid #e2e8f0;padding-top:10px">' + invoiceFooterNote + ' &bull; Generated by UnifiedDesk</div>' +
    '</div></body></html>'
}

export function printInvoice(invoice) {
  // Load templates/configs from LocalStorage
  let companyDetails = {};
  try {
    companyDetails = JSON.parse(localStorage.getItem("company-details") || "{}");
  } catch (e) {}

  let selectedTemplate = "clean-teal";
  try {
    selectedTemplate = JSON.parse(localStorage.getItem("selected-template") || '"clean-teal"');
  } catch (e) {}

  let importedTemplate = null;
  try {
    importedTemplate = JSON.parse(localStorage.getItem("imported-template") || "null");
  } catch (e) {}

  const html = buildInvoiceHtml(invoice, companyDetails, selectedTemplate, importedTemplate)

  const iframe = document.createElement("iframe")
  iframe.style.display = "none"
  document.body.appendChild(iframe)
  const doc = iframe.contentDocument || iframe.contentWindow.document

  doc.open()
  doc.write(html)
  doc.close()

  iframe.contentWindow.focus()
  setTimeout(() => {
    iframe.contentWindow.print()
    setTimeout(() => {
      document.body.removeChild(iframe)
    }, 1000)
  }, 500)
}

export async function sendInvoiceEmail(invoice, companyDetails, selectedTemplate, importedTemplate, emailTo) {
  const docType = invoice.type || "invoice"
  const docTitle = docType === "quotation" ? "Quotation" : docType === "challan" ? "Delivery Challan" : docType === "proforma" ? "Proforma Invoice" : "Invoice"
  const docTitleUpper = docTitle.toUpperCase()
  const invoiceNumber = invoice.invoiceNumber || ""

  const html = buildInvoiceHtml(invoice, companyDetails, selectedTemplate, importedTemplate)
  const finalSubject = `${docTitle} ${invoiceNumber} from ${companyDetails.name || 'UnifiedDesk'}`
  const apiUrl = OpenAPI.BASE || ''

  await axios.post(`${apiUrl}/api/v1/utils/send-invoice/`, {
    email_to: emailTo,
    subject: finalSubject,
    html_content: html
  })
}

export function downloadInvoicePdf(invoice) {
  try {
    printInvoice(invoice)
  } catch (error) {
    console.error("downloadInvoicePdf error:", error)
    toast.error("PDF download failed: " + error.message)
  }
}
