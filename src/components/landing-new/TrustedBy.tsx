import { Store, Package, Pill, Users, Factory, Calculator } from "lucide-react";

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

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {categories.map((category, index) => {
            const Icon = category.icon;
            return (
              <div key={index} className="flex flex-col items-center text-center space-y-3">
                <div className="w-16 h-16 flex items-center justify-center bg-white rounded-lg shadow-sm">
                  <Icon className="w-8 h-8 text-gray-700" strokeWidth={1.5} />
                </div>
                <span className="text-sm text-gray-700">{category.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
