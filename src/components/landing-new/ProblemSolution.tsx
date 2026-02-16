import { Mail, FileSpreadsheet, BellRing, TrendingDown, CheckCircle2, Database, Filter, BarChart3, Clock } from "lucide-react";

export function ProblemSolution() {
  const items = [
    {
      problem: "Invoices lost in email",
      problemDesc: "Important invoices buried in hundreds of emails, making it impossible to track what's paid and what's pending.",
      solution: "Automatic Email Capture",
      solutionDesc: "Connect your email inbox. Our AI automatically extracts and organizes invoices with zero manual work.",
      icon: Mail,
      image: "https://images.unsplash.com/photo-1596526131083-e8c633c948d2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800"
    },
    {
      problem: "Manual Excel chaos",
      problemDesc: "Spending hours updating Excel sheets, copying data, fixing formulas, and dealing with version conflicts.",
      solution: "Smart Data Entry",
      solutionDesc: "Custom columns, flexible tables, and intelligent data validation. Your data, your way—but automated.",
      icon: FileSpreadsheet,
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800"
    },
    {
      problem: "Missed payment follow-ups",
      problemDesc: "Lost revenue because you forgot to follow up on pending payments or didn't remember important due dates.",
      solution: "Smart Reminders",
      solutionDesc: "Automated alerts for payment dues, pending tasks, and critical deadlines. Never miss a rupee again.",
      icon: BellRing,
      image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800"
    },
    {
      problem: "No visibility into business health",
      problemDesc: "You work hard every day but can't see which products are profitable, which customers pay late, or where money is stuck.",
      solution: "Real-Time Insights",
      solutionDesc: "Live dashboards showing revenue, outstanding payments, top customers, and business trends at a glance.",
      icon: TrendingDown,
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800"
    }
  ];

  return (
    <section className="bg-white py-20">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-semibold text-gray-900 mb-4">
            Built to Solve Real Problems
          </h2>
          <p className="text-xl text-gray-600">
            We understand the daily challenges of running a small business
          </p>
        </div>

        <div className="space-y-24">
          {items.map((item, index) => {
            const Icon = item.icon;
            const isEven = index % 2 === 0;

            return (
              <div
                key={index}
                className={`grid md:grid-cols-2 gap-12 items-center ${
                  isEven ? "" : "md:grid-flow-dense"
                }`}
              >
                {/* Problem Side */}
                <div className={`space-y-6 ${isEven ? "" : "md:col-start-2"}`}>
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-100 rounded-lg">
                    <span className="text-sm font-medium text-red-700">Problem</span>
                  </div>
                  <h3 className="text-3xl font-semibold text-gray-900">
                    {item.problem}
                  </h3>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    {item.problemDesc}
                  </p>

                  <div className="pt-6 border-t border-gray-200">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-100 rounded-lg mb-4">
                      <CheckCircle2 className="w-4 h-4 text-green-700" />
                      <span className="text-sm font-medium text-green-700">Solution</span>
                    </div>
                    <h4 className="text-2xl font-semibold text-gray-900 mb-3">
                      {item.solution}
                    </h4>
                    <p className="text-lg text-gray-600 leading-relaxed">
                      {item.solutionDesc}
                    </p>
                  </div>
                </div>

                {/* Visual Side - Different mockup for each problem */}
                <div className={`${isEven ? "" : "md:col-start-1 md:row-start-1"}`}>
                  <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-lg">
                    <div className="flex items-center justify-center w-16 h-16 bg-[#0a4a5c] rounded-xl mb-6">
                      <Icon className="w-8 h-8 text-white" strokeWidth={1.5} />
                    </div>
                    
                    {/* Email Automation Mockup */}
                    {index === 0 && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                          <Mail className="w-5 h-5 text-blue-600" />
                          <div className="flex-1">
                            <div className="h-2 bg-blue-600 rounded w-32 mb-1"></div>
                            <div className="h-1.5 bg-blue-400 rounded w-24"></div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-100 rounded-lg">
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                          <div className="flex-1">
                            <div className="h-2 bg-green-600 rounded w-28 mb-1"></div>
                            <div className="h-1.5 bg-green-400 rounded w-20"></div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                          <FileSpreadsheet className="w-5 h-5 text-gray-600" />
                          <div className="flex-1">
                            <div className="h-2 bg-gray-600 rounded w-36 mb-1"></div>
                            <div className="h-1.5 bg-gray-400 rounded w-24"></div>
                          </div>
                        </div>
                        <div className="mt-4 p-4 bg-gradient-to-r from-[#0a4a5c] to-[#0d6580] rounded-lg">
                          <div className="flex items-center justify-between text-white">
                            <div className="h-2 w-20 bg-white/70 rounded"></div>
                            <div className="h-2 w-16 bg-white/70 rounded"></div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Data Entry Table Mockup */}
                    {index === 1 && (
                      <div className="space-y-2">
                        <div className="grid grid-cols-4 gap-2 mb-2">
                          <div className="h-8 bg-[#0a4a5c] rounded flex items-center justify-center">
                            <div className="h-1.5 w-8 bg-white rounded"></div>
                          </div>
                          <div className="h-8 bg-[#0a4a5c] rounded flex items-center justify-center">
                            <div className="h-1.5 w-8 bg-white rounded"></div>
                          </div>
                          <div className="h-8 bg-[#0a4a5c] rounded flex items-center justify-center">
                            <div className="h-1.5 w-8 bg-white rounded"></div>
                          </div>
                          <div className="h-8 bg-[#d4a574] rounded flex items-center justify-center">
                            <div className="h-1.5 w-6 bg-white rounded"></div>
                          </div>
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                          <div className="h-10 bg-gray-100 rounded"></div>
                          <div className="h-10 bg-gray-100 rounded"></div>
                          <div className="h-10 bg-gray-100 rounded"></div>
                          <div className="h-10 bg-gray-50 rounded"></div>
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                          <div className="h-10 bg-gray-50 rounded"></div>
                          <div className="h-10 bg-gray-50 rounded"></div>
                          <div className="h-10 bg-gray-50 rounded"></div>
                          <div className="h-10 bg-green-50 rounded border border-green-200"></div>
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                          <div className="h-10 bg-gray-100 rounded"></div>
                          <div className="h-10 bg-gray-100 rounded"></div>
                          <div className="h-10 bg-gray-100 rounded"></div>
                          <div className="h-10 bg-gray-50 rounded"></div>
                        </div>
                      </div>
                    )}

                    {/* Reminder Notifications Mockup */}
                    {index === 2 && (
                      <div className="space-y-3">
                        <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <BellRing className="w-4 h-4 text-red-600" />
                            <div className="h-2 bg-red-600 rounded w-24"></div>
                          </div>
                          <div className="h-1.5 bg-red-400 rounded w-full mb-1"></div>
                          <div className="h-1.5 bg-red-300 rounded w-20"></div>
                        </div>
                        <div className="p-4 bg-amber-50 border-l-4 border-amber-500 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Clock className="w-4 h-4 text-amber-600" />
                            <div className="h-2 bg-amber-600 rounded w-28"></div>
                          </div>
                          <div className="h-1.5 bg-amber-400 rounded w-full mb-1"></div>
                          <div className="h-1.5 bg-amber-300 rounded w-16"></div>
                        </div>
                        <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Clock className="w-4 h-4 text-blue-600" />
                            <div className="h-2 bg-blue-600 rounded w-20"></div>
                          </div>
                          <div className="h-1.5 bg-blue-400 rounded w-full mb-1"></div>
                          <div className="h-1.5 bg-blue-300 rounded w-24"></div>
                        </div>
                      </div>
                    )}

                    {/* Analytics Dashboard Mockup */}
                    {index === 3 && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-gradient-to-br from-[#0a4a5c] to-[#0d6580] p-4 rounded-lg text-white">
                            <div className="h-1.5 w-16 bg-white/60 rounded mb-2"></div>
                            <div className="h-3 w-20 bg-white rounded"></div>
                          </div>
                          <div className="bg-gray-100 p-4 rounded-lg">
                            <div className="h-1.5 w-16 bg-gray-400 rounded mb-2"></div>
                            <div className="h-3 w-20 bg-gray-600 rounded"></div>
                          </div>
                        </div>
                        <div className="flex items-end justify-between gap-2 h-24 bg-gray-50 p-3 rounded-lg">
                          <div className="w-full bg-[#0a4a5c] rounded-t" style={{ height: '60%' }}></div>
                          <div className="w-full bg-[#0d6580] rounded-t" style={{ height: '45%' }}></div>
                          <div className="w-full bg-[#0a4a5c] rounded-t" style={{ height: '80%' }}></div>
                          <div className="w-full bg-[#0d6580] rounded-t" style={{ height: '55%' }}></div>
                          <div className="w-full bg-[#0a4a5c] rounded-t" style={{ height: '70%' }}></div>
                          <div className="w-full bg-[#d4a574] rounded-t" style={{ height: '90%' }}></div>
                        </div>
                        <div className="flex gap-2">
                          <div className="flex-1 h-2 bg-gradient-to-r from-[#0a4a5c] to-[#0d6580] rounded-full"></div>
                          <div className="h-2 w-16 bg-gray-300 rounded-full"></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}