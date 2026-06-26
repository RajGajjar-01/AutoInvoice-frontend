import { Store, Package, Pill, Users, Factory, Calculator } from "lucide-react";
import { Card } from "@/components/ui/card";

export function TrustedBy() {
  const categories = [
    { icon: Store, label: "Retail Stores" },
    { icon: Package, label: "Kirana Shops" },
    { icon: Pill, label: "Medical Stores" },
    { icon: Users, label: "Distributors" },
    { icon: Factory, label: "Manufacturers" },
    { icon: Calculator, label: "Accountants" }
  ];

  return (
    <section className="bg-gray-50 py-12 pb-20">
      <div className="max-w-[1200px] mx-auto px-6">
        <h2 className="text-3xl font-semibold text-gray-900 text-center mb-12">
          Built for Businesses Across India
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {categories.map((category, index) => {
            const Icon = category.icon;
            return (
              <Card
                key={index}
                className="flex flex-col items-center justify-center text-center p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-gray-200 bg-white group cursor-pointer"
              >
                <div className="w-14 h-14 flex items-center justify-center bg-gradient-to-br from-[#0a4a5c]/10 to-[#0d6580]/10 rounded-lg mb-3 group-hover:scale-110 transition-transform duration-300">
                  <Icon className="w-7 h-7 text-[#0a4a5c] group-hover:text-[#0d6580] transition-colors" strokeWidth={1.5} />
                </div>
                <span className="text-sm font-medium text-gray-700 group-hover:text-[#0a4a5c] transition-colors">{category.label}</span>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
