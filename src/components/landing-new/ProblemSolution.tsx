import { Mail, FileSpreadsheet, BellRing, TrendingDown, CheckCircle2, Clock } from "lucide-react";
import { useState, useEffect } from "react";

export function ProblemSolution() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const items = [
    {
      problem: "Invoices lost in email",
      problemDesc: "Important invoices buried in hundreds of emails, making it impossible to track what's paid and what's pending.",
      solution: "Automatic Email Capture",
      solutionDesc: "Connect your email inbox. Our AI automatically extracts and organizes invoices with zero manual work.",
      icon: Mail,
    },
    {
      problem: "Manual Excel chaos",
      problemDesc: "Spending hours updating Excel sheets, copying data, fixing formulas, and dealing with version conflicts.",
      solution: "Smart Data Entry",
      solutionDesc: "Custom columns, flexible tables, and intelligent data validation. Your data, your way—but automated.",
      icon: FileSpreadsheet,
    },
    {
      problem: "Missed payment follow-ups",
      problemDesc: "Lost revenue because you forgot to follow up on pending payments or didn't remember important due dates.",
      solution: "Smart Reminders",
      solutionDesc: "Automated alerts for payment dues, pending tasks, and critical deadlines. Never miss a rupee again.",
      icon: BellRing,
    },
    {
      problem: "No visibility into business health",
      problemDesc: "You work hard every day but can't see which products are profitable, which customers pay late, or where money is stuck.",
      solution: "Real-Time Insights",
      solutionDesc: "Live dashboards showing revenue, outstanding payments, top customers, and business trends at a glance.",
      icon: TrendingDown,
    }
  ];

  // Auto-rotate carousel every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [items.length]);

  const currentItem = items[currentIndex];
  const Icon = currentItem.icon;

  return (
    <section className="bg-white py-20">
      <div className="max-w-[2000px] mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-semibold text-gray-900 mb-4">
            Built to Solve Real Problems
          </h2>
          <p className="text-xl text-gray-600">
            We understand the daily challenges of running a small business
          </p>
        </div>

        {/* Carousel Container with Vertical Slider on Left */}
        <div className="max-w-5xl mx-auto">
          <div className="flex gap-8 items-stretch">
            {/* Left Side - Vertical Slider */}
            <div className="flex flex-col gap-4 w-16 flex-shrink-0">
              {items.map((item, index) => {
                const ItemIcon = item.icon;
                return (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`relative group transition-all duration-500 ease-out ${index === currentIndex
                      ? 'h-32 bg-gradient-to-br from-[#0a4a5c] to-[#0d6580] shadow-xl'
                      : 'h-16 bg-gray-100 hover:bg-gray-200 hover:h-20'
                      } rounded-2xl flex items-center justify-center overflow-hidden`}
                    aria-label={`Go to ${item.problem}`}
                  >
                    {/* Icon */}
                    <ItemIcon
                      className={`transition-all duration-500 ${index === currentIndex
                        ? 'w-8 h-8 text-white'
                        : 'w-6 h-6 text-gray-600 group-hover:w-7 group-hover:h-7'
                        }`}
                      strokeWidth={1.5}
                    />

                    {/* Active Indicator */}
                    {index === currentIndex && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-16 bg-white rounded-r-full animate-fadeIn" />
                    )}

                    {/* Tooltip on hover for non-active items */}
                    {index !== currentIndex && (
                      <div className="absolute left-full ml-3 px-3 py-1.5 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none z-10">
                        {item.problem}
                        <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Right Side - Content */}
            <div className="flex-1 grid md:grid-cols-2 gap-12 items-center">
              {/* Problem & Solution Side */}
              <div className="space-y-6 transition-all duration-500 ease-in-out" key={currentIndex}>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-100 rounded-lg">
                  <span className="text-sm font-medium text-red-700">Problem</span>
                </div>
                <h3 className="text-3xl font-semibold text-gray-900 animate-fadeIn">
                  {currentItem.problem}
                </h3>
                <p className="text-lg text-gray-600 leading-relaxed animate-fadeIn">
                  {currentItem.problemDesc}
                </p>

                <div className="pt-6 border-t border-gray-200">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-100 rounded-lg mb-4">
                    <CheckCircle2 className="w-4 h-4 text-green-700" />
                    <span className="text-sm font-medium text-green-700">Solution</span>
                  </div>
                  <h4 className="text-2xl font-semibold text-gray-900 mb-3 animate-fadeIn">
                    {currentItem.solution}
                  </h4>
                  <p className="text-lg text-gray-600 leading-relaxed animate-fadeIn">
                    {currentItem.solutionDesc}
                  </p>
                </div>
              </div>

              {/* Visual Side - Mockup */}
              <div className="transition-all duration-500 ease-in-out" key={`visual-${currentIndex}`}>
                <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#0a4a5c] to-[#0d6580] rounded-xl mb-6 shadow-md">
                    <Icon className="w-8 h-8 text-white" strokeWidth={1.5} />
                  </div>

                  {/* Email Automation Mockup */}
                  {currentIndex === 0 && (
                    <div className="space-y-3 animate-fadeIn">
                      <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-100 rounded-lg hover:shadow-md transition-shadow">
                        <Mail className="w-5 h-5 text-blue-600" />
                        <div className="flex-1">
                          <div className="h-2 bg-blue-600 rounded w-32 mb-1"></div>
                          <div className="h-1.5 bg-blue-400 rounded w-24"></div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-100 rounded-lg hover:shadow-md transition-shadow">
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                        <div className="flex-1">
                          <div className="h-2 bg-green-600 rounded w-28 mb-1"></div>
                          <div className="h-1.5 bg-green-400 rounded w-20"></div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                        <FileSpreadsheet className="w-5 h-5 text-gray-600" />
                        <div className="flex-1">
                          <div className="h-2 bg-gray-600 rounded w-36 mb-1"></div>
                          <div className="h-1.5 bg-gray-400 rounded w-24"></div>
                        </div>
                      </div>
                      <div className="mt-4 p-4 bg-gradient-to-r from-[#0a4a5c] to-[#0d6580] rounded-lg shadow-md">
                        <div className="flex items-center justify-between text-white">
                          <div className="h-2 w-20 bg-white/70 rounded"></div>
                          <div className="h-2 w-16 bg-white/70 rounded"></div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Data Entry Table Mockup */}
                  {currentIndex === 1 && (
                    <div className="space-y-2 animate-fadeIn">
                      <div className="grid grid-cols-4 gap-2 mb-2">
                        <div className="h-8 bg-[#0a4a5c] rounded flex items-center justify-center shadow-sm">
                          <div className="h-1.5 w-8 bg-white rounded"></div>
                        </div>
                        <div className="h-8 bg-[#0a4a5c] rounded flex items-center justify-center shadow-sm">
                          <div className="h-1.5 w-8 bg-white rounded"></div>
                        </div>
                        <div className="h-8 bg-[#0a4a5c] rounded flex items-center justify-center shadow-sm">
                          <div className="h-1.5 w-8 bg-white rounded"></div>
                        </div>
                        <div className="h-8 bg-[#d4a574] rounded flex items-center justify-center shadow-sm">
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
                  {currentIndex === 2 && (
                    <div className="space-y-3 animate-fadeIn">
                      <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-2 mb-2">
                          <BellRing className="w-4 h-4 text-red-600" />
                          <div className="h-2 bg-red-600 rounded w-24"></div>
                        </div>
                        <div className="h-1.5 bg-red-400 rounded w-full mb-1"></div>
                        <div className="h-1.5 bg-red-300 rounded w-20"></div>
                      </div>
                      <div className="p-4 bg-amber-50 border-l-4 border-amber-500 rounded-lg hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="w-4 h-4 text-amber-600" />
                          <div className="h-2 bg-amber-600 rounded w-28"></div>
                        </div>
                        <div className="h-1.5 bg-amber-400 rounded w-full mb-1"></div>
                        <div className="h-1.5 bg-amber-300 rounded w-16"></div>
                      </div>
                      <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded-lg hover:shadow-md transition-shadow">
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
                  {currentIndex === 3 && (
                    <div className="space-y-4 animate-fadeIn">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gradient-to-br from-[#0a4a5c] to-[#0d6580] p-4 rounded-lg text-white shadow-md">
                          <div className="h-1.5 w-16 bg-white/60 rounded mb-2"></div>
                          <div className="h-3 w-20 bg-white rounded"></div>
                        </div>
                        <div className="bg-gray-100 p-4 rounded-lg shadow-sm">
                          <div className="h-1.5 w-16 bg-gray-400 rounded mb-2"></div>
                          <div className="h-3 w-20 bg-gray-600 rounded"></div>
                        </div>
                      </div>
                      <div className="flex items-end justify-between gap-2 h-24 bg-gray-50 p-3 rounded-lg shadow-sm">
                        <div className="w-full bg-[#0a4a5c] rounded-t transition-all hover:opacity-80" style={{ height: '60%' }}></div>
                        <div className="w-full bg-[#0d6580] rounded-t transition-all hover:opacity-80" style={{ height: '45%' }}></div>
                        <div className="w-full bg-[#0a4a5c] rounded-t transition-all hover:opacity-80" style={{ height: '80%' }}></div>
                        <div className="w-full bg-[#0d6580] rounded-t transition-all hover:opacity-80" style={{ height: '55%' }}></div>
                        <div className="w-full bg-[#0a4a5c] rounded-t transition-all hover:opacity-80" style={{ height: '70%' }}></div>
                        <div className="w-full bg-[#d4a574] rounded-t transition-all hover:opacity-80" style={{ height: '90%' }}></div>
                      </div>
                      <div className="flex gap-2">
                        <div className="flex-1 h-2 bg-gradient-to-r from-[#0a4a5c] to-[#0d6580] rounded-full shadow-sm"></div>
                        <div className="h-2 w-16 bg-gray-300 rounded-full"></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}