import React, { useState } from 'react';
import { ChevronDown, HelpCircle, Phone } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export function FAQSection() {
  const faqs = [
    {
      q: 'Kya mujhe computer ki knowledge chahiye?',
      a: 'Bilkul nahi. Agar aap WhatsApp use kar sakte hain, toh AutoInvoice use kar sakte hain. Hamaari team aapko free mein phone pe setup karwa degi.',
    },
    {
      q: 'Mera purana Tally data kya hoga?',
      a: 'Hum aapka poora Tally data free mein transfer kar denge. Ek bhi entry khoni nahi padegi. Hamaari migration team is kaam ke liye hai.',
    },
    {
      q: 'Kya yeh government ke saath compliant hai?',
      a: 'Haan, 100%. GST Council ke saath registered hai AutoInvoice. e-Invoice aur e-Way Bill seedha government portal pe submit hota hai. Koi penalty ka risk nahi.',
    },
    {
      q: 'Internet nahi ho toh kya hoga?',
      a: 'App offline bhi kaam karta hai. Jab internet aaye, sab kuch apne aap sync ho jaata hai. Aapka kaam kabhi nahi rukta.',
    },
    {
      q: 'Agar koi problem aaye toh?',
      a: 'Hamaara Hindi support 9 AM – 9 PM available hai. Fone karo, WhatsApp karo, ya directly app se help maango. Koi bhi sawal chhota nahi hota.',
    },
  ];

  return (
    <section className="py-24 px-7">
      <div className="max-w-[700px] mx-auto">
        <div className="text-center mb-12">
          <Badge
            variant="default"
            className="px-4 py-1.5 mb-4 font-medium uppercase tracking-wider"
          >
            Sawaal Jawab
          </Badge>
          <h2 className="text-3xl md:text-4xl lg:text-[40px] font-extrabold text-foreground">
            Jo aap poochna chahte hain
          </h2>
        </div>

        <Card className="p-7 px-8 bg-card border-2 border-border shadow-md">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="border-b border-border last:border-b-0"
              >
                <AccordionTrigger className="font-medium text-sm text-foreground hover:no-underline py-5 text-left">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed text-sm pb-5">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Card>


      </div>
    </section>
  );
}
