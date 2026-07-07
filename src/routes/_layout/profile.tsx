import { useMutation, useQuery } from "@tanstack/react-query"
import {
  BadgeCheck,
  Building2,
  Camera,
  CreditCard,
  FileText,
  Mail,
  MapPin,
  MessageSquare,
  Trash2,
  Upload,
} from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { CompanySettingsService } from "@/client/sdk.gen"
import { ProfileSection } from "@/components/Profile/ProfileSection"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import useCustomToast from "@/hooks/useCustomToast"
import { useDocumentTitle } from "@/hooks/useDocumentTitle"
import useLocalStorage from "@/hooks/useLocalStorage"

// ─── Types ────────────────────────────────────────────────────────────────────

interface CompanyDetails {
  name: string
  tagline: string
  email: string
  phone: string
  website: string
  address: string
  city: string
  state: string
  pincode: string
  country: string
  gstin: string
  pan: string
  logo: string | null
  bankName: string
  accountName: string
  accountNumber: string
  ifsc: string
  branch: string
  upi: string
  invoicePrefix: string
  invoiceFooter: string
  currency: string
  defaultPaymentTerms: string
}

const defaultCompany: CompanyDetails = {
  name: "",
  tagline: "",
  email: "",
  phone: "",
  website: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
  country: "India",
  gstin: "",
  pan: "",
  logo: null,
  bankName: "",
  accountName: "",
  accountNumber: "",
  ifsc: "",
  branch: "",
  upi: "",
  invoicePrefix: "INV",
  invoiceFooter: "Thank you for your business!",
  currency: "INR",
  defaultPaymentTerms: "Net 30",
}

// ─── AccountPage ──────────────────────────────────────────────────────────────

function InfoRow({
  label,
  value,
  mono = false,
}: {
  label: string
  value?: string | null
  mono?: boolean
}) {
  if (!value) return null
  return (
    <div className="flex items-start justify-between gap-4 py-2 border-b border-border/40 last:border-0">
      <span className="text-xs text-muted-foreground shrink-0 w-36">
        {label}
      </span>
      <span
        className={`text-sm font-medium text-right break-all ${mono ? "font-mono" : ""}`}
      >
        {value}
      </span>
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return <p className="text-sm text-muted-foreground italic py-1">{message}</p>
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required,
}: {
  label: string
  value: string | null
  onChange: (value: string) => void
  placeholder?: string
  type?: string
  required?: boolean
}) {
  return (
    <div className="space-y-1">
      <Label className="text-xs font-medium text-muted-foreground">
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </Label>
      <Input
        type={type}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-9 text-sm"
      />
    </div>
  )
}

function LogoUpload({
  logo,
  onLogoChange,
}: {
  logo: string | null
  onLogoChange: (value: string | null) => void
}) {
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      alert("Logo must be under 2MB")
      return
    }
    const reader = new FileReader()
    reader.onload = (ev) => onLogoChange(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  return (
    <div className="flex items-center gap-4">
      <div className="relative shrink-0">
        <div
          onClick={() => fileRef.current?.click()}
          className="h-20 w-20 rounded-xl border-2 border-dashed border-border bg-muted/40 flex items-center justify-center overflow-hidden cursor-pointer hover:border-primary/50 transition-colors"
        >
          {logo ? (
            <img
              src={logo}
              alt="logo"
              className="h-full w-full object-contain p-1"
            />
          ) : (
            <Building2 className="h-7 w-7 text-muted-foreground/50" />
          )}
        </div>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow hover:opacity-90"
        >
          <Camera className="h-3 w-3" />
        </button>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
      <div className="flex flex-col gap-1.5">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 text-xs"
          onClick={() => fileRef.current?.click()}
        >
          <Upload className="h-3 w-3 mr-1.5" /> Upload Logo
        </Button>
        {logo && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 text-xs text-destructive hover:text-destructive"
            onClick={() => onLogoChange(null)}
          >
            <Trash2 className="h-3 w-3 mr-1.5" /> Remove
          </Button>
        )}
        <p className="text-[11px] text-muted-foreground">PNG, JPG up to 2MB</p>
      </div>
    </div>
  )
}

// ─── AccountPage ──────────────────────────────────────────────────────────────

function AccountPage() {
  useDocumentTitle("My Account")

  const [company, setCompany] = useLocalStorage<CompanyDetails>(
    "company-details",
    defaultCompany,
  )
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const [draft, setDraft] = useState<CompanyDetails>(company)

  // Communication fields (separate from CompanyDetails — stored via API)
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

  // Edit helpers
  const startEdit = (id: string) => {
    setDraft({ ...company })
    setActiveSection(id)
  }
  const cancelEdit = () => setActiveSection(null)
  const set = (key: keyof CompanyDetails, value: string | null) =>
    setDraft((p) => ({ ...p, [key]: value }))

  // Per-section save handlers
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

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Account</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Company details that appear on every invoice you create.
        </p>
      </div>

      {/* 1 ── Business Identity */}
      <ProfileSection
        id="business"
        icon={Building2}
        title="Business Identity"
        isEditing={activeSection === "business"}
        onEdit={() => startEdit("business")}
        onSave={saveBusinessSection}
        onCancel={cancelEdit}
        viewContent={
          company.name || company.tagline || company.logo ? (
            <div className="flex items-center gap-4">
              {company.logo && (
                <div className="h-14 w-14 rounded-xl border bg-muted flex items-center justify-center overflow-hidden shrink-0">
                  <img
                    src={company.logo}
                    alt="logo"
                    className="h-full w-full object-contain p-1"
                  />
                </div>
              )}
              <div>
                <p className="font-bold text-base">{company.name}</p>
                {company.tagline && (
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {company.tagline}
                  </p>
                )}
                {(company.gstin || company.pan) && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {company.gstin && (
                      <Badge
                        variant="outline"
                        className="text-[11px] font-mono"
                      >
                        GST: {company.gstin}
                      </Badge>
                    )}
                    {company.pan && (
                      <Badge
                        variant="outline"
                        className="text-[11px] font-mono"
                      >
                        PAN: {company.pan}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <EmptyState message="No business identity set yet. Click Edit to get started." />
          )
        }
        editContent={
          <div className="flex flex-col gap-4">
            <LogoUpload
              logo={draft.logo}
              onLogoChange={(v) => set("logo", v)}
            />
            <Separator />
            <div className="grid gap-3">
              <Field
                label="Company Name"
                value={draft.name}
                onChange={(v) => set("name", v)}
                placeholder="Acme Pvt. Ltd."
                required
              />
              <Field
                label="Tagline / Slogan"
                value={draft.tagline}
                onChange={(v) => set("tagline", v)}
                placeholder="Empowering businesses worldwide"
              />
            </div>
          </div>
        }
      />

      {/* 2 ── Contact Details */}
      <ProfileSection
        id="contact"
        icon={Mail}
        title="Contact Details"
        isEditing={activeSection === "contact"}
        onEdit={() => startEdit("contact")}
        onSave={saveContactSection}
        onCancel={cancelEdit}
        viewContent={
          company.email || company.phone || company.website ? (
            <>
              <InfoRow label="Email" value={company.email} />
              <InfoRow label="Phone" value={company.phone} />
              <InfoRow label="Website" value={company.website} />
            </>
          ) : (
            <EmptyState message="No contact details added." />
          )
        }
        editContent={
          <div className="grid gap-3">
            <Field
              label="Email Address"
              value={draft.email}
              onChange={(v) => set("email", v)}
              placeholder="contact@yourcompany.com"
              type="email"
              required
            />
            <Field
              label="Phone Number"
              value={draft.phone}
              onChange={(v) => set("phone", v)}
              placeholder="+91 98765 43210"
            />
            <Field
              label="Website"
              value={draft.website}
              onChange={(v) => set("website", v)}
              placeholder="https://yourcompany.com"
            />
          </div>
        }
      />

      {/* 3 ── Business Address */}
      <ProfileSection
        id="address"
        icon={MapPin}
        title="Business Address"
        isEditing={activeSection === "address"}
        onEdit={() => startEdit("address")}
        onSave={saveGenericSection}
        onCancel={cancelEdit}
        viewContent={
          company.address ? (
            <>
              <InfoRow label="Street" value={company.address} />
              <InfoRow
                label="City / State"
                value={[company.city, company.state, company.pincode]
                  .filter(Boolean)
                  .join(", ")}
              />
              <InfoRow label="Country" value={company.country} />
            </>
          ) : (
            <EmptyState message="No address set." />
          )
        }
        editContent={
          <div className="grid gap-3">
            <Field
              label="Street Address"
              value={draft.address}
              onChange={(v) => set("address", v)}
              placeholder="123 Business Park, Sector 7"
              required
            />
            <div className="grid grid-cols-2 gap-3">
              <Field
                label="City"
                value={draft.city}
                onChange={(v) => set("city", v)}
                placeholder="Mumbai"
              />
              <Field
                label="State"
                value={draft.state}
                onChange={(v) => set("state", v)}
                placeholder="Maharashtra"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field
                label="PIN Code"
                value={draft.pincode}
                onChange={(v) => set("pincode", v)}
                placeholder="400001"
              />
              <Field
                label="Country"
                value={draft.country}
                onChange={(v) => set("country", v)}
                placeholder="India"
              />
            </div>
          </div>
        }
      />

      {/* 4 ── Tax & Registration */}
      <ProfileSection
        id="tax"
        icon={BadgeCheck}
        title="Tax & Registration"
        isEditing={activeSection === "tax"}
        onEdit={() => startEdit("tax")}
        onSave={saveGenericSection}
        onCancel={cancelEdit}
        viewContent={
          company.gstin || company.pan ? (
            <>
              <InfoRow label="GSTIN" value={company.gstin} mono />
              <InfoRow label="PAN Number" value={company.pan} mono />
            </>
          ) : (
            <EmptyState message="No tax details added." />
          )
        }
        editContent={
          <div className="grid gap-3">
            <Field
              label="GSTIN"
              value={draft.gstin}
              onChange={(v) => set("gstin", v)}
              placeholder="22AAAAA0000A1Z5"
            />
            <Field
              label="PAN Number"
              value={draft.pan}
              onChange={(v) => set("pan", v)}
              placeholder="AAAAA0000A"
            />
          </div>
        }
      />

      {/* 5 ── Bank & Payment */}
      <ProfileSection
        id="bank"
        icon={CreditCard}
        title="Bank & Payment Details"
        isEditing={activeSection === "bank"}
        onEdit={() => startEdit("bank")}
        onSave={saveGenericSection}
        onCancel={cancelEdit}
        viewContent={
          company.bankName || company.accountNumber || company.upi ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10">
              <div>
                <InfoRow label="Bank" value={company.bankName} />
                <InfoRow label="Account Holder" value={company.accountName} />
                <InfoRow
                  label="Account Number"
                  value={company.accountNumber}
                  mono
                />
              </div>
              <div>
                <InfoRow label="IFSC Code" value={company.ifsc} mono />
                <InfoRow label="Branch" value={company.branch} />
                <InfoRow label="UPI ID" value={company.upi} mono />
              </div>
            </div>
          ) : (
            <EmptyState message="No bank details added." />
          )
        }
        editContent={
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <Field
              label="Bank Name"
              value={draft.bankName}
              onChange={(v) => set("bankName", v)}
              placeholder="HDFC Bank"
            />
            <Field
              label="Account Holder Name"
              value={draft.accountName}
              onChange={(v) => set("accountName", v)}
              placeholder="Acme Pvt. Ltd."
            />
            <Field
              label="Account Number"
              value={draft.accountNumber}
              onChange={(v) => set("accountNumber", v)}
              placeholder="50100123456789"
            />
            <Field
              label="IFSC Code"
              value={draft.ifsc}
              onChange={(v) => set("ifsc", v)}
              placeholder="HDFC0001234"
            />
            <Field
              label="Branch"
              value={draft.branch}
              onChange={(v) => set("branch", v)}
              placeholder="Bandra West, Mumbai"
            />
            <Field
              label="UPI ID"
              value={draft.upi}
              onChange={(v) => set("upi", v)}
              placeholder="yourname@upi"
            />
          </div>
        }
      />

      {/* 6 ── Communication */}
      <ProfileSection
        id="communication"
        icon={MessageSquare}
        title="Communication Settings"
        isEditing={activeSection === "communication"}
        onEdit={() => setActiveSection("communication")}
        onSave={saveCommunication}
        onCancel={cancelEdit}
        isSaving={updateSettingsMutation.isPending}
        viewContent={
          companySettings &&
          (companySettings.whatsapp_enabled || companySettings.smtp_host) ? (
            <div className="flex flex-wrap gap-3">
              <div className="rounded-lg bg-muted/50 border border-border/50 px-3 py-2">
                <p className="text-[11px] text-muted-foreground mb-0.5">
                  WhatsApp
                </p>
                <p className="text-sm font-semibold">
                  {companySettings.whatsapp_enabled ? "Enabled" : "Disabled"}
                </p>
              </div>
              {companySettings.smtp_host && (
                <div className="rounded-lg bg-muted/50 border border-border/50 px-3 py-2">
                  <p className="text-[11px] text-muted-foreground mb-0.5">
                    SMTP Host
                  </p>
                  <p className="text-sm font-semibold font-mono">
                    {companySettings.smtp_host}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <EmptyState message="No communication settings configured." />
          )
        }
        editContent={
          <div className="flex flex-col gap-4">
            <Label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={whatsappEnabled}
                onChange={(e) => setWhatsappEnabled(e.target.checked)}
                className="h-4 w-4 rounded border-border accent-primary"
              />
              <span className="text-sm font-medium">
                Enable WhatsApp Sending
              </span>
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-medium text-muted-foreground">
                  OpenWA Base URL
                </Label>
                <Input
                  value={openwaBaseUrl}
                  onChange={(e) => setOpenwaBaseUrl(e.target.value)}
                  placeholder="http://localhost:3000"
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-medium text-muted-foreground">
                  API Key
                </Label>
                <Input
                  value={openwaApiKey}
                  onChange={(e) => setOpenwaApiKey(e.target.value)}
                  placeholder="sk-..."
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-medium text-muted-foreground">
                  Session ID
                </Label>
                <Input
                  value={openwaSessionId}
                  onChange={(e) => setOpenwaSessionId(e.target.value)}
                  placeholder="default"
                  className="h-9 text-sm"
                />
              </div>
            </div>
            <Separator />
            <p className="text-xs font-semibold text-muted-foreground">
              SMTP (Email)
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-medium text-muted-foreground">
                  SMTP Host
                </Label>
                <Input
                  value={smtpHost}
                  onChange={(e) => setSmtpHost(e.target.value)}
                  placeholder="smtp.gmail.com"
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-medium text-muted-foreground">
                  Port
                </Label>
                <Input
                  value={String(smtpPort)}
                  onChange={(e) => setSmtpPort(Number(e.target.value) || 587)}
                  placeholder="587"
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-medium text-muted-foreground">
                  Username
                </Label>
                <Input
                  value={smtpUser}
                  onChange={(e) => setSmtpUser(e.target.value)}
                  placeholder="user@gmail.com"
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-medium text-muted-foreground">
                  Password
                </Label>
                <Input
                  type="password"
                  value={smtpPassword}
                  onChange={(e) => setSmtpPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-medium text-muted-foreground">
                  From Email
                </Label>
                <Input
                  value={smtpFromEmail}
                  onChange={(e) => setSmtpFromEmail(e.target.value)}
                  placeholder="invoices@company.com"
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-medium text-muted-foreground">
                  From Name
                </Label>
                <Input
                  value={smtpFromName}
                  onChange={(e) => setSmtpFromName(e.target.value)}
                  placeholder="Your Company"
                  className="h-9 text-sm"
                />
              </div>
            </div>
          </div>
        }
      />

      {/* 7 ── Invoice Preferences */}
      <ProfileSection
        id="invoicePrefs"
        icon={FileText}
        title="Invoice Preferences"
        isEditing={activeSection === "invoicePrefs"}
        onEdit={() => startEdit("invoicePrefs")}
        onSave={saveGenericSection}
        onCancel={cancelEdit}
        viewContent={
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {company.invoicePrefix && (
              <div className="rounded-lg bg-muted/50 border border-border/50 px-3 py-2">
                <p className="text-[11px] text-muted-foreground mb-0.5">
                  Prefix
                </p>
                <p className="text-sm font-semibold font-mono">
                  {company.invoicePrefix}
                </p>
              </div>
            )}
            {company.currency && (
              <div className="rounded-lg bg-muted/50 border border-border/50 px-3 py-2">
                <p className="text-[11px] text-muted-foreground mb-0.5">
                  Currency
                </p>
                <p className="text-sm font-semibold">{company.currency}</p>
              </div>
            )}
            {company.defaultPaymentTerms && (
              <div className="rounded-lg bg-muted/50 border border-border/50 px-3 py-2">
                <p className="text-[11px] text-muted-foreground mb-0.5">
                  Payment Terms
                </p>
                <p className="text-sm font-semibold">
                  {company.defaultPaymentTerms}
                </p>
              </div>
            )}
            {company.invoiceFooter && (
              <div className="col-span-full rounded-lg bg-muted/50 border border-border/50 px-3 py-2">
                <p className="text-[11px] text-muted-foreground mb-0.5">
                  Footer Note
                </p>
                <p className="text-sm italic">"{company.invoiceFooter}"</p>
              </div>
            )}
          </div>
        }
        editContent={
          <div className="grid gap-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Field
                label="Invoice Prefix"
                value={draft.invoicePrefix}
                onChange={(v) => set("invoicePrefix", v)}
                placeholder="INV"
              />
              <Field
                label="Default Payment Terms"
                value={draft.defaultPaymentTerms}
                onChange={(v) => set("defaultPaymentTerms", v)}
                placeholder="Net 30"
              />
              <div className="space-y-1">
                <Label className="text-xs font-medium text-muted-foreground">
                  Default Currency
                </Label>
                <select
                  value={draft.currency || "INR"}
                  onChange={(e) => set("currency", e.target.value)}
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="INR">INR — Indian Rupee (₹)</option>
                  <option value="USD">USD — US Dollar ($)</option>
                  <option value="EUR">EUR — Euro (€)</option>
                  <option value="GBP">GBP — British Pound (£)</option>
                  <option value="AED">AED — UAE Dirham</option>
                  <option value="SGD">SGD — Singapore Dollar</option>
                </select>
              </div>
            </div>
            <Field
              label="Invoice Footer Note"
              value={draft.invoiceFooter}
              onChange={(v) => set("invoiceFooter", v)}
              placeholder="Thank you for your business! Payment due within 30 days."
            />
          </div>
        }
      />
    </div>
  )
}

export default AccountPage
