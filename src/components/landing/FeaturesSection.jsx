import React from 'react';
import {
  Bot,
  Receipt,
  Package,
  Banknote,
  Smartphone,
  UserCircle,
  Zap,
  Briefcase,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

export function FeaturesSection() {
  const features = [
    {
      icon: Bot,
      title: 'Automatic Bill Reading',
      hindi: 'Email aur WhatsApp se',
      desc: 'PDF ho, photo ho, ya link — AutoInvoice khud padh ke entry kar deti hai. Aapko ek word nahi type karna.',
      tag: '3 ghante/day save',
    },
    {
      icon: Receipt,
      title: 'GST Invoice',
      hindi: 'Sarkari compliant',
      desc: 'Ek click mein GST invoice ban jaati hai. GSTIN automatically check hota hai. Customer ko seedha email ya WhatsApp.',
      tag: '100% legal',
    },
    {
      icon: Package,
      title: 'Stock Management',
      hindi: 'Kabhi stockout nahi',
      desc: 'App batayegi jab koi cheez khatam hone wali hai. Reorder ka reminder apne aap phone pe aayega.',
      tag: 'Alert on phone',
    },
    {
      icon: Banknote,
      title: 'Payment Reminder',
      hindi: 'Bina awkwardness ke',
      desc: 'Customer ko app seedha polite reminder bhejti hai. Aapko call nahi karna. Rishta bhi theek, paisa bhi aata hai.',
      tag: '2x faster recovery',
    },
    {
      icon: Smartphone,
      title: 'Mobile App',
      hindi: 'Jaise WhatsApp use karo',
      desc: 'Android aur iPhone dono pe. Simple screen, bade fonts. Gaadi mein baithe baithe bhi poori dukaan dekh lo.',
      tag: 'Works offline bhi',
    },
    {
      icon: UserCircle,
      title: 'CA Mode',
      hindi: 'Apne CA ko access do',
      desc: 'CA directly app mein dekh sakta hai — aapko sab kuch print karke nahi dena. Sabka time bhi bachta hai.',
      tag: 'CA approved feature',
    },
  ];

  return (
    <section id="features" className="py-24 px-7 bg-muted/20">
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center mb-14">
          <Badge
            variant="outline"
            className="px-4 py-1.5 mb-4 font-medium uppercase tracking-wider border-primary/30 text-primary bg-primary/5"
          >
            <span>Kya kya milta hai</span>
          </Badge>
          <h2 className="text-3xl md:text-4xl lg:text-[42px] font-extrabold text-foreground mb-2.5">
            Ek app — poori dukaan ka hisaab
          </h2>
          <p className="text-muted-foreground text-base font-medium">
            Tally, bahi khata, stock register — sab ek jagah, sab simple
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <Card
              key={i}
              className="p-6 border-2 border-primary/20 bg-card hover:border-primary hover:shadow-xl transition-all flex flex-col h-full"
            >
              <feature.icon className="w-10 h-10 text-primary mb-4" />
              <div className="mb-2">
                <span className="font-bold text-[18px] text-foreground block sm:inline">
                  {feature.title}
                </span>
                <span className="text-[11px] text-primary sm:ml-2 font-medium bg-primary/5 px-2 py-0.5 rounded-full border border-primary/10">
                  {feature.hindi}
                </span>
              </div>
              <p className="text-muted-foreground leading-relaxed text-sm mb-6 flex-grow">
                {feature.desc}
              </p>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-transparent rounded-lg border-2 border-primary/20 w-fit">
                <Zap className="w-3.5 h-3.5 text-primary" />
                <span className="text-[11px] text-primary font-bold uppercase tracking-wider">
                  {feature.tag}
                </span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
