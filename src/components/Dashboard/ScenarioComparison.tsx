import React from 'react';
import { ScenarioResult } from '../../types/solar';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { DemoBadge } from '../Common/DemoBadge';
import { useLanguage } from '../../i18n/LanguageContext';

interface ScenarioComparisonProps {
  scenarios: ScenarioResult[];
  onSelectCapacity: (capacity: number) => void;
}

export const ScenarioComparison: React.FC<ScenarioComparisonProps> = ({
  scenarios,
  onSelectCapacity,
}) => {
  const { t, formatCurrency, formatNumber, language } = useLanguage();

  const getScenarioLabel = (sc: ScenarioResult) => {
    if (language === 'th') {
      let sub = '';
      if (sc.capacityKwp <= 3.5) sub = ' (บ้านขนาดเล็ก)';
      else if (sc.capacityKwp <= 6.0) sub = ' (บ้านเดี่ยวมาตรฐาน)';
      else if (sc.capacityKwp <= 10.0) sub = ' (บ้านขนาดใหญ่)';
      else sub = ' (อาคารพาณิชย์/โฮมออฟฟิศ)';
      return `${sc.capacityKwp} kWp${sub}`;
    }
    return sc.label;
  };

  return (
    <div className="bg-[#112239] rounded-xl p-5 border border-[#1B3252]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#1B3252]">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-white tracking-wide">
              {t('scenarioTitle')}
            </h3>
            <DemoBadge label={t('demoModel')} variant="demo" />
          </div>
          <p className="text-xs text-[#8FA3BF] mt-0.5">
            {t('scenarioSubtitle')}
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {scenarios.map((sc) => (
          <div
            key={sc.capacityKwp}
            className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
              sc.isCurrent
                ? 'bg-[#091526] border-[#27D3BC] shadow-lg shadow-[#27D3BC]/10 ring-1 ring-[#27D3BC]'
                : 'bg-[#0E1E34] border-[#1B3252] hover:border-[#27D3BC]/40'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-white">
                  {getScenarioLabel(sc)}
                </span>
                {sc.isCurrent && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-[#27D3BC] bg-[#27D3BC]/15 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3" /> {t('activeBadge')}
                  </span>
                )}
              </div>

              <div className="flex items-baseline gap-1 my-2">
                <span className="text-2xl font-bold font-mono text-white">
                  {sc.capacityKwp}
                </span>
                <span className="text-xs text-[#8FA3BF] font-semibold">kWp</span>
                <span className="text-[11px] text-[#64748B] ml-auto">
                  ({sc.panelCount} {language === 'th' ? 'แผง' : 'panels'})
                </span>
              </div>

              <div className="space-y-1.5 py-3 border-y border-[#1B3252]/60 text-xs text-[#8FA3BF]">
                <div className="flex justify-between">
                  <span>{t('scenarioTurnkeyCost')}</span>
                  <span className="font-mono text-white font-medium">
                    {formatCurrency(sc.estimatedCostThb)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>{t('scenarioAnnualYield')}</span>
                  <span className="font-mono text-[#27D3BC] font-medium">
                    {formatNumber(sc.annualProductionKwh)} kWh
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>{t('scenarioAnnualSavings')}</span>
                  <span className="font-mono text-emerald-400 font-semibold">
                    {formatCurrency(sc.annualSavingsThb)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>{t('scenarioPayback')}</span>
                  <span className="font-mono text-amber-300 font-bold">
                    {sc.paybackYears} {t('kpiYears')}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-1">
              {sc.isCurrent ? (
                <div className="w-full py-1.5 text-center text-xs font-medium text-[#27D3BC] bg-[#27D3BC]/10 rounded-lg">
                  {t('scenarioCurrentSizing')}
                </div>
              ) : (
                <button
                  onClick={() => onSelectCapacity(sc.capacityKwp)}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium text-[#8FA3BF] hover:text-[#091526] hover:bg-[#27D3BC] bg-[#112239] rounded-lg border border-[#1B3252] hover:border-[#27D3BC] transition-colors"
                >
                  <span>{t('scenarioApply', { cap: sc.capacityKwp })}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
