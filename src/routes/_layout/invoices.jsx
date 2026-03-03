import { createFileRoute, Link } from "@tanstack/react-router"
import {
    FilePlus,
    LayoutTemplate,
    History,
    FileText,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import useLocalStorage from "@/hooks/useLocalStorage"
import { Badge } from "@/components/ui/badge"

export const Route = createFileRoute("/_layout/invoices")({
    component: InvoicesPage,
    head: () => ({
        meta: [{ title: "Invoices" }],
    }),
})

function InvoicesPage() {
    const [invoices] = useLocalStorage("invoices", [])

    const totalInvoices = invoices.length
    const paidCount = invoices.filter((i) => i.status === "paid").length
    const unpaidCount = invoices.filter((i) => i.status === "unpaid").length
    const overdueCount = invoices.filter((i) => i.status === "overdue").length

    const cards = [
        {
            title: "Create Invoice",
            description: "Build a new invoice with our modern invoice builder",
            icon: FilePlus,
            path: "/create-invoice",
            color: "bg-primary/10 text-primary",
        },
        {
            title: "Invoice Templates",
            description: "Browse built-in templates or create your own",
            icon: LayoutTemplate,
            path: "/invoice-templates",
            color: "bg-blue-500/10 text-blue-500",
        },
        {
            title: "Invoice History",
            description: "View, manage, and track all your past invoices",
            icon: History,
            path: "/invoice-history",
            color: "bg-emerald-500/10 text-emerald-500",
        },
    ]

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Invoices</h1>
                <p className="text-muted-foreground text-sm mt-1">
                    Create, manage, and send professional invoices
                </p>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
                        <div className="rounded-lg bg-primary/10 p-2">
                            <FileText className="h-4 w-4 text-primary" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalInvoices}</div>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Paid</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-500">{paidCount}</div>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Unpaid</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-amber-500">{unpaidCount}</div>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Overdue</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-destructive">{overdueCount}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Action Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {cards.map((card) => (
                    <Link key={card.path} to={card.path} className="group">
                        <Card className="h-full hover:shadow-lg transition-all duration-200 hover:border-primary/40 cursor-pointer">
                            <CardHeader>
                                <div className={`rounded-lg p-3 w-fit ${card.color}`}>
                                    <card.icon className="h-6 w-6" />
                                </div>
                                <CardTitle className="text-lg mt-3">{card.title}</CardTitle>
                                <CardDescription>{card.description}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button variant="ghost" className="px-0 text-primary group-hover:underline">
                                    Go to {card.title} →
                                </Button>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    )
}
