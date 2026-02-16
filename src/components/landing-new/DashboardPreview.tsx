import { TrendingUp, IndianRupee, Users, Package } from "lucide-react";

export function DashboardPreview() {
  return (
    <section className="bg-gray-50 py-20">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-semibold text-gray-900 mb-4">
            Clarity at Every Level
          </h2>
          <p className="text-xl text-gray-600">
            Real-time insights into your business performance—no Excel formulas required
          </p>
        </div>

        {/* Large Dashboard Mockup */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-2xl p-8 max-w-[1000px] mx-auto">
          {/* Dashboard Header */}
          <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-200">
            <div>
              <h3 className="text-2xl font-semibold text-gray-900">Business Overview</h3>
              <p className="text-gray-500 mt-1">Last 30 days</p>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
                Export
              </button>
              <button className="px-4 py-2 bg-[#0a4a5c] text-white rounded-lg text-sm hover:bg-[#083a48]">
                Filters
              </button>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-[#0a4a5c] to-[#0d6580] text-white p-6 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm opacity-90">Total Revenue</span>
                <TrendingUp className="w-5 h-5 opacity-75" />
              </div>
              <div className="text-3xl font-semibold mb-1">₹8.4L</div>
              <div className="text-xs opacity-75">↑ 23% from last month</div>
            </div>

            <div className="bg-white border border-gray-200 p-6 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Outstanding</span>
                <IndianRupee className="w-5 h-5 text-[#d4a574]" />
              </div>
              <div className="text-3xl font-semibold text-gray-900 mb-1">₹2.1L</div>
              <div className="text-xs text-gray-500">15 pending invoices</div>
            </div>

            <div className="bg-white border border-gray-200 p-6 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Active Customers</span>
                <Users className="w-5 h-5 text-gray-400" />
              </div>
              <div className="text-3xl font-semibold text-gray-900 mb-1">142</div>
              <div className="text-xs text-gray-500">12 new this month</div>
            </div>

            <div className="bg-white border border-gray-200 p-6 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Total Orders</span>
                <Package className="w-5 h-5 text-gray-400" />
              </div>
              <div className="text-3xl font-semibold text-gray-900 mb-1">486</div>
              <div className="text-xs text-gray-500">↑ 8% from last month</div>
            </div>
          </div>

          {/* Chart Area */}
          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h4 className="font-semibold text-gray-900">Revenue Trend</h4>
              <div className="flex gap-2">
                <button className="px-3 py-1 text-sm bg-white border border-gray-200 rounded-lg text-gray-700">7D</button>
                <button className="px-3 py-1 text-sm bg-[#0a4a5c] text-white rounded-lg">30D</button>
                <button className="px-3 py-1 text-sm bg-white border border-gray-200 rounded-lg text-gray-700">90D</button>
              </div>
            </div>
            
            {/* Simple Bar Chart Visualization */}
            <div className="flex items-end justify-between gap-3 h-48">
              {[65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88, 78].map((height, index) => (
                <div key={index} className="flex-1 flex flex-col justify-end">
                  <div
                    className="bg-gradient-to-t from-[#0a4a5c] to-[#0d6580] rounded-t-lg transition-all hover:opacity-80"
                    style={{ height: `${height}%` }}
                  ></div>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-4 text-xs text-gray-500">
              <span>Week 1</span>
              <span>Week 2</span>
              <span>Week 3</span>
              <span>Week 4</span>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900 mb-4">Recent Transactions</h4>
            {[
              { customer: "Raj Traders", amount: "₹24,500", status: "Paid", date: "Today" },
              { customer: "M/s Sharma & Co", amount: "₹18,200", status: "Pending", date: "Yesterday" },
              { customer: "Krishna Distributors", amount: "₹32,100", status: "Paid", date: "2 days ago" }
            ].map((transaction, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-[#0a4a5c] rounded-full flex items-center justify-center text-white font-semibold">
                    {transaction.customer.charAt(0)}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{transaction.customer}</div>
                    <div className="text-sm text-gray-500">{transaction.date}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">{transaction.amount}</div>
                  <div className={`text-sm ${transaction.status === 'Paid' ? 'text-green-600' : 'text-amber-600'}`}>
                    {transaction.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
