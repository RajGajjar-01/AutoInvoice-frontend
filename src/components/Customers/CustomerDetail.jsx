import {
    ArrowLeft,
    BadgeIndianRupee,
    Building2,
    FileText,
    Mail,
    MapPin,
    MessageSquare,
    Phone,
    Tag,
    User,
    Wallet,
    CreditCard,
    Calendar,
    StickyNote,
    Truck,
} from "lucide-react"
import { Link } from "@tanstack/react-router"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import EditCustomer from "./EditCustomer"
import DeleteCustomer from "./DeleteCustomer"
import { CustomerTimeline } from "./CustomerTimeline"
import { CustomerQuickActions } from "./CustomerQuickActions"

// ─── Party type display ───────────────────────────────────────────────────────

const partyTypeVariant = {
    customer: "default",
    supplier: "secondary",
    both: "outline",
}
const partyTypeLabel = {
    customer: "Customer",
    supplier: "Supplier",
    both: "Customer & Supplier",
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function currency(val) {
    if (val == null || val === "" || Number.isNaN(Number(val))) return "—"
    return `₹${Number(val).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`
}

function ProfileRow({ icon: Icon, label, value, mono = false }) {
    if (!value) return null
    return (
        <div className="flex items-start gap-3 py-2.5">
            <div className="rounded-md bg-muted p-1.5 shrink-0 mt-0.5">
                <Icon className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
                <p className={`text-sm font-medium break-words ${mono ? "font-mono" : ""}`}>
                    {value}
                </p>
            </div>
        </div>
    )
}

// ─── Stats Card ───────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, iconClass, valueClass }) {
    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <p className="text-sm font-medium text-muted-foreground">{label}</p>
                <div className={`rounded-lg p-2 ${iconClass}`}>
                    <Icon className="h-4 w-4" />
                </div>
            </CardHeader>
            <CardContent>
                <p className={`text-2xl font-bold ${valueClass ?? ""}`}>{value}</p>
            </CardContent>
        </Card>
    )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function CustomerDetail({ customer, onDeleted }) {
    // Read invoices to compute stats
    let invoices = []
    try {
        const raw = localStorage.getItem("invoices")
        if (raw) invoices = JSON.parse(raw)
    } catch {
        invoices = []
    }

    const partyInvoices = invoices.filter(
        (inv) => inv.customerId === customer.id || inv.partyId === customer.id,
    )

    const totalInvoiced = partyInvoices.reduce((sum, inv) => sum + (Number(inv.total) || 0), 0)
    const totalPaid = partyInvoices.reduce((sum, inv) => sum + (Number(inv.amountPaid) || 0), 0)
    const outstandingBalance = totalInvoiced - totalPaid

    const type = customer.partyType ?? "customer"
    const tagsArr = Array.isArray(customer.tags) ? customer.tags : []

    return (
        <div className="flex flex-col gap-6">
            {/* ── Back + Header ── */}
            <div>
                <Link
                    to="/customers"
                    className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4 group"
                >
                    <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
                    Back to Customers
                </Link>

                <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3 flex-wrap">
                        {/* Avatar */}
                        <div className="rounded-xl bg-primary/10 p-3 shrink-0">
                            {type === "supplier" ? (
                                <Building2 className="h-6 w-6 text-primary" />
                            ) : (
                                <User className="h-6 w-6 text-primary" />
                            )}
                        </div>
                        <div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <h1 className="text-2xl font-bold tracking-tight">
                                    {customer.name}
                                </h1>
                                <Badge variant={partyTypeVariant[type] ?? "outline"} className="capitalize">
                                    {partyTypeLabel[type] ?? type}
                                </Badge>
                            </div>
                            {customer.email && (
                                <p className="text-sm text-muted-foreground mt-0.5">
                                    {customer.email}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                        <EditCustomer customer={customer} onSuccess={() => { }} variant="button" />
                        <DeleteCustomer customer={customer} onSuccess={onDeleted} variant="button" />
                    </div>
                </div>
            </div>

            {/* ── Stats Row ── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard
                    icon={BadgeIndianRupee}
                    label="Outstanding Balance"
                    value={currency(outstandingBalance)}
                    iconClass={
                        outstandingBalance > 0
                            ? "bg-amber-500/10 text-amber-500"
                            : "bg-emerald-500/10 text-emerald-500"
                    }
                    valueClass={
                        outstandingBalance > 0
                            ? "text-amber-600 dark:text-amber-400"
                            : "text-emerald-600 dark:text-emerald-400"
                    }
                />
                <StatCard
                    icon={FileText}
                    label="Total Invoices"
                    value={partyInvoices.length}
                    iconClass="bg-primary/10 text-primary"
                />
                <StatCard
                    icon={Wallet}
                    label="Total Invoiced"
                    value={currency(totalInvoiced)}
                    iconClass="bg-muted text-muted-foreground"
                />
            </div>

            {/* ── Two-column grid ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                {/* Left — Timeline */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    <CustomerTimeline customerId={customer.id} />
                </div>

                {/* Right — Profile + Quick Actions */}
                <div className="flex flex-col gap-4">
                    {/* Quick Actions */}
                    <CustomerQuickActions customer={customer} />

                    {/* Profile Card */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base flex items-center gap-2">
                                <User className="h-4 w-4 text-primary" />
                                Profile
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-6 pt-0">
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
                                value={customer.billingAddress || customer.address}
                            />
                            <ProfileRow
                                icon={Truck}
                                label="Shipping Address"
                                value={customer.shippingAddress}
                            />
                            <ProfileRow
                                icon={Wallet}
                                label="Opening Balance"
                                value={currency(customer.openingBalance)}
                            />
                            <ProfileRow
                                icon={CreditCard}
                                label="Credit Limit"
                                value={customer.creditLimit != null ? currency(customer.creditLimit) : null}
                            />
                            <ProfileRow
                                icon={Calendar}
                                label="Payment Terms"
                                value={customer.paymentTerms}
                            />
                            {tagsArr.length > 0 && (
                                <div className="flex items-start gap-3 py-2.5">
                                    <div className="rounded-md bg-muted p-1.5 shrink-0 mt-0.5">
                                        <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs text-muted-foreground mb-1.5">Tags</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {tagsArr.map((tag) => (
                                                <Badge key={tag} variant="secondary" className="text-xs">
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
            </div>
        </div>
    )
}

export default CustomerDetail
