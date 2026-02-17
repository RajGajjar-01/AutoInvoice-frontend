import { Mail, Database, Layers, Clock, Filter, BarChart3 } from "lucide-react";
import { useState } from "react";

export function Features() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const features = [
    {
      icon: Mail,
      title: "Email to Invoice Automation",
      description: "Connect your inbox and let AI extract, categorize, and organize all invoices automatically. Never manually enter invoice data again.",
      details: "Smart AI recognizes invoice patterns, extracts key data, and categorizes by vendor, date, and amount.",
      image: "/assets/images/download.jpg"
    },
    {
      icon: Database,
      title: "Smart Manual Entry",
      description: "Add custom columns, create your own fields, and organize data exactly how you need it for your business.",
      details: "Flexible data structure adapts to your workflow. Add unlimited custom fields and validation rules.",
      image: "/assets/images/Satika Threads.jpg"
    },
    {
      icon: Layers,
      title: "Multiple Category Tables",
      description: "Separate tables for purchases, sales, expenses—all connected and synchronized in real-time across your business.",
      details: "Automatic data sync ensures consistency. Link related entries across different categories effortlessly.",
      image: "/assets/images/Purani dukaan.jpg"
    },
    {
      icon: Clock,
      title: "Task & Due Date Reminders",
      description: "Never miss a payment deadline or follow-up. Smart alerts keep you on top of every task and commitment.",
      details: "Customizable reminder schedules. Get notified via email, SMS, or in-app notifications.",
      image: "/assets/images/mehar chand and sons, spices and teas, new delhi_.jpg"
    },
    {
      icon: Filter,
      title: "Smart Filters & Excel Export",
      description: "Filter by date, customer, amount, or any custom field. Export to Excel with one click for deeper analysis.",
      details: "Advanced filtering with multiple conditions. Export formatted Excel files with charts and summaries.",
      image: "/assets/images/138,188 Mobile Store Stock Photos, High-Res Pictures, and Images - Getty Images.jpg"
    },
    {
      icon: BarChart3,
      title: "Insight Dashboard",
      description: "Live analytics showing revenue trends, pending amounts, top customers, and profitability at a glance.",
      details: "Real-time data visualization. Track KPIs, identify trends, and make data-driven decisions instantly.",
      image: "/assets/images/🛒 Transform Your Supermarket with Spazes Interior Design! 🛒.jpg"
    }
  ];

  return (
    <section id="features" className="bg-gradient-to-b from-white to-gray-50 py-20 overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16 animate-fadeIn">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Everything You Need to Run Your Business
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Purpose-built features for Indian MSMEs and their accountants
          </p>
        </div>

        {/* Horizontal Expandable Cards */}
        <div className="flex gap-4 h-[500px]">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const isHovered = hoveredIndex === index;
            const isAnyHovered = hoveredIndex !== null;

            return (
              <div
                key={index}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={`relative group transition-all duration-700 ease-out rounded-2xl overflow-hidden cursor-pointer ${isHovered
                  ? 'flex-[3]'
                  : isAnyHovered
                    ? 'flex-[0.5]'
                    : 'flex-1'
                  }`}
              >
                {/* Background Image with Blur */}
                <div className="absolute inset-0">
                  <img
                    src={feature.image}
                    alt={feature.title}
                    className={`w-full h-full object-cover transition-all duration-700 ${isHovered ? 'scale-110 blur-sm' : 'scale-100 blur-md'
                      }`}
                  />
                </div>

                {/* Dark Overlay - Softer to match landing page */}
                <div className={`absolute inset-0 bg-gradient-to-br from-gray-900/70 via-gray-800/60 to-gray-900/70 transition-all duration-700 ${isHovered ? 'opacity-85' : 'opacity-75'
                  }`}></div>

                {/* Content Container */}
                <div className="relative h-full p-8 flex flex-col justify-between text-white">
                  {/* Top Section */}
                  <div className={`transition-all duration-700 ${isHovered ? 'opacity-100' : isAnyHovered ? 'opacity-0' : 'opacity-100'
                    }`}>
                    {/* Icon */}
                    <div className={`inline-flex items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm transition-all duration-700 ${isHovered ? 'w-20 h-20 mb-6' : 'w-16 h-16 mb-4'
                      }`}>
                      <Icon className={`text-white transition-all duration-700 ${isHovered ? 'w-10 h-10' : 'w-8 h-8'
                        }`} strokeWidth={2} />
                    </div>

                    {/* Title */}
                    <h3 className={`font-bold text-white transition-all duration-700 ${isHovered ? 'text-3xl mb-4' : 'text-2xl mb-3'
                      }`}>
                      {feature.title}
                    </h3>
                  </div>

                  {/* Center - Minimal collapsed state */}
                  {!isHovered && isAnyHovered && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center transform transition-all duration-700 opacity-100">
                        <Icon className="w-12 h-12 text-white/80 mx-auto mb-3" strokeWidth={1.5} />
                        <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-xl font-bold mx-auto">
                          {index + 1}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Expanded Content - Only visible when hovered */}
                  <div className={`transition-all duration-700 ${isHovered
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-10 pointer-events-none'
                    }`}>
                    <p className="text-lg text-white/90 mb-4 leading-relaxed">
                      {feature.description}
                    </p>

                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-6 border border-white/20">
                      <p className="text-sm text-white/80 leading-relaxed">
                        {feature.details}
                      </p>
                    </div>

                    <button className="group/btn flex items-center gap-2 text-white font-semibold hover:gap-3 transition-all duration-300 bg-white/10 hover:bg-white/20 px-6 py-3 rounded-lg backdrop-blur-sm border border-white/20">
                      <span>Learn more</span>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Decorative Glow */}
                <div className={`absolute inset-0 bg-gradient-to-t from-[#4ade80]/20 to-transparent transition-all duration-1000 ${isHovered ? 'opacity-100' : 'opacity-0'
                  }`}></div>
              </div>
            );
          })}
        </div>

        {/* Bottom Info */}
        <div className="text-center mt-12 animate-fadeIn" style={{ animationDelay: '400ms' }}>
          <p className="text-gray-600">
            <span className="font-semibold text-[#0a4a5c]">Hover over each card</span> to explore the features in detail
          </p>
        </div>
      </div>
    </section>
  );
}
