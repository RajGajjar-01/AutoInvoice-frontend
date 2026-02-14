import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { ArrowRight, Check, Trophy, CheckCircle, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { WhatsAppDemo } from './WhatsAppDemo';

export function HeroSection() {
  const navigate = useNavigate();
  return (
    <section className="pt-[120px] pb-20 px-7 relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute top-[-80px] right-[-80px] w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(224,123,57,0.09)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute bottom-[-60px] left-[-60px] w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(30,58,95,0.06)_0%,transparent_70%)] pointer-events-none" />

      <div className="max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-[55%_45%] gap-14 md:gap-14 items-center">
          {/* LEFT - Content */}
          <div className="animate-[fadeUp_0.7s_ease-out]">
            {/* Trust pills */}
            <div className="flex flex-wrap gap-2.5 mb-6">
              <Badge variant="default" className="px-3.5 py-1.5 font-medium">
                India mein #1 accounting app
              </Badge>
              <Badge variant="default" className="px-3.5 py-1.5 font-medium">
                GST Council approved
              </Badge>
            </div>

            {/* Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-[58px] font-extrabold leading-tight text-foreground mb-5">
              Bill type karna band karo.
              <br />
              <span className="text-primary">
                Bas{' '}
                <span className="border-b-[3px] border-primary pb-0.5">
                  forward karo,
                </span>
                <br />
                hum sambhal lenge.
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-[500px] font-medium">
              WhatsApp pe bill aaya? Email pe invoice? AutoInvoice khud padh leti
              hai, entry kar leti hai, aur GST bhi file kar deti hai — aapko
              kuch nahi karna.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-3.5 mb-9">
              <Button
                size="lg"
                onClick={() => navigate({ to: '/dashboard' })}
                className="font-medium h-12 px-8 text-base rounded-xl"
              >
                14 din free try karein{' '}
                <ArrowRight className="w-[18px] h-[18px] ml-2" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate({ to: '/dashboard' })}
                className="font-medium h-12 px-8 text-base rounded-xl"
              >
                <Play className="w-4 h-4 mr-2 fill-current" /> Demo dekhein
              </Button>
            </div>

            {/* Social proof bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                ['10,000+', 'dukaan / business'],
                ['₹500 Cr+', 'har mahine process'],
                ['4.8 ★', 'customer rating'],
                ['Hindi', 'support available'],
              ].map(([num, label]) => (
                <Card
                  key={label}
                  className="p-3 px-4 bg-card border-border shadow-sm text-center flex flex-col justify-center min-h-[70px]"
                >
                  <div className="font-medium text-lg text-primary leading-tight">
                    {num}
                  </div>
                  <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium mt-0.5">
                    {label}
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* RIGHT - Demo */}
          <div className="flex flex-col items-center gap-4 animate-[fadeUp_0.9s_ease-out]">
            <div className="bg-primary/10 rounded-xl px-4 py-2 border-[1.5px] border-dashed border-primary/20">
              <p className="text-sm text-primary font-medium text-center flex items-center gap-1.5">
                <span className="text-base">👇</span> Dekho kaise kaam karta hai
                — sirf WhatsApp!
              </p>
            </div>
            <WhatsAppDemo />
            <div className="flex flex-wrap justify-center gap-2">
              {[
                'No training needed',
                'Works on any phone',
                'Hindi support',
              ].map((text) => (
                <Badge
                  key={text}
                  variant="default"
                  className="px-3 py-1.5 font-medium"
                >
                  <span className="text-xs">{text}</span>
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
