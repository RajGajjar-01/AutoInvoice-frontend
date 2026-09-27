import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { CompanySettingsService } from "@/client/sdk.gen"
import type { CompanySettingsUpdate } from "@/client/types.gen"
import {
  companySettingsQueryKeys,
  companySettingsQueryOptions,
} from "@/features/company-settings/queries"
import useCustomToast from "@/hooks/useCustomToast"
import { formResolver } from "@/lib/form"
import { sanitizeLowercase, sanitizeUppercase } from "@/lib/validation"
import { getSafeErrorMessage } from "@/utils"
import {
  type CommunicationValues,
  communicationSchema,
  companyProfileSchema,
} from "../schema"
import { type CompanyDetails, defaultCompany } from "../types"

type SectionId =
  | "business"
  | "contact"
  | "address"
  | "tax"
  | "bank"
  | "communication"
  | "invoicePrefs"
const fieldsBySection: Record<
  Exclude<SectionId, "communication">,
  (keyof CompanyDetails)[]
> = {
  business: ["name", "logo"],
  contact: ["email", "phone", "website"],
  address: ["address", "city", "state", "pincode"],
  tax: ["gstin", "pan"],
  bank: ["bankName", "accountNumber", "ifsc", "branch", "upi"],
  invoicePrefs: [
    "invoicePrefix",
    "quotationPrefix",
    "proformaPrefix",
    "challanPrefix",
    "invoiceFooter",
  ],
}
const optional = (value: string) => value.trim() || null

export function useProfileForm() {
  const [activeSection, setActiveSection] = useState<SectionId | null>(null)
  const { showSuccessToast, showErrorToast } = useCustomToast()
  const queryClient = useQueryClient()
  const { data: companySettings, isPending: isLoading } = useQuery(
    companySettingsQueryOptions(),
  )

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
      accountNumber: companySettings?.bank_account ?? "",
      ifsc: companySettings?.bank_ifsc ?? "",
      branch: companySettings?.bank_branch ?? "",
      upi: companySettings?.upi_id ?? "",
      invoicePrefix: companySettings?.invoice_prefix ?? "INV-",
      quotationPrefix: companySettings?.quotation_prefix ?? "QUO-",
      proformaPrefix: companySettings?.proforma_prefix ?? "PRO-",
      challanPrefix: companySettings?.challan_prefix ?? "CHL-",
      invoiceFooter: companySettings?.terms_and_conditions ?? "",
    }),
    [companySettings],
  )

  const communication: CommunicationValues = useMemo(
    () => ({
      whatsappEnabled: companySettings?.whatsapp_enabled ?? false,
      openwaBaseUrl: companySettings?.openwa_base_url ?? "",
      openwaApiKey: "",
      openwaSessionId: "",
      smtpHost: companySettings?.smtp_host ?? "",
      smtpPort: companySettings?.smtp_port ?? 587,
      smtpUser: companySettings?.smtp_user ?? "",
      smtpPassword: "",
      smtpFromEmail: companySettings?.emails_from_email ?? "",
      smtpFromName: companySettings?.emails_from_name ?? "",
    }),
    [companySettings],
  )

  const companyForm = useForm<CompanyDetails>({
    resolver: formResolver(companyProfileSchema),
    mode: "onBlur",
    defaultValues: company,
  })
  const communicationForm = useForm<CommunicationValues>({
    resolver: formResolver(communicationSchema),
    mode: "onBlur",
    defaultValues: communication,
  })

  useEffect(() => {
    if (!activeSection) {
      companyForm.reset(company)
      communicationForm.reset(communication)
    }
  }, [company, communication, activeSection, companyForm, communicationForm])

  const updateSettingsMutation = useMutation({
    mutationFn: ({
      payload,
    }: {
      section: string
      payload: CompanySettingsUpdate
    }) =>
      CompanySettingsService.updateCompanySettings({ requestBody: payload }),
    onSuccess: async (_data, { section }) => {
      await queryClient.invalidateQueries({
        queryKey: companySettingsQueryKeys.all,
      })
      showSuccessToast(`${section} saved`)
    },
    onError: (error, { section }) =>
      showErrorToast(
        `Could not save ${section.toLowerCase()}. ${getSafeErrorMessage(error)}`,
      ),
  })

  const startEdit = (id: SectionId) => {
    companyForm.reset(company)
    communicationForm.reset(communication)
    setActiveSection(id)
  }
  const cancelEdit = () => {
    companyForm.reset(company)
    communicationForm.reset(communication)
    setActiveSection(null)
  }

  const setLogo = (value: string | null) =>
    companyForm.setValue("logo", value, {
      shouldDirty: true,
      shouldValidate: true,
    })

  const saveSection = async (section: Exclude<SectionId, "communication">) => {
    if (updateSettingsMutation.isPending) return
    const valid = await companyForm.trigger(fieldsBySection[section], {
      shouldFocus: true,
    })
    if (!valid) return
    const values = companyForm.getValues()
    let payload: CompanySettingsUpdate
    switch (section) {
      case "business":
        payload = { name: values.name.trim(), logo_url: values.logo }
        break
      case "contact":
        payload = {
          email: optional(values.email),
          phone: optional(values.phone),
          website: optional(values.website),
        }
        break
      case "address":
        payload = {
          address: optional(values.address),
          city: optional(values.city),
          state: optional(values.state),
          pincode: optional(values.pincode),
        }
        break
      case "tax":
        payload = {
          gstin: optional(sanitizeUppercase(values.gstin)),
          pan: optional(sanitizeUppercase(values.pan)),
        }
        break
      case "bank":
        payload = {
          bank_name: optional(values.bankName),
          bank_account: optional(values.accountNumber),
          bank_ifsc: optional(sanitizeUppercase(values.ifsc)),
          bank_branch: optional(values.branch),
          upi_id: optional(sanitizeLowercase(values.upi)),
        }
        break
      case "invoicePrefs":
        payload = {
          invoice_prefix: values.invoicePrefix.trim(),
          quotation_prefix: values.quotationPrefix.trim(),
          proforma_prefix: values.proformaPrefix.trim(),
          challan_prefix: values.challanPrefix.trim(),
          terms_and_conditions: optional(values.invoiceFooter),
        }
        break
    }
    try {
      await updateSettingsMutation.mutateAsync({
        section:
          section === "invoicePrefs"
            ? "Document preferences"
            : section === "business"
              ? "Business identity"
              : `${section[0].toUpperCase()}${section.slice(1)} details`,
        payload,
      })
      setActiveSection(null)
    } catch {
      // Keep the editor open so the user can correct the form or retry.
    }
  }

  const saveCommunication = async () => {
    if (updateSettingsMutation.isPending) return
    const valid = await communicationForm.trigger(undefined, {
      shouldFocus: true,
    })
    if (!valid) return
    const values = communicationForm.getValues()
    const payload: CompanySettingsUpdate = {
      whatsapp_enabled: values.whatsappEnabled,
      openwa_base_url: optional(values.openwaBaseUrl),
      smtp_host: optional(values.smtpHost),
      smtp_port: values.smtpPort,
      smtp_user: optional(values.smtpUser),
      emails_from_email: optional(values.smtpFromEmail),
      emails_from_name: optional(values.smtpFromName),
    }
    if (values.openwaApiKey.trim())
      payload.openwa_api_key = values.openwaApiKey.trim()
    if (values.openwaSessionId.trim())
      payload.openwa_session_id = values.openwaSessionId.trim()
    if (values.smtpPassword.trim())
      payload.smtp_password = values.smtpPassword.trim()
    try {
      await updateSettingsMutation.mutateAsync({
        section: "Communication settings",
        payload,
      })
      setActiveSection(null)
    } catch {
      // Keep entered credentials in place for a retry.
    }
  }

  const clearSmtpPassword = () =>
    updateSettingsMutation.mutate({
      section: "SMTP password",
      payload: { smtp_password: null },
    })
  const clearOpenwaApiKey = () =>
    updateSettingsMutation.mutate({
      section: "WhatsApp API key",
      payload: { openwa_api_key: null },
    })

  return {
    company,
    companySettings,
    isLoading,
    activeSection,
    companyForm,
    communicationForm,
    logo: companyForm.watch("logo"),
    updateSettingsMutation,
    startEdit,
    cancelEdit,
    setLogo,
    saveSection,
    saveCommunication,
    clearSmtpPassword,
    clearOpenwaApiKey,
  }
}
