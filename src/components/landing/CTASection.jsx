import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { ArrowRight, Check, Play, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CTASection() {
  const navigate = useNavigate();

  return (
    <section className="py-12 px-7 bg-primary relative overflow-hidden">
      {/* Decorative blob */}
      <div className="absolute top-[-80px] right-[-60px] w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.05)_0%,transparent_70%)] pointer-events-none" />

      <div className="max-w-[660px] mx-auto text-center relative text-primary-foreground">
        <h2 className="text-3xl md:text-4xl lg:text-[48px] font-extrabold mb-3.5">
          14 din free try karein.
          <br />
          <span className="text-secondary-foreground">Card nahi chahiye.</span>
        </h2>
        <p className="text-primary-foreground/70 text-[17px] leading-relaxed mb-8 font-medium">
          Ek baar chhod ke dekho manual entries ka jhanjhat. Hamaari team aapka
          poora purana data bhi free mein transfer kar degi — Tally se bhi,
          Excel se bhi.
        </p>
        <div className="flex flex-wrap gap-3.5 justify-center mb-6">
          <Button
            variant="secondary"
            className="font-medium h-12 px-8 text-base rounded-xl"
            onClick={() => navigate({ to: '/dashboard' })}
          >
            Abhi shuru karein — free mein{' '}
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          <Button
            variant="outline"
            className="bg-primary-foreground/10 border-2 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/20 font-medium h-12 px-8 text-base rounded-xl"
            onClick={() => navigate({ to: '/dashboard' })}
          >
            <Play className="w-4 h-4 mr-2 fill-primary-foreground" /> Demo
            dekhein
          </Button>
        </div>
        <div className="flex flex-wrap justify-center gap-4">
          {[
            '14 din free',
            'Card nahi chahiye',
            'Cancel karo kabhi bhi',
            'Data safe hai',
          ].map((text) => (
            <div
              key={text}
              className="flex items-center gap-1.5 text-primary-foreground/50 text-xs"
            >
              <Check
                className="w-3 h-3 text-secondary-foreground"
                strokeWidth={3}
              />
              {text}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
