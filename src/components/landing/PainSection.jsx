import React from 'react';
import { Frown, AlertCircle, XCircle, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { PainCard } from './PainCard';

export function PainSection() {
  const painPoints = [
    {
      icon: Frown,
      problem:
        'Roz ek hi cheez likhte likhte thak jaate hain — invoice number, naam, amount, GST...',
      old: 'Ghante baad bhi ek invoice nahi bani',
      fix: 'Bill forward karo. 10 second mein entry.',
    },
    {
      icon: AlertCircle,
      problem:
        'GST ka time aata hai toh raat ko neend nahi aati. Kya sahi hai, kya galat — pata nahi.',
      old: 'CA ko baar baar call, late fees ka darr',
      fix: 'GST apne aap file ho jaata hai. Tension zero.',
    },
    {
      icon: XCircle,
      problem:
        '"Kal de dunga" waale customers se paisa maangna — kitna awkward lagta hai.',
      old: 'Khud phone karo, rishte bigdein',
      fix: 'App seedha reminder bhejti hai, aap beech mein nahi.',
    },
    {
      icon: AlertTriangle,
      problem:
        'Godown mein kya hai, kitna bacha — tab pata chalta hai jab customer ke saamne stock khatam ho.',
      old: 'Izzat jaaye, customer jaaye',
      fix: 'Stock khatam hone se pehle hi alert aa jaata hai.',
    },
  ];

  return (
    <section className="py-20 px-7 bg-muted/30">
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center mb-12">
          <Badge
            variant="default"
            className="px-4 py-1.5 mb-4 font-medium uppercase tracking-wider"
          >
            Yeh sab aapke saath bhi hota hai?
          </Badge>
          <h2 className="text-3xl md:text-4xl lg:text-[42px] font-extrabold text-foreground mb-2.5">
            Ek baar inn cards pe hover karke dekhein
          </h2>
          <p className="text-muted-foreground text-base font-medium">
            Jaante hain yeh frustrations — aur har ek ka solution bhi hai.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {painPoints.map((point, i) => (
            <PainCard key={i} {...point} />
          ))}
        </div>
      </div>
    </section>
  );
}
