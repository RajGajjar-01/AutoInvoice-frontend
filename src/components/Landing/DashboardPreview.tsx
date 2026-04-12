export function DashboardPreview() {
  const stats = [
    { label: "Revenue", value: "₹2,45,000" },
    { label: "Invoices", value: "48" },
    { label: "Customers", value: "23" },
    { label: "Pending", value: "₹32,500" },
  ]

  const invoices = [
    { num: "INV-2401", client: "ABC Corp", amount: "₹45,000", status: "Paid" },
    {
      num: "INV-2402",
      client: "XYZ Ltd",
      amount: "₹32,500",
      status: "Pending",
    },
    {
      num: "INV-2403",
      client: "Tech Solutions",
      amount: "₹18,000",
      status: "Paid",
    },
  ]

  return (
    <div className="rounded-xl border bg-card shadow-2xl overflow-hidden">
      <div className="bg-muted px-4 py-3 flex items-center gap-2 border-b">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-amber-500" />
          <div className="w-3 h-3 rounded-full bg-emerald-500" />
        </div>
        <div className="flex-1 text-center text-xs text-muted-foreground">
          AutoInvoice Dashboard
        </div>
      </div>
      <div className="p-6 bg-muted/30">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-background rounded-lg p-4 border"
            >
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <p className="text-xl font-bold mt-1">{stat.value}</p>
            </div>
          ))}
        </div>
        <div className="bg-background rounded-lg border overflow-hidden">
          <div className="px-4 py-3 border-b bg-muted/50">
            <p className="text-sm font-medium">Recent Invoices</p>
          </div>
          <div className="divide-y divide-border">
            {invoices.map((inv) => (
              <div
                key={inv.num}
                className="px-4 py-3 flex items-center justify-between text-sm"
              >
                <span className="font-mono text-primary font-medium">
                  {inv.num}
                </span>
                <span className="text-muted-foreground hidden sm:block">
                  {inv.client}
                </span>
                <span className="font-medium">{inv.amount}</span>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    inv.status === "Paid"
                      ? "bg-primary/10 text-primary"
                      : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                  }`}
                >
                  {inv.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
