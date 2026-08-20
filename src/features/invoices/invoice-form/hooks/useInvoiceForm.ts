import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery } from "@tanstack/react-query"
import html2pdf from "html2pdf.js"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { useSearchParams } from "react-router"
import {
  CustomersService,
  InvoicesService,
  ItemsService,
} from "@/client/sdk.gen"
import { companySettingsQueryOptions } from "@/features/company-settings/queries"
import {
  customersListQueryOptions,
  customersQueryKeys,
} from "@/features/customers/queries"
import { invoiceTemplateActiveQueryOptions } from "@/features/invoice-templates/queries"
import { invoicesQueryKeys } from "@/features/invoices/queries"
import { itemsListQueryOptions, itemsQueryKeys } from "@/features/items/queries"
import useCustomToast from "@/hooks/useCustomToast"
import { queryClient } from "@/queryClient"
import {
  defaultFormValues,
  emptyItem,
  type InvoiceFormData,
  invoiceFormSchema,
  resolveDocumentConfig,
} from "../constants"
import { buildInvoiceHtml } from "../templates"
import type {
  CompanyDetails,
  Customer,
  InventoryItem,
  InvoiceCalculations,
  InvoiceItem,
} from "../types"
import {
  buildInvoicePayload,
  buildWhatsAppText,
  computeInvoiceTotals,
  fillCustomerForm,
  generateDocumentNumber,
  getActiveBankDetails,
  getCurrencySymbol,
} from "../utils"

export function useInvoiceForm() {
  const { data: itemsRes } = useQuery(itemsListQueryOptions())
  const inventoryItems: InventoryItem[] = useMemo(
    () => (itemsRes?.data ?? []) as unknown as InventoryItem[],
    [itemsRes],
  )
  const { data: companySettings } = useQuery(companySettingsQueryOptions())
  const companyDetails: CompanyDetails = useMemo(
    () => ({
      name: companySettings?.name ?? "",
      email: companySettings?.email ?? "",
      phone: companySettings?.phone ?? "",
      address: companySettings?.address ?? "",
      city: companySettings?.city ?? "",
      state: companySettings?.state ?? "",
      pincode: companySettings?.pincode ?? "",
      gstin: companySettings?.gstin ?? "",
      logo: companySettings?.logo_url ?? null,
      bankName: companySettings?.bank_name ?? "",
      accountName: companySettings?.name ?? "",
      accountNumber: companySettings?.bank_account ?? "",
      ifsc: companySettings?.bank_ifsc ?? "",
      branch: companySettings?.bank_branch ?? "",
      upi: companySettings?.upi_id ?? "",
      invoiceFooter: companySettings?.terms_and_conditions ?? "",
      tagline: "",
    }),
    [companySettings],
  )
  const { showSuccessToast, showErrorToast } = useCustomToast()
  const savedRef = useRef<boolean>(false)
  const [searchParams] = useSearchParams()
  const preselectedCustomerId = searchParams.get("customerId") ?? undefined
  const preselectedItemId = searchParams.get("itemId") ?? undefined
  const documentConfig = resolveDocumentConfig(searchParams.get("documentType"))

  const { data: activeTemplate } = useQuery(invoiceTemplateActiveQueryOptions())

  const selectedTemplate =
    activeTemplate?.kind === "built_in"
      ? activeTemplate?.built_in_id
      : activeTemplate?.kind === "custom"
        ? "custom"
        : activeTemplate?.kind === "imported_html" ||
            activeTemplate?.kind === "imported_pdf" ||
            activeTemplate?.kind === "imported_excel"
          ? "imported"
          : "clean-teal"

  const { data: customersRes } = useQuery(customersListQueryOptions())
  const customers: Customer[] = (customersRes?.data ?? []).filter(
    Boolean,
  ) as unknown as Customer[]

  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("")
  const resolvedPrefix = useMemo(() => {
    const settingsPrefix =
      companySettings?.[
        `${documentConfig.type}_prefix` as keyof typeof companySettings
      ]
    if (settingsPrefix && typeof settingsPrefix === "string") {
      return settingsPrefix.replace(/-+$/, "")
    }
    return documentConfig.numberPrefix
  }, [companySettings, documentConfig.type, documentConfig.numberPrefix])

  const [invoiceNumber] = useState<string>(() =>
    generateDocumentNumber(resolvedPrefix),
  )
  const [items, setItems] = useState<InvoiceItem[]>([{ ...emptyItem }])
  const [showBankDetails, setShowBankDetails] = useState<boolean>(false)
  const [previewOpen, setPreviewOpen] = useState<boolean>(false)

  const form = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceFormSchema) as any,
    defaultValues: defaultFormValues,
  })

  const discountType = form.watch("discountType")
  const discountValue = form.watch("discountValue") || 0
  const shippingCharge = form.watch("shippingCharge") || 0
  const extraChargeAmount = form.watch("extraChargeAmount") || 0
  const extraChargeLabel = form.watch("extraChargeLabel") || "Handling Charges"
  const roundOff = form.watch("roundOff") || false
  const currency = form.watch("currency")

  const createCustomerMutation = useMutation({
    mutationFn: async (payload: any) =>
      CustomersService.createCustomer({ requestBody: payload }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: customersQueryKeys.all })
    },
  })

  const createInvoiceMutation = useMutation({
    mutationFn: async (payload: any) =>
      InvoicesService.createInvoice({ requestBody: payload }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: invoicesQueryKeys.all })
    },
  })

  const handleCustomerSelect = useCallback(
    (value: string) => {
      setSelectedCustomerId(value)
      fillCustomerForm(form, value, customers)
    },
    [customers, form],
  )

  const handleItemSelect = useCallback(
    (index: number, itemId: string) => {
      const invItem = inventoryItems.find((i) => i.id === itemId)
      if (!invItem) return
      setItems((prev) =>
        prev.map((item, i) =>
          i === index
            ? {
                ...item,
                itemId: invItem.id,
                name: invItem.name,
                description: invItem.description || "",
                price: invItem.salePrice || 0,
                tax: invItem.taxRate || 0,
                unit: invItem.unit || "pcs",
              }
            : item,
        ),
      )
    },
    [inventoryItems],
  )

  useEffect(() => {
    if (preselectedCustomerId && customers.length > 0) {
      handleCustomerSelect(preselectedCustomerId)
    }
    if (
      preselectedItemId &&
      inventoryItems.length > 0 &&
      items.length === 1 &&
      items[0].name === ""
    ) {
      handleItemSelect(0, preselectedItemId)
    }
  }, [
    preselectedCustomerId,
    preselectedItemId,
    customers.length,
    inventoryItems.length,
    items.length,
    items[0]?.name,
    handleCustomerSelect,
    handleItemSelect,
  ])

  const addItem = () => setItems((prev) => [...prev, { ...emptyItem }])
  const removeItem = (index: number) =>
    setItems((prev) => prev.filter((_, i) => i !== index))

  const updateItem = (
    index: number,
    field: keyof InvoiceItem,
    value: string | number,
  ) => {
    setItems((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              [field]: ["quantity", "price", "tax", "discount"].includes(field)
                ? Number(value) || 0
                : value,
            }
          : item,
      ),
    )
  }

  const calculations: InvoiceCalculations = useMemo(
    () =>
      computeInvoiceTotals(
        items,
        discountType,
        discountValue,
        shippingCharge,
        extraChargeAmount,
        roundOff,
      ),
    [
      items,
      discountType,
      discountValue,
      shippingCharge,
      extraChargeAmount,
      roundOff,
    ],
  )

  const currencySymbol = useMemo(() => getCurrencySymbol(currency), [currency])

  const onSubmit = async (formData: InvoiceFormData) => {
    if (items.length === 0 || !items[0].name) {
      showErrorToast("Please add at least one item")
      return
    }
    if (savedRef.current) return
    savedRef.current = true

    try {
      let customerId = selectedCustomerId
      if (!customerId || customerId === "__new__") {
        const existing = (customersRes?.data ?? []).find(
          (c) =>
            (c.email &&
              formData.customerEmail &&
              c.email.toLowerCase() === formData.customerEmail.toLowerCase()) ||
            c.name.trim().toLowerCase() ===
              formData.customerName.trim().toLowerCase(),
        )
        if (existing) {
          customerId = existing.id
        } else {
          const created = await createCustomerMutation.mutateAsync({
            name: formData.customerName,
            phone: formData.customerPhone || null,
            email: formData.customerEmail || null,
            address: formData.customerAddress || null,
            gst: formData.customerGst
              ? formData.customerGst.toUpperCase()
              : null,
            notes: formData.notes || null,
          })
          customerId = created.id
        }
        setSelectedCustomerId(customerId)
      }

      const payload = buildInvoicePayload(
        invoiceNumber,
        documentConfig,
        formData,
        items,
        calculations.subtotal,
        calculations.totalTax,
        calculations.grandTotal,
        calculations.invoiceDiscount,
      )
      payload.customer_id = customerId

      const _created = await createInvoiceMutation.mutateAsync(payload)
      showSuccessToast(`${documentConfig.singular} saved successfully`)

      if (documentConfig.deductsStock) {
        for (const line of items) {
          if (!line.itemId || !line.quantity) continue
          try {
            await ItemsService.adjustStock({
              id: line.itemId,
              quantity: -line.quantity,
              reason: `${documentConfig.singular} ${invoiceNumber}`,
              reference: invoiceNumber,
            })
          } catch {
            showErrorToast(
              `Failed to deduct stock for "${line.name}". Stock may be insufficient.`,
            )
          }
        }
        await queryClient.invalidateQueries({
          queryKey: itemsQueryKeys.all,
        })
      }
    } catch {
      showErrorToast(`Failed to save ${documentConfig.singular.toLowerCase()}`)
    }

    setTimeout(() => {
      savedRef.current = false
    }, 1000)
  }

  const printInvoice = useCallback(() => {
    const html = buildInvoiceHtml({
      formData: form.getValues(),
      companyDetails,
      items,
      invoiceNumber,
      selectedTemplate,
      documentConfig,
      ...calculations,
      shippingCharge,
      extraChargeAmount,
      extraChargeLabel,
      activeBankDetails: getActiveBankDetails(
        showBankDetails,
        form.getValues(),
        companyDetails,
      ),
    })

    const iframe = document.createElement("iframe")
    iframe.style.display = "none"
    document.body.appendChild(iframe)
    const doc = iframe.contentDocument || iframe.contentWindow?.document
    if (!doc) return
    doc.open()
    doc.write(html)
    doc.close()
    iframe.contentWindow?.focus()
    setTimeout(() => {
      iframe.contentWindow?.print()
      setTimeout(() => document.body.removeChild(iframe), 1000)
    }, 500)
  }, [
    form,
    companyDetails,
    items,
    invoiceNumber,
    selectedTemplate,
    calculations,
    shippingCharge,
    extraChargeAmount,
    extraChargeLabel,
    showBankDetails,
    documentConfig,
  ])

  const handleDownloadPDF = useCallback(() => {
    printInvoice()
  }, [printInvoice])

  const handlePreviewAndPrint = useCallback(() => {
    setPreviewOpen(true)
  }, [])

  const handleWhatsApp = useCallback(async () => {
    const activeItems = items.filter(
      (i) => i.name || i.description || i.price > 0,
    )
    if (activeItems.length === 0) {
      showErrorToast("Please add at least one item before sharing.")
      return
    }

    const html = buildInvoiceHtml({
      formData: form.getValues(),
      companyDetails,
      items,
      invoiceNumber,
      selectedTemplate,
      documentConfig,
      ...calculations,
      shippingCharge,
      extraChargeAmount,
      extraChargeLabel,
      activeBankDetails: getActiveBankDetails(
        showBankDetails,
        form.getValues(),
        companyDetails,
      ),
    })

    const filename = `${invoiceNumber}.pdf`
    const formData = form.getValues()
    const text = buildWhatsAppText(
      invoiceNumber,
      formData,
      items,
      calculations.grandTotal,
      currencySymbol,
      documentConfig,
    )

    if (typeof navigator !== "undefined" && navigator.share) {
      showSuccessToast("Generating PDF for sharing...")
      try {
        const opt = {
          margin: 0,
          filename,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, logging: false },
          jsPDF: {
            unit: "mm",
            format: "a4" as const,
            orientation: "portrait" as const,
          },
        }
        const pdfBlob = await html2pdf()
          .set(opt as any)
          .from(html)
          .output("blob")
        const file = new File([pdfBlob], filename, { type: "application/pdf" })
        try {
          await navigator.share({
            files: [file],
            title: `Invoice ${invoiceNumber}`,
            text: `Invoice ${invoiceNumber} from ${companyDetails.name || "AutoInvoice"}`,
          })
          return
        } catch {
          await navigator.share({ title: `Invoice ${invoiceNumber}`, text })
          return
        }
      } catch (err) {
        console.error("Native Share failed:", err)
      }
    }

    if (typeof navigator !== "undefined" && !navigator.share) {
      showSuccessToast(
        "Summary shared. On Desktop, please download and attach PDF manually.",
      )
    }
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank")
  }, [
    items,
    form,
    companyDetails,
    invoiceNumber,
    selectedTemplate,
    calculations,
    shippingCharge,
    extraChargeAmount,
    extraChargeLabel,
    showBankDetails,
    currencySymbol,
    showErrorToast,
    showSuccessToast,
    documentConfig,
  ])

  const handleEmail = useCallback(() => {
    const formData = form.getValues()
    if (!formData.customerEmail) {
      showErrorToast("Please provide a customer email first")
      return
    }
    const docName = documentConfig.singular
    const finalSubject = `${docName} ${invoiceNumber} from ${companyDetails.name || "AutoInvoice"}`
    const amountLine = documentConfig.hidePricing
      ? ""
      : ` for ${currencySymbol}${calculations.grandTotal.toFixed(2)}`
    const mailBody = `Dear ${formData.customerName},\n\nPlease find your ${docName.toLowerCase()} ${invoiceNumber}${amountLine} attached.\n\nThank you for choosing ${companyDetails.name || "AutoInvoice"}.`
    window.open(
      `mailto:${formData.customerEmail}?subject=${encodeURIComponent(finalSubject)}&body=${encodeURIComponent(mailBody)}`,
    )
  }, [
    form,
    invoiceNumber,
    companyDetails,
    currencySymbol,
    calculations.grandTotal,
    showErrorToast,
    documentConfig,
  ])

  const previewHtml = useMemo(() => {
    if (!previewOpen) return ""
    return buildInvoiceHtml({
      formData: form.getValues(),
      companyDetails,
      items,
      invoiceNumber,
      selectedTemplate,
      documentConfig,
      ...calculations,
      shippingCharge,
      extraChargeAmount,
      extraChargeLabel,
      activeBankDetails: getActiveBankDetails(
        showBankDetails,
        form.getValues(),
        companyDetails,
      ),
    })
  }, [
    previewOpen,
    form,
    companyDetails,
    items,
    invoiceNumber,
    selectedTemplate,
    calculations,
    shippingCharge,
    extraChargeAmount,
    extraChargeLabel,
    showBankDetails,
    documentConfig,
  ])

  return {
    form,
    customers,
    selectedCustomerId,
    invoiceNumber,
    documentConfig,
    items,
    showBankDetails,
    previewOpen,
    currencySymbol,
    calculations,
    selectedTemplate,
    companyDetails,
    inventoryItems,
    shippingCharge,
    extraChargeAmount,
    extraChargeLabel,
    handleCustomerSelect,
    handleItemSelect,
    addItem,
    removeItem,
    updateItem,
    onSubmit,
    printInvoice,
    handleDownloadPDF,
    handlePreviewAndPrint,
    handleWhatsApp,
    handleEmail,
    setShowBankDetails,
    setPreviewOpen,
    previewHtml,
  }
}
