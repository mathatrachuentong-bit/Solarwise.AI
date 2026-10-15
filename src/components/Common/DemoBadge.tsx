import React from 'react';
import { AlertCircle, Info } from 'lucide-react';

interface DemoBadgeProps {
  label?: string;
  variant?: 'demo' | 'assumed' | 'info';
  className?: string;
  tooltip?: string;
}

export const DemoBadge: React.FC<DemoBadgeProps> = ({
  label = 'DEMO DATA',
  variant = 'demo',
  className = '',
  tooltip,
}) => {
  const getStyles = () => {
    switch (variant) {
      case 'assumed':
        return 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:border-amber-500/50';
      case 'info':
        return 'bg-[#27D3BC]/10 text-[#27D3BC] border-[#27D3BC]/30 hover:border-[#27D3BC]/50';
      case 'demo':
      default:
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:border-emerald-500/50';
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider uppercase border transition-colors cursor-help ${getStyles()} ${className}`}
      title={
        tooltip ||
        (variant === 'assumed'
          ? 'Manually entered building dimensions are assumed estimates and require field verification.'
          : 'This information uses demonstration figures for prototype evaluation.')
      }
    >
      {variant === 'assumed' ? (
        <AlertCircle className="w-3 h-3 shrink-0" />
      ) : (
        <Info className="w-3 h-3 shrink-0" />
      )}
      {label}
    </span>
  );
};
