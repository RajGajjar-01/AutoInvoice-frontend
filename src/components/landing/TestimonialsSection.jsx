import React, { useState } from 'react';
import { Star, Handshake } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export function TestimonialsSection() {
  const [activeTesti, setActiveTesti] = useState(0);

  const testimonials = [
    {
      name: 'Rajesh Gupta',
      shop: 'Gupta Electronics',
      city: 'Surat',
      initials: 'RG',
      color: '#E07B39',
      text: 'Pehle mera ek poora din sirf invoices likhne mein jata tha. Ab? Ek forward karo WhatsApp pe, kaam ho gaya. Meri beti ne setup kiya tha, 10 minute mein. GST ka tension bilkul khatam.',
    },
    {
      name: 'Sunita Agarwal',
      shop: 'Agarwal Textile House',
      city: 'Jaipur',
      initials: 'SA',
      color: '#2C5282',
      text: 'Mujhe computer ki zyada samajh nahi hai. Par yeh toh WhatsApp jaisa hai. Bill aaya, forward kiya, entry ho gayi. Mera CA bhi khush hai. 3 saal se use kar rahi hoon.',
    },
    {
      name: 'Mohan Pillai',
      shop: 'Pillai Medical Stores',
      city: 'Kochi',
      initials: 'MP',
      color: '#276749',
      text: 'GST notice aana band ho gaya hai. Har mahine GSTR automatically file ho jaati hai. ₹499 mein kitna kuch milta hai — pehle mera accountant akela ₹3000 leta tha sirf filing ke liye.',
    },
    {
      name: 'Harpreet Singh',
      shop: 'Singh Traders & Co.',
      city: 'Ludhiana',
      initials: 'HS',
      color: '#6B46C1',
      text: 'Mera bada warehouse hai. Pehle stock count karne mein pure din lagte the. Ab app se seedha pata chalta hai kya hai, kya nahi. Reorder bhi apne aap ho jaata hai.',
    },
  ];

  return (
    <section className="py-24 px-7">
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center mb-12">
          <Badge
            variant="default"
            className="px-4 py-1.5 mb-4 font-medium uppercase tracking-wider"
          >
            Unki zubaani
          </Badge>
          <h2 className="text-3xl md:text-4xl lg:text-[42px] font-extrabold text-foreground mb-2.5">
            Inke jaise logon ne try kiya, aur chod nahi paye
          </h2>
          <p className="text-muted-foreground text-base font-medium">
            Electronics, textile, medical, kirana — sab tarah ki dukaanon ke log
          </p>
        </div>

        {/* Main Testimonial */}
        <Card className="max-w-[760px] mx-auto mb-8 p-10 bg-card border-2 border-border shadow-xl text-center relative">
          <div className="text-[60px] text-primary/20 leading-none font-serif absolute top-4 left-7">
            "
          </div>
          <div className="flex gap-1 justify-center mb-4">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-primary text-primary" />
            ))}
          </div>
          <p className="text-[17px] text-foreground leading-relaxed italic mb-6">
            "{testimonials[activeTesti].text}"
          </p>
          <div className="flex items-center justify-center gap-3.5">
            <Avatar className="w-12 h-12">
              <AvatarFallback className="font-extrabold text-[17px] bg-primary text-primary-foreground">
                {testimonials[activeTesti].initials}
              </AvatarFallback>
            </Avatar>
            <div className="text-left">
              <div className="font-bold text-foreground text-sm">
                {testimonials[activeTesti].name}
              </div>
              <div className="text-xs text-muted-foreground">
                {testimonials[activeTesti].shop} ·{' '}
                {testimonials[activeTesti].city}
              </div>
            </div>
          </div>
        </Card>

        {/* Dots */}
        <div className="flex justify-center gap-2.5 mb-7">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveTesti(i)}
              className={`w-2.5 h-2.5 rounded-full border-2 border-primary transition-all ${
                i === activeTesti ? 'bg-primary' : 'bg-transparent'
              }`}
            />
          ))}
        </div>

        {/* Mini Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
          {testimonials.map((t, i) => (
            <button
              key={i}
              onClick={() => setActiveTesti(i)}
              className={`p-3.5 rounded-xl border-2 text-left transition-all ${
                i === activeTesti
                  ? 'border-primary bg-primary/10'
                  : 'border-border bg-card'
              }`}
            >
              <div className="flex gap-0.5 mb-2">
                {[...Array(5)].map((_, j) => (
                  <Star
                    key={j}
                    className="w-2.5 h-2.5 fill-primary text-primary"
                  />
                ))}
              </div>
              <div className="font-medium text-xs text-foreground">
                {t.name}
              </div>
              <div className="text-[11px] text-muted-foreground">{t.shop}</div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
