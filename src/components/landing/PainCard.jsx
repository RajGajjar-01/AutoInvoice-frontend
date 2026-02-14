import React from 'react';
import { Card } from '@/components/ui/card';

export function PainCard({ icon: Icon, problem, old, fix }) {
  return (
    <div className="pain-card-stack min-h-[190px]">
      {/* Problem Card - Front by default */}
      <Card className="pain-card-front p-6 border-2 border-border bg-card shadow-md min-h-[190px]">
        <div className="mb-3">
          <Icon className="w-9 h-9 text-primary" />
        </div>
        <p className="text-sm text-foreground font-medium leading-relaxed mb-3">
          {problem}
        </p>
        <p className="text-xs text-muted-foreground font-medium">
          Hover to see solution
        </p>
      </Card>

      {/* Solution Card - Back by default */}
      <Card className="pain-card-back p-6 border-2 border-primary bg-primary shadow-lg min-h-[190px] flex flex-col justify-center">
        <div className="text-xs text-primary-foreground/70 mb-3 line-through">
          {old}
        </div>
        <div className="text-base text-primary-foreground font-medium leading-relaxed flex items-start gap-2">
          <span className="text-primary-foreground">✓</span>
          <span>{fix}</span>
        </div>
      </Card>
    </div>
  );
}
