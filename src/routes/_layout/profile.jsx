import { createFileRoute } from "@tanstack/react-router"
import {
  AlertCircle,
  BadgeCheck,
  Building2,
  Camera,
  CheckCircle2,
  CreditCard,
  Edit3,
  FileText,
  Mail,
  MapPin,
  Save,
  Trash2,
  Upload,
  X,
} from "lucide-react"
import { useRef, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import useCustomToast from "@/hooks/useCustomToast"
import useLocalStorage from "@/hooks/useLocalStorage"

export const Route = createFileRoute("/_layout/profile")({
  component: AccountPage,
  head: () => ({
    meta: [{ title: "My Account" }],
  }),
})

const defaultCompany = {
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

// ─── Reusable section box ──────────────────────────────────────────────────────
function Section({ icon: Icon, title, children }) {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Section Header */}
      <div className="flex items-center gap-2.5 px-5 py-3 border-b border-border bg-muted/30">
        <div className="rounded-md bg-primary/10 p-1.5">
          <Icon className="h-3.5 w-3.5 text-primary" />
        </div>
        <span className="text-sm font-semibold">{title}</span>
      </div>
      {/* Section Body */}
      <div className="px-5 py-4">{children}</div>
    </div>
  )
}

// ─── View field row ────────────────────────────────────────────────────────────
function InfoRow({ label, value, mono = false }) {
  if (!value) return null
  return (
    <div className="flex items-start justify-between gap-4 py-2 border-b border-border/40 last:border-0">
      <span className="text-xs text-muted-foreground shrink-0 w-32">
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

// ─── Edit field ────────────────────────────────────────────────────────────────
function Field({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  required,
}) {
  return (
    <div className="space-y-1">
      <Label
        htmlFor={name}
        className="text-xs font-medium text-muted-foreground"
      >
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </Label>
      <Input
        id={name}
        type={type}
        value={value || ""}
        onChange={(e) => onChange(name, e.target.value)}
        placeholder={placeholder}
        className="h-9 text-sm"
      />
    </div>
  )
}

// ─── Logo uploader ─────────────────────────────────────────────────────────────
function LogoUpload({ logo, onLogoChange }) {
  const fileRef = useRef(null)

  const handleFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      alert("Logo must be under 2MB")
      return
    }
    const reader = new FileReader()
    reader.onload = (ev) => onLogoChange(ev.target.result)
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

// ─── Main ──────────────────────────────────────────────────────────────────────
function AccountPage() {
  const [company, setCompany] = useLocalStorage(
    "company-details",
    defaultCompany,
  )
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(company)
  const { showSuccessToast, showErrorToast } = useCustomToast()

  const startEditing = () => {
    setDraft({ ...company })
    setEditing(true)
  }
  const cancelEditing = () => {
    setDraft({ ...company })
    setEditing(false)
  }

  const saveChanges = () => {
    if (!draft.name?.trim()) {
      showErrorToast("Company name is required")
      return
    }
    setCompany(draft)
    setEditing(false)
    showSuccessToast("Company details saved successfully")
  }

  const set = (name, value) => setDraft((p) => ({ ...p, [name]: value }))

  const isComplete =
    company.name && company.email && company.phone && company.address

  return (
    <div className="flex flex-col gap-5">
      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Account</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Company details that appear on every invoice you create.
          </p>
        </div>
        <div className="flex gap-2">
          {editing ? (
            <>
              <Button variant="outline" size="sm" onClick={cancelEditing}>
                <X className="h-4 w-4 mr-1.5" /> Cancel
              </Button>
              <Button size="sm" onClick={saveChanges}>
                <Save className="h-4 w-4 mr-1.5" /> Save Changes
              </Button>
            </>
          ) : (
            <Button size="sm" onClick={startEditing}>
              <Edit3 className="h-4 w-4 mr-1.5" /> Edit Profile
            </Button>
          )}
        </div>
      </div>

      {/* ── Status banner ── */}
      {!editing && (
        <div
          className={`flex items-center gap-3 rounded-lg border px-4 py-3 ${
            isComplete
              ? "border-green-500/30 bg-green-500/5"
              : "border-primary/30 bg-primary/5"
          }`}
        >
          {isComplete ? (
            <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 text-primary shrink-0" />
          )}
          <p
            className={`text-sm font-medium ${isComplete ? "text-green-700 dark:text-green-400" : "text-primary"}`}
          >
            {isComplete
              ? "Your company profile is complete and will appear on all new invoices."
              : "Complete your company profile so it appears correctly on invoices."}
          </p>
          {!isComplete && (
            <Button
              size="sm"
              className="ml-auto shrink-0"
              onClick={startEditing}
            >
              Get Started
            </Button>
          )}
        </div>
      )}

      {/* ══════════════════ EDIT MODE ══════════════════ */}
      {editing ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Business Identity */}
          <Section icon={Building2} title="Business Identity">
            <div className="flex flex-col gap-4">
              <LogoUpload
                logo={draft.logo}
                onLogoChange={(v) => set("logo", v)}
              />
              <Separator />
              <div className="grid gap-3">
                <Field
                  label="Company Name"
                  name="name"
                  value={draft.name}
                  onChange={set}
                  placeholder="Acme Pvt. Ltd."
                  required
                />
                <Field
                  label="Tagline / Slogan"
                  name="tagline"
                  value={draft.tagline}
                  onChange={set}
                  placeholder="Empowering businesses worldwide"
                />
              </div>
            </div>
          </Section>

          {/* Contact */}
          <Section icon={Mail} title="Contact Details">
            <div className="grid gap-3">
              <Field
                label="Email Address"
                name="email"
                value={draft.email}
                onChange={set}
                placeholder="contact@yourcompany.com"
                type="email"
                required
              />
              <Field
                label="Phone Number"
                name="phone"
                value={draft.phone}
                onChange={set}
                placeholder="+91 98765 43210"
              />
              <Field
                label="Website"
                name="website"
                value={draft.website}
                onChange={set}
                placeholder="https://yourcompany.com"
              />
            </div>
          </Section>

          {/* Address */}
          <Section icon={MapPin} title="Business Address">
            <div className="grid gap-3">
              <Field
                label="Street Address"
                name="address"
                value={draft.address}
                onChange={set}
                placeholder="123 Business Park, Sector 7"
                required
              />
              <div className="grid grid-cols-2 gap-3">
                <Field
                  label="City"
                  name="city"
                  value={draft.city}
                  onChange={set}
                  placeholder="Mumbai"
                />
                <Field
                  label="State"
                  name="state"
                  value={draft.state}
                  onChange={set}
                  placeholder="Maharashtra"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field
                  label="PIN Code"
                  name="pincode"
                  value={draft.pincode}
                  onChange={set}
                  placeholder="400001"
                />
                <Field
                  label="Country"
                  name="country"
                  value={draft.country}
                  onChange={set}
                  placeholder="India"
                />
              </div>
            </div>
          </Section>

          {/* Tax & Reg */}
          <Section icon={BadgeCheck} title="Tax & Registration">
            <div className="grid gap-3">
              <Field
                label="GSTIN"
                name="gstin"
                value={draft.gstin}
                onChange={set}
                placeholder="22AAAAA0000A1Z5"
              />
              <Field
                label="PAN Number"
                name="pan"
                value={draft.pan}
                onChange={set}
                placeholder="AAAAA0000A"
              />
            </div>
          </Section>

          {/* Bank */}
          <div className="lg:col-span-2">
            <Section icon={CreditCard} title="Bank & Payment Details">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <Field
                  label="Bank Name"
                  name="bankName"
                  value={draft.bankName}
                  onChange={set}
                  placeholder="HDFC Bank"
                />
                <Field
                  label="Account Holder Name"
                  name="accountName"
                  value={draft.accountName}
                  onChange={set}
                  placeholder="Acme Pvt. Ltd."
                />
                <Field
                  label="Account Number"
                  name="accountNumber"
                  value={draft.accountNumber}
                  onChange={set}
                  placeholder="50100123456789"
                />
                <Field
                  label="IFSC Code"
                  name="ifsc"
                  value={draft.ifsc}
                  onChange={set}
                  placeholder="HDFC0001234"
                />
                <Field
                  label="Branch"
                  name="branch"
                  value={draft.branch}
                  onChange={set}
                  placeholder="Bandra West, Mumbai"
                />
                <Field
                  label="UPI ID"
                  name="upi"
                  value={draft.upi}
                  onChange={set}
                  placeholder="yourname@upi"
                />
              </div>
            </Section>
          </div>

          {/* Invoice Prefs */}
          <div className="lg:col-span-2">
            <Section icon={FileText} title="Invoice Preferences">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Field
                  label="Invoice Prefix"
                  name="invoicePrefix"
                  value={draft.invoicePrefix}
                  onChange={set}
                  placeholder="INV"
                />
                <Field
                  label="Default Payment Terms"
                  name="defaultPaymentTerms"
                  value={draft.defaultPaymentTerms}
                  onChange={set}
                  placeholder="Net 30"
                />
                <div className="space-y-1">
                  <Label
                    htmlFor="currency"
                    className="text-xs font-medium text-muted-foreground"
                  >
                    Default Currency
                  </Label>
                  <select
                    id="currency"
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
              <div className="mt-3">
                <Field
                  label="Invoice Footer Note"
                  name="invoiceFooter"
                  value={draft.invoiceFooter}
                  onChange={set}
                  placeholder="Thank you for your business! Payment due within 30 days."
                />
              </div>
            </Section>
          </div>
        </div>
      ) : (
        /* ══════════════════ VIEW MODE ══════════════════ */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* ── Left column ── */}
          <div className="flex flex-col gap-4">
            {/* Company Identity Card */}
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="h-14 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent" />
              <div className="flex flex-col items-center text-center px-5 pb-5 -mt-7">
                <div className="h-16 w-16 rounded-xl border-4 border-background bg-muted shadow-md flex items-center justify-center overflow-hidden mb-3">
                  {company.logo ? (
                    <img
                      src={company.logo}
                      alt="logo"
                      className="h-full w-full object-contain p-1"
                    />
                  ) : (
                    <Building2 className="h-7 w-7 text-muted-foreground/50" />
                  )}
                </div>
                {company.name ? (
                  <p className="font-bold text-base leading-tight">
                    {company.name}
                  </p>
                ) : (
                  <p className="text-muted-foreground text-sm">
                    Company name not set
                  </p>
                )}
                {company.tagline && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {company.tagline}
                  </p>
                )}
                {(company.gstin || company.pan) && (
                  <div className="flex flex-wrap gap-1.5 mt-3 justify-center">
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

            {/* Invoice Preview */}
            <div className="rounded-xl border border-primary/20 bg-primary/5 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-primary/15">
                <FileText className="h-3.5 w-3.5 text-primary" />
                <span className="text-sm font-semibold text-primary">
                  Invoice Preview
                </span>
              </div>
              <div className="px-4 py-3">
                <p className="text-xs text-muted-foreground mb-2">
                  This appears in the FROM section of every invoice.
                </p>
                <div className="rounded-md border border-border/60 bg-background p-3 font-mono text-[11px] space-y-0.5">
                  <p className="font-bold text-sm font-sans">
                    {company.name || "Your Company"}
                  </p>
                  {company.tagline && (
                    <p className="text-muted-foreground">{company.tagline}</p>
                  )}
                  {company.address && (
                    <p className="text-muted-foreground">{company.address}</p>
                  )}
                  {(company.city || company.state) && (
                    <p className="text-muted-foreground">
                      {[company.city, company.state, company.pincode]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  )}
                  {company.gstin && (
                    <p className="text-muted-foreground">
                      GSTIN: {company.gstin}
                    </p>
                  )}
                  {company.email && (
                    <p className="text-muted-foreground">{company.email}</p>
                  )}
                  {company.phone && (
                    <p className="text-muted-foreground">{company.phone}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ── Right column ── */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {/* Contact */}
            <Section icon={Mail} title="Contact Information">
              {company.email || company.phone || company.website ? (
                <>
                  <InfoRow label="Email" value={company.email} />
                  <InfoRow label="Phone" value={company.phone} />
                  <InfoRow label="Website" value={company.website} />
                </>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  No contact details added
                </p>
              )}
            </Section>

            {/* Address */}
            <Section icon={MapPin} title="Business Address">
              {company.address ? (
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
                <p className="text-sm text-muted-foreground italic">
                  No address set
                </p>
              )}
            </Section>

            {/* Tax */}
            <Section icon={BadgeCheck} title="Tax & Registration">
              {company.gstin || company.pan ? (
                <>
                  <InfoRow label="GSTIN" value={company.gstin} mono />
                  <InfoRow label="PAN Number" value={company.pan} mono />
                </>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  No tax details added
                </p>
              )}
            </Section>

            {/* Bank */}
            <Section icon={CreditCard} title="Bank & Payment Details">
              {company.bankName || company.accountNumber || company.upi ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10">
                  <div>
                    <InfoRow label="Bank" value={company.bankName} />
                    <InfoRow
                      label="Account Holder"
                      value={company.accountName}
                    />
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
                <p className="text-sm text-muted-foreground italic">
                  No bank details added
                </p>
              )}
            </Section>

            {/* Invoice Prefs */}
            <Section icon={FileText} title="Invoice Preferences">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
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
              </div>
              {company.invoiceFooter && (
                <div className="rounded-lg bg-muted/50 border border-border/50 px-3 py-2">
                  <p className="text-[11px] text-muted-foreground mb-0.5">
                    Footer Note
                  </p>
                  <p className="text-sm italic">"{company.invoiceFooter}"</p>
                </div>
              )}
            </Section>
          </div>
        </div>
      )}
    </div>
  )
}
