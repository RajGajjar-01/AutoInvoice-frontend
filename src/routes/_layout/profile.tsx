import {
  BadgeCheck,
  Building2,
  CreditCard,
  FileText,
  Mail,
  MapPin,
  MessageSquare,
} from "lucide-react"
import { ProfileSection } from "@/components/Profile/ProfileSection"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  EmptyState,
  Field,
  InfoRow,
  LogoUpload,
} from "@/features/profile/components/shared"
import { useProfileForm } from "@/features/profile/hooks/useProfileForm"
import { useDocumentTitle } from "@/hooks/useDocumentTitle"

function AccountPage() {
  useDocumentTitle("My Account")

  const {
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
  } = useProfileForm()

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
