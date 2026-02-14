import React from 'react';
import {
  Check,
  Link2,
  Smartphone,
  BarChart3,
  Coffee,
  ArrowRight,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export function HowItWorksSection() {
  const steps = [
    {
      num: '1',
      icon: Link2,
      title: 'Apna account banao',
      desc: 'Naam, dukaan ka naam, GST number — bas yahi chahiye. 5 minute mein ready. Aapki beti ya beta help karega shuru mein.',
      note: 'Free phone setup available',
    },
    {
      num: '2',
      icon: Smartphone,
      title: 'Bill forward karo — koi bhi channel se',
      desc: 'Email pe PDF aaya? Forward karo. WhatsApp pe photo aaya? Bhej do. AutoInvoice khud padh legi — vendor, amount, GST — sab.',
      note: 'Hindi mein bhi kaam karta hai',
    },
    {
      num: '3',
      icon: BarChart3,
      title: 'Apna business dekhte raho — phone pe',
      desc: 'Kitna aana baaki hai, GST kab file hogi, stock kab khatam hoga — sab ek simple screen pe. Raat ko chain ki neend aayegi.',
      note: 'GST auto-file, tension-free',
    },
  ];

  return (
    <section id="how-it-works" className="py-24 px-7">
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center mb-14">
          <Badge
            variant="default"
            className="px-4 py-1.5 mb-4 font-medium uppercase tracking-wider"
          >
            Sirf 5 Minute
          </Badge>
          <h2 className="text-3xl md:text-4xl lg:text-[42px] font-extrabold text-foreground mb-2.5">
            Teen steps mein poora kaam
          </h2>
          <p className="text-muted-foreground text-base font-medium">
            Itna simple hai ki pehle din se kaam shuru ho jaata hai
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-7 relative">
          {/* Dashed connector line (hidden on mobile) */}
          <div className="hidden md:block absolute top-16 left-[18%] right-[18%] h-0 border-t-[3px] border-dashed border-border z-0" />

          {steps.map((step, i) => (
            <Card
              key={i}
              className="p-7 relative z-10 border-2 border-border hover:border-primary hover:shadow-lg transition-all"
            >
              <div className="flex items-center gap-3.5 mb-4">
                <div className="w-[52px] h-[52px] rounded-full bg-primary text-primary-foreground font-extrabold text-2xl flex items-center justify-center shrink-0 shadow-lg shadow-primary/40">
                  {step.num}
                </div>
                <step.icon className="w-10 h-10 text-primary" />
              </div>
              <h3 className="font-bold text-lg text-foreground mb-2.5">
                {step.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed text-sm mb-3.5">
                {step.desc}
              </p>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted border border-border">
                <Check className="w-3 h-3 text-primary" strokeWidth={3} />
                <span className="text-[11px] text-primary font-medium">
                  {step.note}
                </span>
              </div>
            </Card>
          ))}
        </div>

        {/* CA Callout */}
        <Card className="mt-11 p-6 px-7 bg-primary text-primary-foreground flex items-center gap-4 flex-wrap border-none">
          <Coffee className="w-9 h-9 text-primary-foreground/80" />
          <div className="flex-1 min-w-[240px]">
            <div className="font-bold text-lg mb-1">
              Apne CA ko chai pilao — yeh kaam hum karenge
            </div>
            <div className="text-primary-foreground/60 text-sm">
              GSTR-1, GSTR-3B, e-Invoice, e-Way Bill — sab automatically. CA ko
              bas final sign karna hoga.
            </div>
          </div>
          <Button
            variant="secondary"
            className="font-medium h-10 px-6 rounded-xl shrink-0"
          >
            Free try karein <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </Card>
      </div>
    </section>
  );
}
