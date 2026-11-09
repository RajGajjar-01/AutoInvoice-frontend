import {
  ArrowLeft,
  CurrencyInr as BadgeIndianRupee,
  CalendarBlank as Calendar,
  CreditCard,
  FilePlus,
  FileText,
  Envelope as Mail,
  MapPin,
  ChatCircle as MessageCircle,
  ChatText as MessageSquare,
  Phone,
  Note as StickyNote,
  Tag,
  Truck,
  User,
  Wallet,
} from "@phosphor-icons/react"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { Link } from "react-router"
import type { CustomerPublic } from "@/client/types.gen"
import { InitialsAvatar } from "@/components/Common/ListRow"
import { QuickActions } from "@/components/Common/QuickActions"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { invoicesListQueryOptions } from "@/features/invoices/queries"
import { CustomerSendEmailDialog } from "./CustomerSendEmailDialog"
import { CustomerTimeline } from "./CustomerTimeline"
import DeleteCustomer from "./DeleteCustomer"
import EditCustomer from "./EditCustomer"

const partyTypeVariant: Record<string, "default" | "secondary" | "outline"> = {
  customer: "default",
  supplier: "secondary",
  both: "outline",
}
const partyTypeLabel: Record<string, string> = {
  customer: "Customer",
  supplier: "Supplier",
  both: "Customer & Supplier",
}

function currency(val: number | string | null | undefined): string {
  if (val == null || val === "" || Number.isNaN(Number(val))) return "-"
  return `₹${Number(val).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`
}

interface ProfileRowProps {
  icon: typeof User
  label: string
  value?: string | null
  mono?: boolean
}

function ProfileRow({
  icon: Icon,
  label,
  value,
  mono = false,
}: ProfileRowProps) {
  if (!value) return null
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-border/50 last:border-0">
      <div className="rounded-md bg-muted p-1.5 shrink-0 mt-0.5">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-medium uppercase tracking wide text-muted-foreground mb-0.5">
          {label}
        </p>
        <p
          className={`text-sm break-words ${mono ? "font-mono" : "font-medium"}`}
        >
          {value}
        </p>
      </div>
    </div>
  )
}

interface StatCardProps {
  icon: typeof User
  label: string
  value: string | number
  iconClass?: string
  valueClass?: string
  sub?: string
  className?: string
}

function StatCard({
  icon: Icon,
  label,
  value,
  iconClass,
  valueClass,
  sub,
  className,
}: StatCardProps) {
  return (
    <div
      className={`flex min-w-0 items-center gap-3 rounded-xl border border-border bg-card p-3 transition-shadow hover:shadow-sm sm:p-4 ${className ?? ""}`}
    >
      <div className={`rounded-lg p-2 shrink-0 max-sm:hidden ${iconClass}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p
          className={`truncate text-base font-bold leading-tight tabular-nums sm:text-lg ${valueClass ?? ""}`}
        >
          {value}
        </p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

interface CustomerDetailProps {
  customer: CustomerPublic
  onDeleted?: () => void
}

export function CustomerDetail({ customer, onDeleted }: CustomerDetailProps) {
  const [emailDialogOpen, setEmailDialogOpen] = useState(false)
  const { data: invoicesRes } = useQuery(invoicesListQueryOptions())
  const invoices = (invoicesRes?.data ?? []).filter(
    (inv): inv is NonNullable<typeof inv> => inv != null,
  )

  const partyInvoices = invoices.filter((inv) => {
    const cid = inv.customer_id
    return cid === customer.id
  })

  const totalInvoiced = partyInvoices.reduce(
    (s, inv) => s + (Number(inv.grandTotal) || 0),
    0,
  )
  const totalPaid = partyInvoices
    .filter((inv) => inv.status === "paid")
    .reduce((s, inv) => s + (Number(inv.grandTotal) || 0), 0)
  const outstanding = totalInvoiced - totalPaid
  const overdueCount = partyInvoices.filter(
    (inv) => inv.status === "overdue",
  ).length

  const type = customer.party_type ?? "customer"
  const tagsArr = Array.isArray(customer.tags) ? customer.tags : []

  const whatsappNumber = (customer.whatsapp || customer.phone || "").replace(
    /\D/g,
    "",
  )

  return (
    <div className="flex flex-col gap-5">
      <Link
        to="/customers"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors group w-fit"
      >
        <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
        Back to Customers
      </Link>

      <div className="flex items-start gap-3">
        <InitialsAvatar name={customer.name} className="size-14 text-lg" />
        <div className="min-w-0 flex-1">
          <h1 className="break-words text-xl font-bold tracking-tight sm:text-2xl">
            {customer.name}
          </h1>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <Badge
              variant={partyTypeVariant[type] ?? "outline"}
              className="capitalize"
            >
              {partyTypeLabel[type] ?? type}
            </Badge>
            {customer.email && (
              <span className="min-w-0 truncate">{customer.email}</span>
            )}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <EditCustomer
            customer={customer}
            onSuccess={() => {}}
            variant="button"
          />
          <DeleteCustomer
            customer={customer}
            onSuccess={onDeleted}
            variant="button"
          />
        </div>
      </div>

      <QuickActions
        actions={[
          {
            label: "New invoice",
            icon: FilePlus,
            to: `/create-invoice?customerId=${customer.id}&documentType=invoice`,
            primary: true,
          },
          !!whatsappNumber && {
            label: "WhatsApp",
            icon: MessageCircle,
            href: `https://wa.me/${whatsappNumber}`,
          },
          !!customer.email && {
            label: "Email",
            icon: Mail,
            onClick: () => setEmailDialogOpen(true),
          },
          !!customer.phone && {
            label: "Call",
            icon: Phone,
            href: `tel:${customer.phone}`,
          },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-[30fr_70fr] gap-6 items-start">
        <div className="flex flex-col gap-4 max-lg:order-last">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                Profile Details
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pt-0">
              <Separator className="mb-1" />
              <ProfileRow icon={Phone} label="Phone" value={customer.phone} />
              <ProfileRow
                icon={MessageSquare}
                label="WhatsApp"
                value={customer.whatsapp}
              />
              <ProfileRow icon={Mail} label="Email" value={customer.email} />
              <ProfileRow
                icon={BadgeIndianRupee}
                label="GSTIN"
                value={customer.gstin || customer.gst}
                mono
              />
              <ProfileRow
                icon={MapPin}
                label="Billing Address"
                value={customer.billing_address || customer.address}
              />
              <ProfileRow
                icon={Truck}
                label="Shipping Address"
                value={customer.shipping_address}
              />
              <ProfileRow
                icon={Wallet}
                label="Opening Balance"
                value={
                  customer.opening_balance
                    ? currency(customer.opening_balance)
                    : null
                }
              />
              <ProfileRow
                icon={CreditCard}
                label="Credit Limit"
                value={
                  customer.credit_limit != null
                    ? currency(customer.credit_limit)
                    : null
                }
              />
              <ProfileRow
                icon={Calendar}
                label="Payment Terms"
                value={customer.payment_terms}
              />
              <ProfileRow
                icon={Calendar}
                label="Member Since"
                value={
                  customer.created_at
                    ? new Date(customer.created_at).toLocaleDateString(
                        "en-IN",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        },
                      )
                    : null
                }
              />

              {tagsArr.length > 0 && (
                <div className="flex items-start gap-3 py-2.5">
                  <div className="rounded-md bg-muted p-1.5 shrink-0 mt-0.5">
                    <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground mb-1.5">
                      Tags
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {tagsArr.map((tag: string) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="text-xs"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <ProfileRow
                icon={StickyNote}
                label="Notes"
                value={customer.notes}
              />
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <StatCard
              icon={BadgeIndianRupee}
              label="Outstanding"
              value={currency(outstanding)}
              sub={outstanding > 0 ? "Balance due" : "All clear"}
              iconClass={
                outstanding > 0
                  ? "bg-amber-500/10 text-amber-500"
                  : "bg-emerald-500/10 text-emerald-500"
              }
              valueClass={
                outstanding > 0
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-emerald-600 dark:text-emerald-400"
              }
            />
            <StatCard
              className="max-sm:order-last max-sm:col-span-2"
              icon={FileText}
              label="Total Invoices"
              value={partyInvoices.length}
              sub={overdueCount > 0 ? `${overdueCount} overdue` : "Up to date"}
              iconClass="bg-primary/10 text-primary"
              valueClass={overdueCount > 0 ? "text-destructive" : ""}
            />
            <StatCard
              icon={Wallet}
              label="Total Invoiced"
              value={currency(totalInvoiced)}
              sub="All time"
              iconClass="bg-muted text-muted-foreground"
            />
          </div>

          <CustomerTimeline customer={customer} invoices={invoices} />
        </div>
      </div>

      <CustomerSendEmailDialog
        open={emailDialogOpen}
        onOpenChange={setEmailDialogOpen}
        customerId={customer.id}
        customerName={customer.name}
        defaultEmail={customer.email ?? ""}
        invoices={partyInvoices}
      />
    </div>
  )
}

export default CustomerDetail
