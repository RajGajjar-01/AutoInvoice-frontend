import React, { useState, useEffect } from 'react';
import { FileText, CheckCircle, Package, BookOpen } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function WhatsAppDemo() {
  const [step, setStep] = useState(0);

  const messages = [
    {
      from: 'user',
      text: 'Invoice_Sharma_Traders_Feb.pdf',
      sub: 'Bill forwarded from email',
      icon: FileText,
    },
    {
      from: 'system',
      text: "Got it, Rajesh-ji! I've read the invoice.",
      icon: CheckCircle,
    },
    {
      from: 'system',
      text: 'Sharma Traders · ₹48,200 · GST auto-calculated',
      icon: Package,
    },
    {
      from: 'system',
      text: 'Added to your books. GSTR-1 updated automatically.',
      icon: BookOpen,
    },
  ];

  useEffect(() => {
    if (step >= messages.length) return;
    const timer = setTimeout(
      () => setStep((s) => s + 1),
      step === 0 ? 600 : 1400,
    );
    return () => clearTimeout(timer);
  }, [step, messages.length]);

  return (
    <Card className="max-w-[340px] mx-auto overflow-hidden bg-[#ECE5DD] shadow-2xl">
      {/* WhatsApp Header */}
      <div className="bg-[#075E54] px-4 py-3 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#E07B39] to-[#c45e1e] flex items-center justify-center text-white font-bold text-base shrink-0">
          A
        </div>
        <div>
          <div className="text-white font-medium text-sm">AutoInvoice Assistant</div>
          <div className="text-white/70 text-xs text-medium">● Online</div>
        </div>
      </div>

      {/* Messages */}
      <div className="p-4 min-h-[220px] flex flex-col gap-2.5">
        {messages.slice(0, step).map((m, i) => {
          const Icon = m.icon;
          return (
            <div
              key={i}
              className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'} animate-[msgPop_0.35s_ease-out]`}
            >
              <div
                className={`max-w-[80%] px-3.5 py-2.5 shadow-sm text-xs text-[#1a1a1a] leading-relaxed ${m.from === 'user'
                    ? 'bg-[#DCF8C6] rounded-[18px_4px_18px_18px]'
                    : 'bg-white rounded-[4px_18px_18px_18px]'
                  }`}
              >
                <div className="flex items-center gap-2">
                  {Icon && <Icon className="w-3.5 h-3.5 text-[#E07B39]" />}
                  <span>{m.text}</span>
                </div>
                {m.sub && (
                  <div className="text-[11px] text-gray-500 mt-1">{m.sub}</div>
                )}
                <div className="text-[10px] text-gray-400 text-right mt-1">
                  {new Date().toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                  {m.from === 'user' && ' ✓✓'}
                </div>
              </div>
            </div>
          );
        })}

        {/* Typing Indicator */}
        {step < messages.length && step > 0 && (
          <div className="flex justify-start">
            <div className="bg-white px-4 py-2.5 rounded-[4px_18px_18px_18px] shadow-sm">
              <div className="flex gap-1 items-center">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-[dotBounce_1.2s_infinite]"
                    style={{ animationDelay: `${i * 0.2}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Replay Button */}
        {step >= messages.length && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setStep(0)}
            className="mt-1.5 w-full text-xs font-medium h-9"
          >
            ↺ Dobara dekhein
          </Button>
        )}
      </div>
    </Card>
  );
}
