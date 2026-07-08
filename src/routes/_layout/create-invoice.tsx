import { ArrowLeft } from "lucide-react"
import { Link } from "react-router"
import { ModernExcelTable } from "@/components/modern-excel-table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form } from "@/components/ui/form"
import { AdjustmentsSection } from "@/features/invoices/invoice-form/components/AdjustmentsSection"
import { BankDetailsSection } from "@/features/invoices/invoice-form/components/BankDetailsSection"
import { CustomerSection } from "@/features/invoices/invoice-form/components/CustomerSection"
import { InvoiceDetailsSection } from "@/features/invoices/invoice-form/components/InvoiceDetailsSection"
import { InvoicePreviewDialog } from "@/features/invoices/invoice-form/components/InvoicePreviewDialog"
import { NotesSection } from "@/features/invoices/invoice-form/components/NotesSection"
import { SummarySidebar } from "@/features/invoices/invoice-form/components/SummarySidebar"
import { useInvoiceForm } from "@/features/invoices/invoice-form/hooks/useInvoiceForm"
import { useDocumentTitle } from "@/hooks/useDocumentTitle"

function CreateInvoicePage() {
  useDocumentTitle("Create Invoice")
  const {
    form,
    customers,
    selectedCustomerId,
    invoiceNumber,
    items,
    showBankDetails,
    inventoryItems,
    previewOpen,
    currencySymbol,
    calculations,
    shippingCharge,
    extraChargeLabel,
    extraChargeAmount,
    handleCustomerSelect,
    handleItemSelect,
    addItem,
    removeItem,
    updateItem,
    onSubmit,
    handleDownloadPDF,
    handlePreviewAndPrint,
    handleWhatsApp,
    handleEmail,
    setShowBankDetails,
    setPreviewOpen,
    previewHtml,
  } = useInvoiceForm()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Link to="/invoices">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Create Invoice</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Build and send professional invoices
          </p>
        </div>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit as any)}
          className="grid grid-cols-1 lg:grid-cols-3 gap-4"
        >
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Customer Details</CardTitle>
              </CardHeader>
              <CardContent>
                <CustomerSection
                  form={form}
                  customers={customers}
                  selectedCustomerId={selectedCustomerId}
                  onCustomerSelect={handleCustomerSelect}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Invoice Details</CardTitle>
              </CardHeader>
              <CardContent>
                <InvoiceDetailsSection
                  form={form}
                  invoiceNumber={invoiceNumber}
                />
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-lg">Invoice Items</CardTitle>
                <p className="text-xs text-muted-foreground italic">
                  Tip: Use arrow keys to navigate table cells
                </p>
              </CardHeader>
              <CardContent>
                <ModernExcelTable
                  items={items as any}
                  inventoryItems={inventoryItems as any}
                  updateItem={updateItem as any}
                  handleItemSelect={handleItemSelect}
                  addItem={addItem}
                  removeItem={removeItem}
                  currencySymbol={currencySymbol}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Adjustments & Charges</CardTitle>
              </CardHeader>
              <CardContent>
                <AdjustmentsSection form={form} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <BankDetailsSection
                  form={form}
                  showBankDetails={showBankDetails}
                  onToggle={() => setShowBankDetails((v) => !v)}
                />
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Notes & Terms</CardTitle>
              </CardHeader>
              <CardContent>
                <NotesSection form={form} />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <SummarySidebar
              calculations={calculations}
              currencySymbol={currencySymbol}
              shippingCharge={shippingCharge}
              extraChargeLabel={extraChargeLabel}
              extraChargeAmount={extraChargeAmount}
              roundOff={form.watch("roundOff") || false}
              grandTotal={calculations.grandTotal}
              onPreview={handlePreviewAndPrint}
              onDownload={handleDownloadPDF}
              onWhatsApp={handleWhatsApp}
              onEmail={handleEmail}
            />
          </div>
        </form>
      </Form>

      <InvoicePreviewDialog
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        html={previewHtml}
        onDownload={handleDownloadPDF}
      />
    </div>
  )
}

export default CreateInvoicePage
