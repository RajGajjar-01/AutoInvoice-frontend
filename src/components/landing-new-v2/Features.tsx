import { BarChart3, Clock, Database, Filter, Layers, Mail } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function Features() {
  const features = [
    {
      icon: Mail,
      title: "Email Automation",
      description:
        "Connect your inbox and let AI extract, categorize, and organize all invoices automatically.",
      color: "bg-blue-500/10 text-blue-500",
    },
    {
      icon: Database,
      title: "Smart Data Entry",
      description:
        "Add custom columns and create your own fields to organize data exactly how you need it.",
      color: "bg-green-500/10 text-green-500",
    },
    {
      icon: Layers,
      title: "Category Tables",
      description:
        "Separate tables for purchases, sales, and expenses—all synchronized in real-time.",
      color: "bg-purple-500/10 text-purple-500",
    },
    {
      icon: Clock,
      title: "Smart Reminders",
      description:
        "Never miss a payment deadline or follow-up with intelligent automated alerts.",
      color: "bg-orange-500/10 text-orange-500",
    },
    {
      icon: Filter,
      title: "Advanced Filters",
      description:
        "Filter by date, customer, or amount and export to Excel with a single click.",
      color: "bg-pink-500/10 text-pink-500",
    },
    {
      icon: BarChart3,
      title: "Live Analytics",
      description:
        "Real-time dashboards showing revenue trends, pending amounts, and profitability.",
      color: "bg-cyan-500/10 text-cyan-500",
    },
  ]

  return (
    <section id="features" className="py-24 bg-white overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-gray-900 mb-4">
            Powerful Features for Modern MSMEs
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to automate your financial workflows and focus
            on growth.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Card
                key={index}
                className="group hover:border-primary transition-all duration-300 shadow-sm hover:shadow-md"
              >
                <CardHeader>
                  <div
                    className={`w-12 h-12 rounded-lg ${feature.color} flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base text-gray-600 leading-relaxed font-medium">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
