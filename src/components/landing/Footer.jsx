import React from 'react';
import { Shield, CheckCircle, Phone } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function Footer() {
  const footerLinks = [
    {
      head: 'Product',
      links: ['Features', 'Pricing', 'Security', 'Mobile App'],
    },
    {
      head: 'Support',
      links: ['Help Center (Hindi)', 'Call Us', 'WhatsApp', 'FAQs'],
    },
    {
      head: 'Company',
      links: ['About', 'Blog', 'Careers', 'Privacy Policy'],
    },
  ];

  return (
    <footer className="bg-muted py-12 px-7 pb-7">
      <div className="max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr] gap-10 mb-11">
          {/* Brand Column */}
          <div>
            <div className="flex items-center gap-2.5 mb-3.5">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-lg font-extrabold text-primary-foreground">
                  ₹
                </span>
              </div>
              <div>
                <div className="font-extrabold text-foreground text-lg">
                  AutoInvoice
                </div>
                <div className="text-[9px] text-primary font-medium tracking-wider">
                  APKA HISAAB-KITAAB
                </div>
              </div>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-[250px] mb-4">
              India ke 10,000+ business owners ki pehli pasand. Hindi support.
              Simple design. Aapke liye banaya hai.
            </p>
            <div className="flex gap-2">
              {[
                { icon: Shield, text: 'SOC 2' },
                { icon: CheckCircle, text: 'GST' },
                { icon: CheckCircle, text: 'RBI' },
              ].map((badge, i) => (
                <Badge
                  key={i}
                  variant="default"
                  className="px-2 py-1 font-bold"
                >
                  {badge.text} ✓
                </Badge>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {footerLinks.map((col) => (
            <div key={col.head}>
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3.5">
                {col.head}
              </div>
              {col.links.map((link) => (
                <a
                  key={link}
                  href="#"
                  className="block text-muted-foreground/80 text-sm no-underline mb-2.5 hover:text-foreground transition-colors"
                >
                  {link}
                </a>
              ))}
            </div>
          ))}
        </div>

        <div className="border-t border-border pt-5 flex flex-wrap justify-between gap-2.5 text-muted-foreground/50 text-xs">
          <p>© 2026 AutoInvoice. Made with ❤️ for Indian businesses.</p>
          <p className="flex items-center gap-1.5">
            <Phone className="w-3 h-3" /> Hindi Support: 9 AM – 9 PM · 7 din
          </p>
        </div>
      </div>
    </footer>
  );
}
