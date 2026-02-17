import { Separator } from "@/components/ui/separator";

export function Footer() {
  const footerSections = {
    product: {
      title: "Product",
      links: ["Features", "Pricing", "Security", "Integrations", "API"]
    },
    company: {
      title: "Company",
      links: ["About Us", "Careers", "Blog", "Press Kit", "Contact"]
    },
    resources: {
      title: "Resources",
      links: ["Help Center", "Guides", "Webinars", "Case Studies", "Community"]
    },
    forAccountants: {
      title: "For Accountants",
      links: ["Partner Program", "Client Management", "GST Tools", "Training", "Support"]
    },
    legal: {
      title: "Legal",
      links: ["Privacy Policy", "Terms of Service", "Cookie Policy", "Data Security", "Compliance"]
    }
  };

  return (
    <footer className="bg-[#111111] text-white py-24">
      <div className="container mx-auto px-6">
        {/* Main Footer Content */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-12 mb-16">
          {Object.entries(footerSections).map(([key, section]) => (
            <div key={key}>
              <h4 className="font-bold text-lg mb-6 text-white">{section.title}</h4>
              <ul className="space-y-4">
                {section.links.map((link, index) => (
                  <li key={index}>
                    <a
                      href="#"
                      className="text-gray-400 hover:text-white transition-colors text-sm"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="bg-gray-800 mb-12" />

        {/* Bottom Footer */}
        <div className="">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">
                AutomateHub
              </span>
            </div>

            <div className="text-gray-500 text-sm">
              © 2026 AutomateHub. Built for Indian MSMEs & Accountants.
            </div>

            <div className="flex gap-8">
              {["Twitter", "LinkedIn", "YouTube"].map((social) => (
                <a key={social} href="#" className="text-gray-400 hover:text-white transition-colors text-sm font-medium">
                  {social}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
