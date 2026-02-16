import { Lock, ShieldCheck, FileText, Cloud } from "lucide-react";

export function Security() {
  const features = [
    {
      icon: Lock,
      title: "End-to-End Encryption",
      description: "Your business data is encrypted in transit and at rest. Bank-grade security for all your information."
    },
    {
      icon: ShieldCheck,
      title: "Role-Based Access",
      description: "Control who sees what. Give staff limited access while maintaining full oversight as the owner."
    },
    {
      icon: FileText,
      title: "Audit Logs",
      description: "Complete activity history. Track every change, who made it, and when—essential for compliance."
    },
    {
      icon: Cloud,
      title: "Secure Cloud Storage",
      description: "Auto-backup to secure cloud servers. Your data is safe even if your device fails or is lost."
    }
  ];

  return (
    <section className="bg-gray-50 py-20">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-semibold text-gray-900 mb-4">
            Your Data, Fully Protected
          </h2>
          <p className="text-xl text-gray-600">
            Enterprise-grade security built for small businesses
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white border-2 border-gray-200 rounded-2xl">
                  <Icon className="w-8 h-8 text-[#0a4a5c]" strokeWidth={1.5} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
