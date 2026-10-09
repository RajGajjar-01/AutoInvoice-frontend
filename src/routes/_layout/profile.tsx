import {
  BadgeCheck,
  Building2,
  CreditCard,
  FileText,
  Mail,
  MapPin,
  MessageSquare,
  ShieldCheck,
} from "lucide-react"
import { FormProvider } from "react-hook-form"
import { Link } from "react-router"
import { ProfileSection } from "@/components/Profile/ProfileSection"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  EmptyState,
  Field,
  InfoRow,
  LogoUpload,
  MaskedInfoRow,
} from "@/features/profile/components/shared"
import { useProfileForm } from "@/features/profile/hooks/useProfileForm"
import { useDocumentTitle } from "@/hooks/useDocumentTitle"

const navigation = [
  { id: "business", label: "Business identity" },
  { id: "contact", label: "Contact details" },
  { id: "address", label: "Business address" },
  { id: "tax", label: "Tax & registration" },
  { id: "bank", label: "Bank & payment" },
  { id: "invoicePrefs", label: "Document preferences" },
  { id: "communication", label: "Communication" },
]

function AccountPage() {
  useDocumentTitle("Business details")
  const {
    company,
    companySettings,
    isLoading,
    activeSection,
    companyForm,
    communicationForm,
    logo,
    updateSettingsMutation,
    startEdit,
    cancelEdit,
    setLogo,
    saveSection,
    saveCommunication,
    clearSmtpPassword,
    clearOpenwaApiKey,
  } = useProfileForm()

  const configured = [
    Boolean(company.name && company.name !== "My Company"),
    Boolean(company.email || company.phone),
    Boolean(company.address && company.city),
    Boolean(company.gstin || company.pan),
    Boolean(company.bankName || company.upi),
  ].filter(Boolean).length
  const saving = updateSettingsMutation.isPending
  const communicationErrors = communicationForm.formState.errors
  const communicationRegister = communicationForm.register

  if (isLoading) {
    return (
      <div role="status" className="py-12 text-sm text-muted-foreground">
        Loading business details…
      </div>
    )
  }

  return (
    <FormProvider {...companyForm}>
      <div className="mx-auto w-full min-w-0 max-w-6xl space-y-8 pb-12">
        <header className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Workspace settings
          </p>
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            Business details
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Keep your invoice header, contact details, and payment instructions
            accurate. Your personal account details are in{" "}
            <Link
              to="/settings"
              className="font-medium text-foreground underline underline-offset-4"
            >
              My profile
            </Link>
            .
          </p>
        </header>

        <div className="grid grid-cols-[64px_minmax(0,1fr)] items-center gap-4 rounded-2xl border bg-card p-5 sm:grid-cols-[64px_minmax(0,1fr)_auto] sm:gap-5 sm:p-6">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-muted/50">
            {company.logo ? (
              <img
                src={company.logo}
                alt="Business logo"
                className="h-full w-full object-contain p-1"
              />
            ) : (
              <Building2
                aria-hidden="true"
                className="h-7 w-7 text-muted-foreground"
              />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-lg font-semibold">
              {company.name && company.name !== "My Company"
                ? company.name
                : "Set up your business"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {company.city || company.state
                ? [company.city, company.state].filter(Boolean).join(", ")
                : "Add business details to make your documents yours."}
            </p>
          </div>
          <div className="col-span-2 min-w-0 border-t pt-4 sm:col-span-1 sm:min-w-40 sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0">
            <p className="text-sm font-medium">
              {configured} of 5 essentials added
            </p>
            <div
              role="progressbar"
              aria-label="Business profile essentials"
              aria-valuenow={configured}
              aria-valuemin={0}
              aria-valuemax={5}
              className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted"
            >
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${configured * 20}%` }}
              />
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[190px_minmax(0,1fr)] lg:gap-12">
          <nav
            aria-label="Business details sections"
            className="flex gap-1 overflow-x-auto pb-2 lg:sticky lg:top-6 lg:h-fit lg:flex-col lg:overflow-visible"
          >
            {navigation.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="shrink-0 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary"
              >
                {item.label}
              </a>
            ))}
          </nav>
          <main className="min-w-0">
            <ProfileSection
              id="business"
              icon={Building2}
              title="Business identity"
              description="Your name and logo appear on invoices and documents."
              isEditing={activeSection === "business"}
              onEdit={() => startEdit("business")}
              onSave={() => saveSection("business")}
              onCancel={cancelEdit}
              isSaving={saving}
              viewContent={
                company.name || company.logo ? (
                  <div className="space-y-1">
                    <InfoRow label="Business name" value={company.name} />
                    {company.logo && <InfoRow label="Logo" value="Added" />}
                  </div>
                ) : (
                  <EmptyState message="Add your business name to personalize invoices." />
                )
              }
              editContent={
                <div className="space-y-5">
                  <Field
                    name="name"
                    label="Business name"
                    placeholder="Acme Pvt. Ltd."
                    required
                    autoComplete="organization"
                  />
                  <LogoUpload logo={logo} onLogoChange={setLogo} />
                </div>
              }
            />

            <ProfileSection
              id="contact"
              icon={Mail}
              title="Contact details"
              description="Customers can use these details to reach your business."
              isEditing={activeSection === "contact"}
              onEdit={() => startEdit("contact")}
              onSave={() => saveSection("contact")}
              onCancel={cancelEdit}
              isSaving={saving}
              viewContent={
                company.email || company.phone || company.website ? (
                  <>
                    <InfoRow label="Business email" value={company.email} />
                    <InfoRow label="Phone" value={company.phone} />
                    <InfoRow label="Website" value={company.website} />
                  </>
                ) : (
                  <EmptyState message="Add an email, phone number, or website for your customers." />
                )
              }
              editContent={
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field
                    name="email"
                    label="Business email"
                    type="email"
                    placeholder="hello@business.com"
                    autoComplete="email"
                  />
                  <Field
                    name="phone"
                    label="Business phone"
                    type="tel"
                    placeholder="+91 98765 43210"
                    autoComplete="tel"
                  />
                  <div className="sm:col-span-2">
                    <Field
                      name="website"
                      label="Website"
                      type="url"
                      placeholder="https://yourbusiness.com"
                    />
                  </div>
                </div>
              }
            />

            <ProfileSection
              id="address"
              icon={MapPin}
              title="Business address"
              description="Shown on documents where a business address is needed."
              isEditing={activeSection === "address"}
              onEdit={() => startEdit("address")}
              onSave={() => saveSection("address")}
              onCancel={cancelEdit}
              isSaving={saving}
              viewContent={
                company.address ||
                company.city ||
                company.state ||
                company.pincode ? (
                  <>
                    <InfoRow label="Street address" value={company.address} />
                    <InfoRow label="City" value={company.city} />
                    <InfoRow label="State" value={company.state} />
                    <InfoRow label="PIN code" value={company.pincode} />
                  </>
                ) : (
                  <EmptyState message="Add your business address for invoices and tax documents." />
                )
              }
              editContent={
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Field
                      name="address"
                      label="Street address"
                      placeholder="Street, building, area"
                      autoComplete="street-address"
                    />
                  </div>
                  <Field
                    name="city"
                    label="City"
                    placeholder="Mumbai"
                    autoComplete="address-level2"
                  />
                  <Field
                    name="state"
                    label="State"
                    placeholder="Maharashtra"
                    autoComplete="address-level1"
                  />
                  <Field
                    name="pincode"
                    label="PIN code"
                    placeholder="400001"
                    autoComplete="postal-code"
                  />
                </div>
              }
            />

            <ProfileSection
              id="tax"
              icon={BadgeCheck}
              title="Tax & registration"
              description="Add these only if they apply to your business."
              isEditing={activeSection === "tax"}
              onEdit={() => startEdit("tax")}
              onSave={() => saveSection("tax")}
              onCancel={cancelEdit}
              isSaving={saving}
              viewContent={
                company.gstin || company.pan ? (
                  <>
                    <InfoRow label="GSTIN" value={company.gstin} mono />
                    <MaskedInfoRow
                      label="PAN"
                      value={company.pan}
                      maskType="pan"
                    />
                  </>
                ) : (
                  <EmptyState message="Add your GSTIN or PAN when you need them on documents." />
                )
              }
              editContent={
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field
                    name="gstin"
                    label="GSTIN"
                    placeholder="22AAAAA0000A1Z5"
                    helperText="15 characters"
                    mono
                  />
                  <Field
                    name="pan"
                    label="PAN"
                    placeholder="ABCDE1234F"
                    helperText="10 characters"
                    mono
                  />
                </div>
              }
            />

            <ProfileSection
              id="bank"
              icon={CreditCard}
              title="Bank & payment"
              description="Give customers a clear way to pay you."
              isEditing={activeSection === "bank"}
              onEdit={() => startEdit("bank")}
              onSave={() => saveSection("bank")}
              onCancel={cancelEdit}
              isSaving={saving}
              viewContent={
                company.bankName || company.accountNumber || company.upi ? (
                  <>
                    <InfoRow label="Bank" value={company.bankName} />
                    <MaskedInfoRow
                      label="Account number"
                      value={company.accountNumber}
                    />
                    <InfoRow label="IFSC" value={company.ifsc} mono />
                    <InfoRow label="Branch" value={company.branch} />
                    <InfoRow label="UPI ID" value={company.upi} mono />
                  </>
                ) : (
                  <EmptyState message="Add a bank account or UPI ID to include payment instructions." />
                )
              }
              editContent={
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field
                    name="bankName"
                    label="Bank name"
                    placeholder="HDFC Bank"
                  />
                  <Field
                    name="branch"
                    label="Branch"
                    placeholder="Bandra West"
                  />
                  <Field
                    name="accountNumber"
                    label="Account number"
                    placeholder="50100123456789"
                    mono
                  />
                  <Field
                    name="ifsc"
                    label="IFSC code"
                    placeholder="HDFC0001234"
                    mono
                  />
                  <div className="sm:col-span-2">
                    <Field
                      name="upi"
                      label="UPI ID"
                      placeholder="business@upi"
                      mono
                    />
                  </div>
                </div>
              }
            />

            <ProfileSection
              id="invoicePrefs"
              icon={FileText}
              title="Document preferences"
              description="Set numbering prefixes and the note printed on invoices."
              isEditing={activeSection === "invoicePrefs"}
              onEdit={() => startEdit("invoicePrefs")}
              onSave={() => saveSection("invoicePrefs")}
              onCancel={cancelEdit}
              isSaving={saving}
              viewContent={
                <>
                  <InfoRow
                    label="Invoice prefix"
                    value={company.invoicePrefix}
                    mono
                  />
                  <InfoRow
                    label="Quotation prefix"
                    value={company.quotationPrefix}
                    mono
                  />
                  <InfoRow
                    label="Proforma prefix"
                    value={company.proformaPrefix}
                    mono
                  />
                  <InfoRow
                    label="Challan prefix"
                    value={company.challanPrefix}
                    mono
                  />
                  <InfoRow label="Invoice note" value={company.invoiceFooter} />
                </>
              }
              editContent={
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field
                    name="invoicePrefix"
                    label="Invoice prefix"
                    required
                    mono
                  />
                  <Field
                    name="quotationPrefix"
                    label="Quotation prefix"
                    required
                    mono
                  />
                  <Field
                    name="proformaPrefix"
                    label="Proforma prefix"
                    required
                    mono
                  />
                  <Field
                    name="challanPrefix"
                    label="Challan prefix"
                    required
                    mono
                  />
                  <div className="sm:col-span-2">
                    <Field
                      name="invoiceFooter"
                      label="Terms and conditions"
                      multiline
                      placeholder="Payment terms or a note for your customer"
                    />
                  </div>
                </div>
              }
            />

            <FormProvider {...communicationForm}>
              <ProfileSection
                id="communication"
                icon={MessageSquare}
                title="Communication"
                description="Configure WhatsApp and email delivery for your documents."
                isEditing={activeSection === "communication"}
                onEdit={() => startEdit("communication")}
                onSave={saveCommunication}
                onCancel={cancelEdit}
                isSaving={saving}
                viewContent={
                  companySettings?.whatsapp_enabled ||
                  companySettings?.smtp_host ? (
                    <>
                      <InfoRow
                        label="WhatsApp"
                        value={
                          companySettings.whatsapp_enabled
                            ? "Enabled"
                            : "Disabled"
                        }
                      />
                      <InfoRow
                        label="SMTP host"
                        value={companySettings.smtp_host}
                      />
                      {companySettings.openwa_api_key_set && (
                        <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                          <ShieldCheck className="h-4 w-4" /> WhatsApp API key
                          saved securely
                        </p>
                      )}
                      {companySettings.smtp_password_set && (
                        <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                          <ShieldCheck className="h-4 w-4" /> SMTP password
                          saved securely
                        </p>
                      )}
                    </>
                  ) : (
                    <EmptyState message="Set up a delivery method when you're ready to send documents." />
                  )
                }
                editContent={
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold">WhatsApp</h3>
                      <label className="flex items-center gap-3 text-sm font-medium">
                        <input
                          type="checkbox"
                          {...communicationRegister("whatsappEnabled")}
                          className="h-4 w-4 accent-primary"
                        />
                        Enable WhatsApp sending
                      </label>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field
                          name="openwaBaseUrl"
                          label="OpenWA base URL"
                          placeholder="https://openwa.example.com"
                        />
                        <Field
                          name="openwaSessionId"
                          label="Session ID"
                          placeholder={
                            companySettings?.openwa_session_id_set
                              ? "Leave blank to keep current session"
                              : "default"
                          }
                        />
                        <div className="sm:col-span-2">
                          <Field
                            name="openwaApiKey"
                            label="API key"
                            type="password"
                            placeholder={
                              companySettings?.openwa_api_key_set
                                ? "Leave blank to keep current key"
                                : "Enter API key"
                            }
                            autoComplete="new-password"
                          />
                          {companySettings?.openwa_api_key_set && (
                            <button
                              type="button"
                              disabled={saving}
                              onClick={clearOpenwaApiKey}
                              className="mt-2 text-xs text-destructive underline underline-offset-4"
                            >
                              Remove saved API key
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                    <Separator />
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold">Email delivery</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field
                          name="smtpHost"
                          label="SMTP host"
                          placeholder="smtp.example.com"
                        />
                        <div className="space-y-1.5">
                          <Label htmlFor="smtp-port">SMTP port</Label>
                          <Input
                            id="smtp-port"
                            type="number"
                            min={1}
                            max={65535}
                            {...communicationRegister("smtpPort", {
                              valueAsNumber: true,
                            })}
                            aria-invalid={Boolean(communicationErrors.smtpPort)}
                            aria-describedby={
                              communicationErrors.smtpPort
                                ? "smtp-port-error"
                                : undefined
                            }
                          />
                          {communicationErrors.smtpPort && (
                            <p
                              id="smtp-port-error"
                              className="text-sm text-destructive"
                            >
                              {communicationErrors.smtpPort.message}
                            </p>
                          )}
                        </div>
                        <Field
                          name="smtpUser"
                          label="SMTP username"
                          placeholder="user@example.com"
                        />
                        <div>
                          <Field
                            name="smtpPassword"
                            label="SMTP password"
                            type="password"
                            placeholder={
                              companySettings?.smtp_password_set
                                ? "Leave blank to keep current password"
                                : "Enter password"
                            }
                            autoComplete="new-password"
                          />
                          {companySettings?.smtp_password_set && (
                            <button
                              type="button"
                              disabled={saving}
                              onClick={clearSmtpPassword}
                              className="mt-2 text-xs text-destructive underline underline-offset-4"
                            >
                              Remove saved password
                            </button>
                          )}
                        </div>
                        <Field
                          name="smtpFromEmail"
                          label="From email"
                          type="email"
                          placeholder="invoices@business.com"
                        />
                        <Field
                          name="smtpFromName"
                          label="From name"
                          placeholder={company.name || "Your business"}
                        />
                      </div>
                    </div>
                  </div>
                }
              />
            </FormProvider>
          </main>
        </div>
      </div>
    </FormProvider>
  )
}

export default AccountPage
