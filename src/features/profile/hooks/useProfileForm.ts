import { useMutation, useQuery } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { CompanySettingsService } from "@/client/sdk.gen"
import useCustomToast from "@/hooks/useCustomToast"
import useLocalStorage from "@/hooks/useLocalStorage"
import { type CompanyDetails, defaultCompany } from "../types"

export function useProfileForm() {
  const [company, setCompany] = useLocalStorage<CompanyDetails>(
    "company-details",
    defaultCompany,
  )
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const [draft, setDraft] = useState<CompanyDetails>(company)

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

  const { data: companySettings } = useQuery({
    queryKey: ["company-settings"],
    queryFn: () => CompanySettingsService.getCompanySettings(),
  })

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

  const updateSettingsMutation = useMutation({
    mutationFn: (
      data: Parameters<
        typeof CompanySettingsService.updateCompanySettings
      >[0]["requestBody"],
    ) => CompanySettingsService.updateCompanySettings({ requestBody: data }),
    onSuccess: () => showSuccessToast("Communication settings saved"),
    onError: () => showErrorToast("Failed to save communication settings"),
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
    setCompany(draft)
    setActiveSection(null)
    showSuccessToast("Saved successfully")
  }

  const saveContactSection = () => {
    if (!draft.email?.trim()) {
      showErrorToast("Email address is required")
      return
    }
    setCompany(draft)
    setActiveSection(null)
    showSuccessToast("Saved successfully")
  }

  const saveGenericSection = () => {
    setCompany(draft)
    setActiveSection(null)
    showSuccessToast("Saved successfully")
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
