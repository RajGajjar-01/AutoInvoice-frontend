import React from 'react';
import { Check, Coins, Lightbulb, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export function PricingSection() {
  const plans = [
    {
      name: 'Starter',
      badge: null,
      price: '₹499',
      per: '/mahina',
      compare: 'Ek CA visit se sasta!',
      tagline: 'Solo dukaan / freelancer ke liye',
      cta: 'Free try karein',
      main: false,
      features: [
        '500 invoices/month',
        '1 Business, 2 log',
        'WhatsApp & Email import',
        'GST Invoice & e-Way Bill',
        'Basic Stock (100 items)',
        'Mobile App',
        'Email support',
      ],
    },
    {
      name: 'Growth',
      badge: '⭐ Sabse Popular',
      price: '₹1,499',
      per: '/mahina',
      compare: 'Roz ka ₹50 — ek paratha!',
      tagline: 'Bada business / distributor ke liye',
      cta: 'Free try karein',
      main: true,
      features: [
        'Unlimited Invoices',
        '3 Business, 10 log',
        'Advanced Predictions',
        'Unlimited Stock',
        'Barcode & POS Billing',
        'CA Collaboration Mode',
        'Custom Invoice Design',
        'Priority Hindi Support',
      ],
    },
    {
      name: 'Enterprise',
      badge: null,
      price: 'Custom',
      per: '',
      compare: 'Unlimited sab kuch',
      tagline: 'Bade firm / CA office ke liye',
      cta: 'Baat karein',
      main: false,
      features: [
        'Sab kuch unlimited',
        'Dedicated Account Manager',
        'Custom Integration',
        'On-site Training',
        '24/7 Phone Support',
        'SLA Guarantee',
      ],
    },
  ];

  return (
    <section id="pricing" className="py-24 px-7 bg-muted/10">
      <div className="max-w-[1100px] mx-auto">
        <div className="text-center mb-12">
          <Badge
            variant="outline"
            className="px-4 py-1.5 mb-4 font-medium uppercase tracking-wider border-primary/30 text-primary bg-primary/5"
          >
            Kitna kharcha
          </Badge>
          <h2 className="text-3xl md:text-4xl lg:text-[42px] font-extrabold text-foreground mb-2.5">
            Ek chai se bhi sasta — roz ka
          </h2>
          <p className="text-muted-foreground text-base font-medium">
            14 din bilkul free. Card nahi chahiye. Cancel karo kabhi bhi.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {plans.map((plan, i) => (
            <Card
              key={i}
              className={`p-7 px-6 relative flex flex-col h-full transition-all duration-300 ${plan.main
                  ? 'bg-card border-2 border-primary shadow-xl z-10 overflow-visible'
                  : 'bg-card border-2 border-border shadow-md hover:border-primary/50'
                }`}
            >
              {plan.badge && (
                <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider whitespace-nowrap shadow-lg shadow-primary/20 z-20">
                  {plan.badge}
                </div>
              )}
              <div className="text-xs font-medium uppercase tracking-wider mb-1.5 text-muted-foreground">
                {plan.name}
              </div>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="font-extrabold text-[42px] text-foreground">
                  {plan.price}
                </span>
                {plan.per && (
                  <span className="text-sm text-muted-foreground">
                    {plan.per}
                  </span>
                )}
              </div>
              <div className="text-xs font-medium mb-1.5 flex items-center gap-1.5 text-primary">
                <Lightbulb className="w-3.5 h-3.5" />
                {plan.compare}
              </div>
              <div className="text-sm mb-6 text-muted-foreground">
                {plan.tagline}
              </div>
              <Button
                variant={plan.main ? 'default' : 'outline'}
                className={`w-full font-medium text-base h-11 rounded-xl mb-6 ${plan.main ? 'shadow-lg shadow-primary/20' : ''
                  }`}
              >
                {plan.cta} <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
              <div className={`pt-6 border-t border-border flex-grow`}>
                {plan.features.map((feature, j) => (
                  <div key={j} className="flex items-center gap-2.5 mb-3">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 bg-primary/10">
                      <Check className="w-3 h-3 text-primary" strokeWidth={3} />
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>

        <p className="text-center mt-7 text-gray-400 text-xs flex items-center justify-center gap-2">
          <span>🔒</span> Secure payment · Cancel anytime · No hidden charges ·
          Free data export
        </p>
      </div>
    </section>
  );
}
