import { Mail, Database, Layers, Clock, Filter, BarChart3 } from "lucide-react";

export function Features() {
  const features = [
    {
      icon: Mail,
      title: "Email to Invoice Automation",
      description: "Connect your inbox and let AI extract, categorize, and organize all invoices automatically.",
      screenshot: true
    },
    {
      icon: Database,
      title: "Smart Manual Entry",
      description: "Add custom columns, create your own fields, and organize data exactly how you need it.",
      screenshot: true
    },
    {
      icon: Layers,
      title: "Multiple Category Tables",
      description: "Separate tables for purchases, sales, expenses—all connected and synchronized in real-time.",
      screenshot: true
    },
    {
      icon: Clock,
      title: "Task & Due Date Reminders",
      description: "Never miss a payment deadline or follow-up. Smart alerts keep you on top of every task.",
      screenshot: true
    },
    {
      icon: Filter,
      title: "Smart Filters & Excel Export",
      description: "Filter by date, customer, amount, or any custom field. Export to Excel with one click.",
      screenshot: true
    },
    {
      icon: BarChart3,
      title: "Insight Dashboard",
      description: "Live analytics showing revenue trends, pending amounts, top customers, and profitability.",
      screenshot: true
    }
  ];

  return (
    <section id="features" className="bg-gray-50 py-20">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-semibold text-gray-900 mb-4">
            Everything You Need to Run Your Business
          </h2>
          <p className="text-xl text-gray-600">
            Purpose-built features for Indian MSMEs and their accountants
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow"
              >
                {/* Feature Screenshot Mockup */}
                {feature.screenshot && (
                  <div className="bg-gray-100 rounded-lg p-4 mb-6 h-40 flex items-center justify-center">
                    <div className="w-full space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-[#0a4a5c] rounded flex items-center justify-center">
                          <Icon className="w-4 h-4 text-white" strokeWidth={2} />
                        </div>
                        <div className="h-2 bg-gray-300 rounded flex-1"></div>
                      </div>
                      <div className="space-y-1.5">
                        <div className="h-2 bg-gray-300 rounded w-full"></div>
                        <div className="h-2 bg-gray-200 rounded w-4/5"></div>
                        <div className="h-2 bg-gray-200 rounded w-3/4"></div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 pt-2">
                        <div className="h-8 bg-[#d4a574] rounded"></div>
                        <div className="h-8 bg-gray-200 rounded"></div>
                        <div className="h-8 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Feature Content */}
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-[#0a4a5c]/10 rounded-lg flex items-center justify-center">
                    <Icon className="w-6 h-6 text-[#0a4a5c]" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
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
