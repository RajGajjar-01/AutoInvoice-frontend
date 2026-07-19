import { useMutation, useQuery } from "@tanstack/react-query"
import { useEffect, useMemo, useState } from "react"
import { CompanySettingsService } from "@/client/sdk.gen"
import {
  companySettingsQueryKeys,
  companySettingsQueryOptions,
} from "@/features/company-settings/queries"
import useCustomToast from "@/hooks/useCustomToast"
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
      accountName: companySettings?.bank_account ?? "",
      ifsc: companySettings?.bank_ifsc ?? "",
      branch: companySettings?.bank_branch ?? "",
      upi: companySettings?.upi_id ?? "",
      invoicePrefix: companySettings?.invoice_prefix ?? "INV",
      invoiceFooter: companySettings?.terms_and_conditions ?? "",
    }),
    [companySettings],
  )

  const [draft, setDraft] = useState<CompanyDetails>(company)

  useEffect(() => {
    if (companySettings) {
      setWhatsappEnabled(companySettings.whatsapp_enabled ?? false)
      setOpenwaBaseUrl(companySettings.openwa_base_url ?? "")
      setOpenwaApiKey(companySettings.openwa_api_key ?? "")
      setOpenwaSessionId(companySettings.openwa_session_id ?? "")
      setSmtpHost(companySettings.smtp_host ?? "")
      setSmtpPort(companySettings.smtp_port ?? 587)
      setSmtpUser(companySettings.smtp_user ?? "")
      setSmtpPassword(companySettings.smtp_password ?? "")
      setSmtpFromEmail(companySettings.email ?? "")
      setSmtpFromName(companySettings.name ?? "")
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
    onError: () => showErrorToast("Failed to save"),
  })

  const mapCompanyToSettings = (d: CompanyDetails) => ({
    name: d.name,
    email: d.email || null,
    phone: d.phone || null,
    website: d.website || null,
    address: d.address || null,
    city: d.city || null,
    state: d.state || null,
    pincode: d.pincode || null,
    gstin: d.gstin || null,
    pan: d.pan || null,
    logo_url: d.logo || null,
    bank_name: d.bankName || null,
    bank_account: d.accountName || null,
    bank_ifsc: d.ifsc || null,
    bank_branch: d.branch || null,
    upi_id: d.upi || null,
    invoice_prefix: d.invoicePrefix || "INV",
    terms_and_conditions: d.invoiceFooter || null,
  })

  const startEdit = (id: string) => {
    setDraft({ ...company })
    setActiveSection(id)
  }
  const cancelEdit = () => setActiveSection(null)
  const set = (key: keyof CompanyDetails, value: string | null) =>
    setDraft((p) => ({ ...p, [key]: value }))

  const saveBusinessSection = () => {
    if (!draft.name?.trim()) {
      showErrorToast("Company name is required")
      return
    }
    updateSettingsMutation.mutate({
      name: draft.name,
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
      email: draft.email || null,
      phone: draft.phone || null,
      website: draft.website || null,
    })
    setActiveSection(null)
  }

  const saveGenericSection = () => {
    updateSettingsMutation.mutate(mapCompanyToSettings(draft))
    setActiveSection(null)
  }

  const saveCommunication = () => {
    updateSettingsMutation.mutate({
      whatsapp_enabled: whatsappEnabled,
      openwa_base_url: openwaBaseUrl || null,
      openwa_api_key: openwaApiKey || null,
      openwa_session_id: openwaSessionId || null,
      smtp_host: smtpHost || null,
      smtp_port: smtpPort,
      smtp_user: smtpUser || null,
      smtp_password: smtpPassword || null,
    })
    setActiveSection(null)
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
  }
}
