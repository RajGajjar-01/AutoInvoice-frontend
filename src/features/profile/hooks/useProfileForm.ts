import { useMutation, useQuery } from "@tanstack/react-query"
import { useEffect, useMemo, useState } from "react"
import { CompanySettingsService } from "@/client/sdk.gen"
import {
  companySettingsQueryKeys,
  companySettingsQueryOptions,
} from "@/features/company-settings/queries"
import useCustomToast from "@/hooks/useCustomToast"
import {
  isValidBankAccount,
  isValidGstin,
  isValidIfsc,
  isValidPan,
  isValidUpiId,
  sanitizeLowercase,
  sanitizeNumeric,
  sanitizeUppercase,
} from "@/lib/validation"
import { queryClient } from "@/queryClient"
import { type CompanyDetails, defaultCompany } from "../types"

export function useProfileForm() {
  const [activeSection, setActiveSection] = useState<string | null>(null)

  const [whatsappEnabled, setWhatsappEnabled] = useState(false)
  const [openwaBaseUrl, setOpenwaBaseUrl] = useState("")
  const [openwaApiKey, setOpenwaApiKey] = useState("")
  const [openwaSessionId, setOpenwaSessionId] = useState("")
  const [smtpHost, setSmtpHost] = useState("")
  const [smtpPort, setSmtpPort] = useState(587)
  const [smtpUser, setSmtpUser] = useState("")
  const [smtpPassword, setSmtpPassword] = useState("")
  const [smtpFromEmail, setSmtpFromEmail] = useState("")
  const [smtpFromName, setSmtpFromName] = useState("")

  const { showSuccessToast, showErrorToast } = useCustomToast()

  const { data: companySettings } = useQuery(companySettingsQueryOptions())

  const company: CompanyDetails = useMemo(
    () => ({
      ...defaultCompany,
      name: companySettings?.name ?? "",
      email: companySettings?.email ?? "",
      phone: companySettings?.phone ?? "",
      website: companySettings?.website ?? "",
      address: companySettings?.address ?? "",
      city: companySettings?.city ?? "",
      state: companySettings?.state ?? "",
      pincode: companySettings?.pincode ?? "",
      gstin: companySettings?.gstin ?? "",
      pan: companySettings?.pan ?? "",
      logo: companySettings?.logo_url ?? null,
      bankName: companySettings?.bank_name ?? "",
      accountName: companySettings?.name ?? "", // Account holder defaults to business name
      accountNumber: companySettings?.bank_account ?? "",
      ifsc: companySettings?.bank_ifsc ?? "",
      branch: companySettings?.bank_branch ?? "",
      upi: companySettings?.upi_id ?? "",
      invoicePrefix: companySettings?.invoice_prefix ?? "INV",
      invoiceFooter: companySettings?.terms_and_conditions ?? "",
      smtpPasswordSet: companySettings?.smtp_password_set ?? false,
      openwaApiKeySet: companySettings?.openwa_api_key_set ?? false,
      openwaSessionIdSet: companySettings?.openwa_session_id_set ?? false,
    }),
    [companySettings],
  )

  const [draft, setDraft] = useState<CompanyDetails>(company)

  useEffect(() => {
    if (companySettings) {
      setWhatsappEnabled(companySettings.whatsapp_enabled ?? false)
      setOpenwaBaseUrl(companySettings.openwa_base_url ?? "")
      setOpenwaApiKey("")
      setOpenwaSessionId(companySettings.openwa_session_id ?? "")
      setSmtpHost(companySettings.smtp_host ?? "")
      setSmtpPort(companySettings.smtp_port ?? 587)
      setSmtpUser(companySettings.smtp_user ?? "")
      setSmtpPassword("")
      setSmtpFromEmail(
        companySettings.emails_from_email ?? companySettings.email ?? "",
      )
      setSmtpFromName(
        companySettings.emails_from_name ?? companySettings.name ?? "",
      )
    }
  }, [companySettings])

  useEffect(() => {
    setDraft(company)
  }, [company])

  const updateSettingsMutation = useMutation({
    mutationFn: (
      data: Parameters<
        typeof CompanySettingsService.updateCompanySettings
      >[0]["requestBody"],
    ) => CompanySettingsService.updateCompanySettings({ requestBody: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: companySettingsQueryKeys.all })
      showSuccessToast("Saved successfully")
    },
    onError: (err: any) => {
      const msg = err?.body?.detail || err?.message || "Failed to save"
      showErrorToast(typeof msg === "string" ? msg : "Validation error")
    },
  })

  const mapCompanyToSettings = (d: CompanyDetails) => ({
    name: d.name.trim(),
    email: d.email?.trim() || null,
    phone: d.phone?.trim() || null,
    website: d.website?.trim() || null,
    address: d.address?.trim() || null,
    city: d.city?.trim() || null,
    state: d.state?.trim() || null,
    pincode: d.pincode?.trim() || null,
    gstin: d.gstin ? sanitizeUppercase(d.gstin) : null,
    pan: d.pan ? sanitizeUppercase(d.pan) : null,
    logo_url: d.logo || null,
    bank_name: d.bankName?.trim() || null,
    bank_account: d.accountNumber ? sanitizeNumeric(d.accountNumber) : null,
    bank_ifsc: d.ifsc ? sanitizeUppercase(d.ifsc) : null,
    bank_branch: d.branch?.trim() || null,
    upi_id: d.upi ? sanitizeLowercase(d.upi) : null,
    invoice_prefix: d.invoicePrefix || "INV",
    terms_and_conditions: d.invoiceFooter || null,
  })

  const startEdit = (id: string) => {
    setDraft({ ...company })
    setActiveSection(id)
  }
  const cancelEdit = () => setActiveSection(null)

  const set = (key: keyof CompanyDetails, value: string | null) => {
    let sanitizedValue = value
    if (key === "accountNumber") {
      sanitizedValue = value ? sanitizeNumeric(value) : ""
    } else if (key === "ifsc" || key === "pan" || key === "gstin") {
      sanitizedValue = value ? sanitizeUppercase(value) : ""
    } else if (key === "upi") {
      sanitizedValue = value ? sanitizeLowercase(value) : ""
    }
    setDraft((p) => ({ ...p, [key]: sanitizedValue }))
  }

  const saveBusinessSection = () => {
    if (!draft.name?.trim()) {
      showErrorToast("Company name is required")
      return
    }
    updateSettingsMutation.mutate({
      name: draft.name.trim(),
      logo_url: draft.logo || null,
    })
    setActiveSection(null)
  }

  const saveContactSection = () => {
    if (!draft.email?.trim()) {
      showErrorToast("Email address is required")
      return
    }
    updateSettingsMutation.mutate({
      email: draft.email.trim() || null,
      phone: draft.phone?.trim() || null,
      website: draft.website?.trim() || null,
    })
    setActiveSection(null)
  }

  const saveGenericSection = () => {
    // Validate bank section if editing bank
    if (activeSection === "bank") {
      if (draft.accountNumber && !isValidBankAccount(draft.accountNumber)) {
        showErrorToast("Bank Account Number must be 9 to 18 digits")
        return
      }
      if (draft.ifsc && !isValidIfsc(draft.ifsc)) {
        showErrorToast("Invalid IFSC format (e.g. HDFC0001234)")
        return
      }
      if (draft.upi && !isValidUpiId(draft.upi)) {
        showErrorToast("Invalid UPI ID format (e.g. name@bank)")
        return
      }
    }

    // Validate tax section if editing tax
    if (activeSection === "tax") {
      if (draft.gstin && !isValidGstin(draft.gstin)) {
        showErrorToast("Invalid GSTIN format (e.g. 22AAAAA0000A1Z5)")
        return
      }
      if (draft.pan && !isValidPan(draft.pan)) {
        showErrorToast("Invalid PAN format (e.g. ABCDE1234F)")
        return
      }
    }

    updateSettingsMutation.mutate(mapCompanyToSettings(draft))
    setActiveSection(null)
  }

  const saveCommunication = () => {
    const payload: Parameters<
      typeof CompanySettingsService.updateCompanySettings
    >[0]["requestBody"] = {
      whatsapp_enabled: whatsappEnabled,
      openwa_base_url: openwaBaseUrl?.trim() || null,
      smtp_host: smtpHost?.trim() || null,
      smtp_port: smtpPort || 587,
      smtp_user: smtpUser?.trim() || null,
      emails_from_email: smtpFromEmail?.trim() || null,
      emails_from_name: smtpFromName?.trim() || null,
    }

    // Only send sensitive credential fields if the user typed a new value
    if (openwaApiKey.trim()) {
      payload.openwa_api_key = openwaApiKey.trim()
    }
    if (openwaSessionId.trim()) {
      payload.openwa_session_id = openwaSessionId.trim()
    }
    if (smtpPassword.trim()) {
      payload.smtp_password = smtpPassword.trim()
    }

    updateSettingsMutation.mutate(payload)
    setActiveSection(null)
  }

  const clearSmtpPassword = () => {
    updateSettingsMutation.mutate({ smtp_password: null })
  }

  const clearOpenwaApiKey = () => {
    updateSettingsMutation.mutate({ openwa_api_key: null })
  }

  return {
    company,
    draft,
    activeSection,
    companySettings,
    updateSettingsMutation,
    whatsappEnabled,
    setWhatsappEnabled,
    openwaBaseUrl,
    setOpenwaBaseUrl,
    openwaApiKey,
    setOpenwaApiKey,
    openwaSessionId,
    setOpenwaSessionId,
    smtpHost,
    setSmtpHost,
    smtpPort,
    setSmtpPort,
    smtpUser,
    setSmtpUser,
    smtpPassword,
    setSmtpPassword,
    smtpFromEmail,
    setSmtpFromEmail,
    smtpFromName,
    setSmtpFromName,
    startEdit,
    cancelEdit,
    set,
    saveBusinessSection,
    saveContactSection,
    saveGenericSection,
    saveCommunication,
    clearSmtpPassword,
    clearOpenwaApiKey,
  }
}
