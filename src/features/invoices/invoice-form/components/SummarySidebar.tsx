import { Download, Eye, Mail, Save, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import type { InvoiceCalculations } from "../types"

interface SummarySidebarProps {
  calculations: InvoiceCalculations
  currencySymbol: string
  shippingCharge: number
  extraChargeLabel: string
  extraChargeAmount: number
  roundOff: boolean
  grandTotal: number
  onPreview: () => void
  onDownload: () => void
  onWhatsApp: () => void
  onEmail: () => void
}

export function SummarySidebar({
  calculations,
  currencySymbol,
  shippingCharge,
  extraChargeLabel,
  extraChargeAmount,
  roundOff,
  grandTotal,
  onPreview,
  onDownload,
  onWhatsApp,
  onEmail,
}: SummarySidebarProps) {
  const { subtotal, totalTax, itemsDiscount, invoiceDiscount } = calculations

  return (
    <Card className="sticky top-24">
      <CardHeader>
        <CardTitle className="text-lg">Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span>
            {currencySymbol}
            {subtotal.toFixed(2)}
          </span>
        </div>
        {itemsDiscount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Item Discounts</span>
            <span className="text-emerald-600">
              −{currencySymbol}
              {itemsDiscount.toFixed(2)}
            </span>
          </div>
        )}
        {invoiceDiscount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Invoice Discount</span>
            <span className="text-emerald-600">
              −{currencySymbol}
              {invoiceDiscount.toFixed(2)}
            </span>
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Tax / GST</span>
          <span>
            {currencySymbol}
            {totalTax.toFixed(2)}
          </span>
        </div>
        {Number(shippingCharge) > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Shipping</span>
            <span>
              +{currencySymbol}
              {Number(shippingCharge).toFixed(2)}
            </span>
          </div>
        )}
        {Number(extraChargeAmount) > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              {extraChargeLabel || "Other Charges"}
            </span>
            <span>
              +{currencySymbol}
              {Number(extraChargeAmount).toFixed(2)}
            </span>
          </div>
        )}
        {roundOff && (
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Round Off</span>
            <span className="text-muted-foreground">
              {Math.round(grandTotal) - grandTotal >= 0 ? "+" : ""}
              {(Math.round(grandTotal) - grandTotal).toFixed(2)}
            </span>
          </div>
        )}
        <Separator />
        <div className="flex justify-between font-bold text-lg">
          <span>Total</span>
          <span className="text-primary">
            {currencySymbol}
            {grandTotal.toFixed(2)}
          </span>
        </div>

        <Separator />

        <div className="space-y-2 pt-2">
          <Button
            type="button"
            className="w-full"
            variant="outline"
            onClick={onPreview}
          >
            <Eye className="mr-2 h-4 w-4" /> Preview Invoice
          </Button>
          <Button type="submit" className="w-full">
            <Save className="mr-2 h-4 w-4" /> Save Invoice
          </Button>
          <Button
            type="button"
            className="w-full"
            variant="outline"
            onClick={onDownload}
          >
            <Download className="mr-2 h-4 w-4" /> Download PDF
          </Button>
          <Separator />
          <Button
            type="button"
            className="w-full"
            variant="outline"
            onClick={onWhatsApp}
          >
            <Send className="mr-2 h-4 w-4" /> Send via WhatsApp
          </Button>
          <Button
            type="button"
            className="w-full"
            variant="outline"
            onClick={onEmail}
          >
            <Mail className="mr-2 h-4 w-4" /> Send via Email
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
