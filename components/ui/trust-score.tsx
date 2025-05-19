"use client";

import { cn } from '@/lib/utils';

interface TrustScoreProps {
  value: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export default function TrustScore({ 
  value, 
  size = 'md',
  showLabel = true 
}: TrustScoreProps) {
  // Determine color based on score
  const getColor = (score: number) => {
    if (score >= 80) return 'text-emerald-500';
    if (score >= 50) return 'text-amber-500';
    return 'text-red-500';
  };
  
  // Size classes
  const sizeClasses = {
    sm: { circle: 'h-8 w-8', text: 'text-xs' },
    md: { circle: 'h-10 w-10', text: 'text-sm' },
    lg: { circle: 'h-14 w-14', text: 'text-base' },
  };
  
  // Circle stroke width
  const strokeWidth = size === 'lg' ? 3 : 2;
  
  // Circle dimensions
  const radius = size === 'lg' ? 24 : size === 'md' ? 18 : 14;
  const circumference = 2 * Math.PI * radius;
  
  // Calculate stroke dash offset
  const progress = value / 100;
  const strokeDashoffset = circumference - (progress * circumference);
  
  return (
    <div className="flex items-center justify-center gap-2">
      <div className="relative flex items-center justify-center">
        <svg
          className={cn(
            "transform -rotate-90",
            sizeClasses[size].circle
          )}
          viewBox={`0 0 ${radius * 2 + strokeWidth * 2} ${radius * 2 + strokeWidth * 2}`}
        >
          {/* Background circle */}
          <circle
            cx={radius + strokeWidth}
            cy={radius + strokeWidth}
            r={radius}
            className="fill-none stroke-muted"
            strokeWidth={strokeWidth}
          />
          
          {/* Progress circle */}
          <circle
            cx={radius + strokeWidth}
            cy={radius + strokeWidth}
            r={radius}
            className={cn(
              "fill-none transition-all duration-500 ease-out",
              getColor(value)
            )}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
        
        {/* Value text */}
        <div className={cn(
          "absolute font-medium",
          sizeClasses[size].text,
          getColor(value)
        )}>
          {value > 0 ? value : '-'}
        </div>
      </div>
      
      {showLabel && (
        <div className="text-xs text-muted-foreground">
          Trust Score
        </div>
      )}
    </div>
  );
}