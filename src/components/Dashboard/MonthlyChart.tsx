import React, { useState } from 'react';
import { MonthlyEnergyOutput } from '../../types/solar';
import { BarChart3, SunMedium, Layers } from 'lucide-react';
import { DemoBadge } from '../Common/DemoBadge';
import { useLanguage } from '../../i18n/LanguageContext';

interface MonthlyChartProps {
  data: MonthlyEnergyOutput[];
  tariff: number;
}

const THAI_MONTH_NAMES = [
  'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
  'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.',
];

export const MonthlyChart: React.FC<MonthlyChartProps> = ({ data }) => {
  const { language, t, formatCurrency, formatNumber } = useLanguage();
  const [activeMonthIdx, setActiveMonthIdx] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'energy' | 'stacked'>('stacked');

  const maxProduction = Math.max(...data.map((d) => d.productionKwh), 100);
  const chartHeight = 200;
  const chartWidth = 600;
  const barWidth = 32;
  const gap = (chartWidth - barWidth * 12) / 13;

  const activeData = activeMonthIdx !== null ? data[activeMonthIdx] : null;

  return (
    <div className="bg-[#112239] rounded-xl p-5 border border-[#1B3252] flex flex-col justify-between">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#1B3252]">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[#27D3BC]" />
            <h3 className="text-sm font-semibold text-white tracking-wide">
              {t('chartTitle')}
            </h3>
            <DemoBadge label={t('demoModel')} variant="demo" />
          </div>
          <p className="text-xs text-[#8FA3BF] mt-0.5">
            {t('chartSubtitle')}
          </p>
        </div>

        {/* View toggle */}
        <div className="flex items-center gap-1 bg-[#091526] p-1 rounded-lg border border-[#1B3252] self-start sm:self-auto text-xs">
          <button
            onClick={() => setViewMode('stacked')}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1.5 ${
              viewMode === 'stacked'
                ? 'bg-[#27D3BC] text-[#091526] font-semibold'
                : 'text-[#8FA3BF] hover:text-white'
            }`}
          >
            <Layers className="w-3 h-3" />
            {t('chartSelfVsGrid')}
          </button>
          <button
            onClick={() => setViewMode('energy')}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1.5 ${
              viewMode === 'energy'
                ? 'bg-[#27D3BC] text-[#091526] font-semibold'
                : 'text-[#8FA3BF] hover:text-white'
            }`}
          >
            <SunMedium className="w-3 h-3" />
            {t('chartTotalKwh')}
          </button>
        </div>
      </div>

      {/* SVG Chart */}
      <div className="mt-6 relative">
        <div className="w-full overflow-x-auto pb-2">
          <div className="min-w-[540px]">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight + 40}`}
              className="w-full h-auto overflow-visible"
            >
              <defs>
                <linearGradient id="barTeal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#27D3BC" stopOpacity="0.95" />
                  <stop offset="100%" stopColor="#1E9B8B" stopOpacity="0.75" />
                </linearGradient>
                <linearGradient id="barGrid" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.75" />
                  <stop offset="100%" stopColor="#0284C7" stopOpacity="0.45" />
                </linearGradient>
                <linearGradient id="barTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#27D3BC" stopOpacity="1" />
                  <stop offset="100%" stopColor="#115E59" stopOpacity="0.8" />
                </linearGradient>
              </defs>

              {/* Grid horizontal lines */}
              {[0, 0.25, 0.5, 0.75, 1.0].map((ratio) => {
                const y = chartHeight - ratio * chartHeight;
                const value = Math.round(ratio * maxProduction);
                return (
                  <g key={ratio}>
                    <line
                      x1="0"
                      y1={y}
                      x2={chartWidth}
                      y2={y}
                      stroke="#1B3252"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                    />
                    <text
                      x="0"
                      y={y - 4}
                      fill="#64748B"
                      fontSize="9"
                      fontFamily="monospace"
                    >
                      {value} kWh
                    </text>
                  </g>
                );
              })}

              {/* Bars */}
              {data.map((item, idx) => {
                const x = gap + idx * (barWidth + gap);
                const totalH = (item.productionKwh / maxProduction) * chartHeight;
                const selfH = (item.selfConsumedKwh / maxProduction) * chartHeight;
                const gridH = (item.gridFeedInKwh / maxProduction) * chartHeight;
                const isHovered = activeMonthIdx === idx;
                const monthDisplay = language === 'th' ? THAI_MONTH_NAMES[idx] : item.monthName;

                return (
                  <g
                    key={item.monthName}
                    className="cursor-pointer transition-all"
                    onMouseEnter={() => setActiveMonthIdx(idx)}
                    onMouseLeave={() => setActiveMonthIdx(null)}
                  >
                    {isHovered && (
                      <rect
                        x={x - 4}
                        y={0}
                        width={barWidth + 8}
                        height={chartHeight + 35}
                        fill="#27D3BC"
                        fillOpacity="0.08"
                        rx="4"
                      />
                    )}

                    {viewMode === 'stacked' ? (
                      <>
                        <rect
                          x={x}
                          y={chartHeight - totalH}
                          width={barWidth}
                          height={gridH}
                          fill="url(#barGrid)"
                          rx="2"
                          className="transition-all duration-200"
                        />
                        <rect
                          x={x}
                          y={chartHeight - selfH}
                          width={barWidth}
                          height={selfH}
                          fill="url(#barTeal)"
                          rx="2"
                          className="transition-all duration-200"
                        />
                      </>
                    ) : (
                      <rect
                        x={x}
                        y={chartHeight - totalH}
                        width={barWidth}
                        height={totalH}
                        fill="url(#barTotal)"
                        rx="3"
                        className="transition-all duration-200"
                      />
                    )}

                    <text
                      x={x + barWidth / 2}
                      y={chartHeight + 18}
                      textAnchor="middle"
                      fill={isHovered ? '#27D3BC' : '#8FA3BF'}
                      fontSize="10"
                      fontWeight={isHovered ? '700' : '500'}
                    >
                      {monthDisplay}
                    </text>

                    {isHovered && (
                      <text
                        x={x + barWidth / 2}
                        y={chartHeight - totalH - 6}
                        textAnchor="middle"
                        fill="#27D3BC"
                        fontSize="10"
                        fontWeight="700"
                        fontFamily="monospace"
                      >
                        {item.productionKwh}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-2 flex flex-wrap items-center justify-between text-xs text-[#8FA3BF] pt-2 border-t border-[#1B3252]/50">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-[#27D3BC]" />
              <span>{t('chartSelfConsumedLegend')} ({data[0] ? Math.round((data[0].selfConsumedKwh / data[0].productionKwh) * 100) : 75}%)</span>
            </div>
            {viewMode === 'stacked' && (
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-[#38BDF8]" />
                <span>{t('chartGridSurplusLegend')}</span>
              </div>
            )}
          </div>

          <span className="text-[11px] text-[#64748B]">
            {t('chartHoverTip')}
          </span>
        </div>
      </div>

      {/* Interactive Tooltip Card */}
      {activeData && (
        <div className="mt-4 p-3 bg-[#091526] rounded-lg border border-[#27D3BC]/30 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs animate-fadeIn">
          <div>
            <span className="text-[#8FA3BF] block text-[10px]">{t('chartSelectedMonth')}</span>
            <span className="text-white font-bold">
              {language === 'th' && activeMonthIdx !== null ? THAI_MONTH_NAMES[activeMonthIdx] : activeData.monthName} ({activeData.days} {t('chartDays')})
            </span>
          </div>
          <div>
            <span className="text-[#8FA3BF] block text-[10px]">{t('chartTotalGen')}</span>
            <span className="text-[#27D3BC] font-mono font-bold">{formatNumber(activeData.productionKwh)} kWh</span>
          </div>
          <div>
            <span className="text-[#8FA3BF] block text-[10px]">{t('chartEstSavings')}</span>
            <span className="text-emerald-400 font-mono font-bold">{formatCurrency(activeData.savingsThb)}</span>
          </div>
          <div>
            <span className="text-[#8FA3BF] block text-[10px]">{t('chartDailyIrrad')}</span>
            <span className="text-amber-300 font-mono font-bold">{activeData.dailyIrradiation} kWh/m²/day</span>
          </div>
        </div>
      )}
    </div>
  );
};
