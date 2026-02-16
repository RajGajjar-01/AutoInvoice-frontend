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
    <footer className="bg-[#1a1a1a] text-white py-16">
      <div className="max-w-[1200px] mx-auto px-6">
        {/* Main Footer Content */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 mb-12">
          {Object.entries(footerSections).map(([key, section]) => (
            <div key={key}>
              <h4 className="font-semibold mb-4 text-white">{section.title}</h4>
              <ul className="space-y-3">
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

        {/* Bottom Footer */}
        <div className="pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xl font-semibold text-white">AutomateHub</span>
            </div>
            
            <div className="text-gray-400 text-sm">
              © 2026 AutomateHub. Made in India for Indian Businesses.
            </div>

            <div className="flex gap-6">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Twitter
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                LinkedIn
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                YouTube
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
