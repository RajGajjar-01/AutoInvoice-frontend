import {
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  FileText,
  IndianRupee,
  TrendingUp,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export function DashboardPreview() {
  return (
    <section className="bg-gradient-to-b from-gray-50 to-white py-20">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-semibold text-gray-900 mb-4">
            Clarity at Every Level
          </h2>
          <p className="text-xl text-gray-600">
            Real-time insights into your business performance—no Excel formulas
            required
          </p>
        </div>

        {/* Dashboard Mockup with Visual Graphics */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-2xl p-8">
          {/* Dashboard Header */}
          <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-200">
            <div>
              <h3 className="text-2xl font-semibold text-gray-900">
                Business Dashboard
              </h3>
              <p className="text-gray-500 mt-1">Real-time overview</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                Export
              </Button>
              <Button size="sm" className="bg-[#0a4a5c] hover:bg-[#083a48]">
                Filters
              </Button>
            </div>
          </div>

          {/* Key Metrics with Visual Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Revenue Card with Mini Chart */}
            <div className="bg-gradient-to-br from-[#0a4a5c] to-[#0d6580] text-white p-6 rounded-xl shadow-lg relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm opacity-90">Total Revenue</span>
                  <TrendingUp className="w-5 h-5 opacity-75" />
                </div>
                <div className="text-3xl font-semibold mb-1">₹8.4L</div>
                <div className="text-xs opacity-75 flex items-center gap-1">
                  <ArrowUpRight className="w-3 h-3" />
                  <span>23% increase</span>
                </div>
              </div>
              {/* Mini sparkline graphic */}
              <div className="absolute bottom-0 right-0 w-32 h-16 opacity-20">
                <svg viewBox="0 0 100 40" className="w-full h-full">
                  <polyline
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                    points="0,30 20,25 40,15 60,20 80,10 100,5"
                  />
                </svg>
              </div>
            </div>

            {/* Outstanding with Progress Bar */}
            <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-md">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Outstanding</span>
                <IndianRupee className="w-5 h-5 text-amber-500" />
              </div>
              <div className="text-3xl font-semibold text-gray-900 mb-3">
                ₹2.1L
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>15 pending</span>
                  <span>25%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-amber-500 h-2 rounded-full"
                    style={{ width: "25%" }}
                  />
                </div>
              </div>
            </div>

            {/* Customers with Icon Graphic */}
            <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-md">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Active Customers</span>
                <div className="flex -space-x-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-white" />
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-400 to-green-600 border-2 border-white" />
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 border-2 border-white" />
                </div>
              </div>
              <div className="text-3xl font-semibold text-gray-900 mb-1">
                142
              </div>
              <div className="text-xs text-green-600 flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3" />
                <span>12 new this month</span>
              </div>
            </div>

            {/* Invoices with Pie Chart Graphic */}
            <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-md relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Total Invoices</span>
                  <FileText className="w-5 h-5 text-purple-500" />
                </div>
                <div className="text-3xl font-semibold text-gray-900 mb-1">
                  486
                </div>
                <div className="text-xs text-green-600 flex items-center gap-1">
                  <ArrowUpRight className="w-3 h-3" />
                  <span>8% increase</span>
                </div>
              </div>
              {/* Mini donut chart graphic */}
              <div className="absolute bottom-2 right-2 w-16 h-16 opacity-30">
                <svg viewBox="0 0 36 36" className="w-full h-full">
                  <circle
                    cx="18"
                    cy="18"
                    r="16"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="3"
                  />
                  <circle
                    cx="18"
                    cy="18"
                    r="16"
                    fill="none"
                    stroke="#0a4a5c"
                    strokeWidth="3"
                    strokeDasharray="75 25"
                    transform="rotate(-90 18 18)"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Visual Invoice Status Overview */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Left: Status Distribution */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6">
              <h4 className="font-semibold text-gray-900 mb-4">
                Invoice Status
              </h4>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        Paid
                      </span>
                      <span className="font-semibold text-gray-900">
                        324 (67%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full shadow-sm"
                        style={{ width: "67%" }}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-amber-600" />
                        Pending
                      </span>
                      <span className="font-semibold text-gray-900">
                        127 (26%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-amber-500 to-amber-600 h-3 rounded-full shadow-sm"
                        style={{ width: "26%" }}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-red-600" />
                        Overdue
                      </span>
                      <span className="font-semibold text-gray-900">
                        35 (7%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-red-500 to-red-600 h-3 rounded-full shadow-sm"
                        style={{ width: "7%" }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Recent Activity with Visual Timeline */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6">
              <h4 className="font-semibold text-gray-900 mb-4">
                Recent Activity
              </h4>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white shadow-md flex-shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      Payment Received
                    </p>
                    <p className="text-xs text-gray-600">
                      Raj Traders • ₹24,500
                    </p>
                    <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-md flex-shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      New Invoice Created
                    </p>
                    <p className="text-xs text-gray-600">
                      M/s Sharma & Co • ₹18,200
                    </p>
                    <p className="text-xs text-gray-500 mt-1">5 hours ago</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white shadow-md flex-shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      Payment Reminder Sent
                    </p>
                    <p className="text-xs text-gray-600">
                      Gupta Enterprises • ₹42,300
                    </p>
                    <p className="text-xs text-gray-500 mt-1">1 day ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Compact Table */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 text-lg">
              Recent Invoices
            </h4>
            <div className="overflow-hidden border border-gray-200 rounded-xl">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                        Customer
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                        Amount
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {[
                      {
                        customer: "Raj Traders",
                        amount: "₹24,500",
                        date: "15 Feb",
                        status: "Paid",
                      },
                      {
                        customer: "M/s Sharma & Co",
                        amount: "₹18,200",
                        date: "14 Feb",
                        status: "Pending",
                      },
                      {
                        customer: "Krishna Distributors",
                        amount: "₹32,100",
                        date: "13 Feb",
                        status: "Paid",
                      },
                      {
                        customer: "Patel Medical",
                        amount: "₹15,800",
                        date: "12 Feb",
                        status: "Paid",
                      },
                    ].map((invoice, index) => (
                      <tr
                        key={index}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0a4a5c] to-[#0d6580] flex items-center justify-center text-white text-xs font-semibold">
                              {invoice.customer.charAt(0)}
                            </div>
                            <span className="text-sm font-medium text-gray-900">
                              {invoice.customer}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm font-semibold text-gray-900">
                            {invoice.amount}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-gray-600">
                            {invoice.date}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            variant={
                              invoice.status === "Paid"
                                ? "default"
                                : "secondary"
                            }
                            className={`inline-flex items-center gap-1 ${
                              invoice.status === "Paid"
                                ? "bg-green-100 text-green-700 hover:bg-green-200"
                                : "bg-amber-100 text-amber-700 hover:bg-amber-200"
                            }`}
                          >
                            {invoice.status === "Paid" ? (
                              <CheckCircle2 className="w-3 h-3" />
                            ) : (
                              <Clock className="w-3 h-3" />
                            )}
                            {invoice.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
