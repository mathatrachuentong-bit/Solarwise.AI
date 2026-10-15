import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  subtitle?: string;
  icon: LucideIcon;
  iconColor?: string;
  badge?: string;
  highlight?: boolean;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit,
  subtitle,
  icon: Icon,
  iconColor = 'text-[#27D3BC]',
  badge,
  highlight = false,
}) => {
  return (
    <div
      className={`relative bg-[#112239] rounded-xl p-4 sm:p-5 border transition-all ${
        highlight
          ? 'border-[#27D3BC]/40 shadow-lg shadow-[#27D3BC]/5'
          : 'border-[#1B3252] hover:border-[#27D3BC]/20'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="text-xs font-medium text-[#8FA3BF] tracking-wide uppercase">
          {title}
        </span>
        <div className={`p-2 rounded-lg bg-[#091526] border border-[#1B3252] ${iconColor}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="mt-3 flex items-baseline gap-1.5">
        <span className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-mono">
          {value}
        </span>
        {unit && <span className="text-xs font-semibold text-[#8FA3BF]">{unit}</span>}
      </div>

      {(subtitle || badge) && (
        <div className="mt-2.5 flex items-center justify-between text-xs text-[#8FA3BF] border-t border-[#1B3252]/60 pt-2">
          <span>{subtitle}</span>
          {badge && (
            <span className="text-[10px] font-semibold text-[#27D3BC] bg-[#27D3BC]/10 px-1.5 py-0.5 rounded">
              {badge}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
