import { useMutation, useQuery } from "@tanstack/react-query"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { useSearchParams } from "react-router"
import {
  CustomersService,
  InvoicesService,
  ItemsService,
} from "@/client/sdk.gen"
import type { InvoiceBankDetails, InvoiceCreate } from "@/client/types.gen"
import { companySettingsQueryOptions } from "@/features/company-settings/queries"
import {
  customersListQueryOptions,
  customersQueryKeys,
} from "@/features/customers/queries"
import { invoiceTemplateActiveQueryOptions } from "@/features/invoice-templates/queries"
import { invoicesQueryKeys } from "@/features/invoices/queries"
import { itemsListQueryOptions, itemsQueryKeys } from "@/features/items/queries"
import { usePhoneLayout } from "@/hooks/use-mobile"
import useCustomToast from "@/hooks/useCustomToast"
import { formResolver } from "@/lib/form"
import { fetchInvoicePdf, invoicePdfFilename } from "@/lib/invoicePdf"
import { canShareFiles, downloadFile, shareFile } from "@/lib/share"
import { queryClient } from "@/queryClient"
import { handleError } from "@/utils"
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

const documentPrefixKeys = {
  invoice: "invoice_prefix",
  quotation: "quotation_prefix",
  challan: "challan_prefix",
  proforma: "proforma_prefix",
} as const

/** Per-invoice bank details, sent only when the user turned them on. */
function invoiceBankDetails(
  showBankDetails: boolean,
  formData: InvoiceFormData,
): InvoiceBankDetails | null {
  if (!showBankDetails) return null
  const details: InvoiceBankDetails = {
    bank_name: formData.bankName?.trim() || null,
    account_name: formData.accountName?.trim() || null,
    account_number: formData.accountNumber?.trim() || null,
    ifsc: formData.ifsc?.trim().toUpperCase() || null,
    branch: formData.branch?.trim() || null,
    upi: formData.upi?.trim() || null,
  }
  return Object.values(details).some(Boolean) ? details : null
}

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
      logo: companySettings?.logo_url ?? undefined,
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
  // The save that is running now. A second Save/Download/Share click while
  // it runs waits for the same save instead of starting another one.
  const saveInFlightRef = useRef<Promise<string | null> | null>(null)
  // The invoice this form has saved, and the payload it was saved with.
  // A later Save, Download or Share updates that invoice instead of making
  // a duplicate, and skips the request when nothing changed.
  const savedIdRef = useRef<string | null>(null)
  const savedPayloadRef = useRef<string | null>(null)
  // Phones get the native share sheet; a download is hard to find there.
  const sharePdf = usePhoneLayout() && canShareFiles()
  const [searchParams] = useSearchParams()
  const preselectedCustomerId = searchParams.get("customerId") ?? undefined
  const preselectedItemId = searchParams.get("itemId") ?? undefined
  const documentConfig = resolveDocumentConfig(searchParams.get("documentType"))

  const { data: activeTemplate } = useQuery(invoiceTemplateActiveQueryOptions())

  const selectedTemplate =
    activeTemplate?.kind === "built_in"
      ? (activeTemplate?.built_in_id ?? "clean-teal")
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
      companySettings?.[documentPrefixKeys[documentConfig.type]]
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
    resolver: formResolver(invoiceFormSchema),
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
    mutationFn: async (payload: {
      name: string
      phone?: string | null
      email?: string | null
      address?: string | null
      gst?: string | null
    }) => CustomersService.createCustomer({ requestBody: payload }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: customersQueryKeys.all })
    },
  })

  const createInvoiceMutation = useMutation({
    mutationFn: async (payload: InvoiceCreate) =>
      InvoicesService.createInvoice({ requestBody: payload }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: invoicesQueryKeys.all })
    },
  })

  const sendEmailMutation = useMutation({
    mutationFn: (vars: {
      id: string
      toEmail: string
      subject: string
      message: string
    }) =>
      InvoicesService.sendInvoiceEmail({
        id: vars.id,
        requestBody: {
          to_email: vars.toEmail,
          subject: vars.subject,
          message: vars.message,
        },
      }),
    onSuccess: () => {
      showSuccessToast("Invoice sent via email")
      setEmailDialogOpen(false)
    },
    onError: (error) => handleError.call(showErrorToast, error),
  })

  const [emailDialogOpen, setEmailDialogOpen] = useState(false)
  const [emailDialogInvoiceId, setEmailDialogInvoiceId] = useState<
    string | null
  >(null)
  const [emailDialogDefaults, setEmailDialogDefaults] = useState({
    email: "",
    subject: "",
    message: "",
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

  // Saves the invoice and returns its id, or null if validation/saving failed.
  // Shared by the Save button and the Send via Email flow, which must save
  // (or reuse) a persisted invoice before it can be emailed.
  const saveInvoice = useCallback(
    async (formData: InvoiceFormData): Promise<string | null> => {
      if (items.length === 0 || !items[0].name) {
        showErrorToast("Please add at least one item")
        return null
      }
      if (saveInFlightRef.current) return saveInFlightRef.current

      const run = async (): Promise<string | null> => {
        let createdId: string | null = null
        try {
          let customerId = selectedCustomerId
          if (!customerId || customerId === "__new__") {
            const existing = (customersRes?.data ?? []).find(
              (c): c is NonNullable<typeof c> => {
                if (!c) return false
                return (
                  (c.email &&
                    formData.customerEmail &&
                    c.email.toLowerCase() ===
                      formData.customerEmail.toLowerCase()) ||
                  c.name.trim().toLowerCase() ===
                    formData.customerName.trim().toLowerCase()
                )
              },
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
            invoiceBankDetails(showBankDetails, formData),
          )
          payload.customer_id = customerId
          const payloadKey = JSON.stringify(payload)

          if (savedIdRef.current) {
            createdId = savedIdRef.current
            if (payloadKey !== savedPayloadRef.current) {
              await InvoicesService.updateInvoice({
                id: savedIdRef.current,
                requestBody: payload,
              })
              savedPayloadRef.current = payloadKey
              await queryClient.invalidateQueries({
                queryKey: invoicesQueryKeys.all,
              })
              showSuccessToast(`${documentConfig.singular} updated`)
            }
            return createdId
          }

          const created = await createInvoiceMutation.mutateAsync(payload)
          createdId = created.id
          savedIdRef.current = created.id
          savedPayloadRef.current = payloadKey
          showSuccessToast(`${documentConfig.singular} saved successfully`)

          // Stock moves only on the first save of this document.
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
          showErrorToast(
            `Failed to save ${documentConfig.singular.toLowerCase()}`,
          )
        }
        return createdId
      }

      const pending = run()
      saveInFlightRef.current = pending
      try {
        return await pending
      } finally {
        saveInFlightRef.current = null
      }
    },
    [
      showBankDetails,
      items,
      selectedCustomerId,
      customersRes,
      createCustomerMutation,
      invoiceNumber,
      documentConfig,
      calculations,
      createInvoiceMutation,
      showSuccessToast,
      showErrorToast,
    ],
  )

  const onSubmit = async (formData: InvoiceFormData) => {
    await saveInvoice(formData)
  }

  // Saves (or updates) the document, then has the backend make the PDF.
  const savedDocumentPdf = useCallback(
    async (validData: InvoiceFormData): Promise<File | null> => {
      const id = await saveInvoice(validData)
      if (!id) return null
      showSuccessToast("Preparing PDF…")
      try {
        return await fetchInvoicePdf(
          id,
          invoicePdfFilename(documentConfig.pdfTitle, invoiceNumber),
        )
      } catch (error) {
        showErrorToast(
          error instanceof Error ? error.message : "Could not create the PDF",
        )
        return null
      }
    },
    [
      saveInvoice,
      documentConfig,
      invoiceNumber,
      showSuccessToast,
      showErrorToast,
    ],
  )

  const handleDownloadPDF = useCallback(() => {
    void form.handleSubmit(
      async (validData) => {
        const file = await savedDocumentPdf(validData)
        if (!file) return
        if (sharePdf) {
          await shareFile(file, `${documentConfig.singular} ${invoiceNumber}`)
        } else {
          downloadFile(file)
          showSuccessToast("PDF downloaded")
        }
      },
      () => showErrorToast("Please fix the highlighted fields first"),
    )()
  }, [
    form,
    savedDocumentPdf,
    sharePdf,
    documentConfig,
    invoiceNumber,
    showSuccessToast,
    showErrorToast,
  ])

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

    const formData = form.getValues()
    const text = buildWhatsAppText(
      invoiceNumber,
      formData,
      items,
      calculations.grandTotal,
      currencySymbol,
      documentConfig,
    )

    if (canShareFiles()) {
      await form.handleSubmit(
        async (validData) => {
          const file = await savedDocumentPdf(validData)
          if (file) await shareFile(file, `Invoice ${invoiceNumber}`, text)
        },
        () => showErrorToast("Please fix the highlighted fields first"),
      )()
      return
    }

    showSuccessToast(
      "Summary shared. On Desktop, please download and attach PDF manually.",
    )
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank")
  }, [
    items,
    form,
    invoiceNumber,
    calculations,
    currencySymbol,
    documentConfig,
    savedDocumentPdf,
    showErrorToast,
    showSuccessToast,
  ])

  const handleEmail = useCallback(() => {
    const formData = form.getValues()
    if (!formData.customerEmail) {
      showErrorToast("Please provide a customer email first")
      return
    }

    void form.handleSubmit(async (validData) => {
      const id = await saveInvoice(validData)
      if (!id) return
      setEmailDialogInvoiceId(id)
      setEmailDialogDefaults({
        email: validData.customerEmail || "",
        subject: `${documentConfig.singular} ${invoiceNumber} from ${companyDetails.name || "UnifiedDesk"}`,
        message: `Please find attached ${documentConfig.singular.toLowerCase()} ${invoiceNumber} for your review. Should you have any questions, feel free to reach out. We're happy to help.`,
      })
      setEmailDialogOpen(true)
    })()
  }, [
    form,
    saveInvoice,
    invoiceNumber,
    companyDetails,
    documentConfig,
    showErrorToast,
  ])

  const confirmSendEmail = useCallback(
    (toEmail: string, subject: string, message: string) => {
      if (!emailDialogInvoiceId) return
      sendEmailMutation.mutate({
        id: emailDialogInvoiceId,
        toEmail,
        subject,
        message,
      })
    },
    [emailDialogInvoiceId, sendEmailMutation],
  )

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
    handleDownloadPDF,
    handlePreviewAndPrint,
    handleWhatsApp,
    handleEmail,
    setShowBankDetails,
    setPreviewOpen,
    previewHtml,
    emailDialogOpen,
    setEmailDialogOpen,
    emailDialogDefaults,
    confirmSendEmail,
    sendingEmail: sendEmailMutation.isPending,
  }
}
