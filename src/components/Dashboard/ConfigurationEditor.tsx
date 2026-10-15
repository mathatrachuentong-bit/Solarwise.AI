import React from 'react';
import { SolarConfig, FinancialConfig } from '../../types/solar';
import { Sliders, RotateCcw, HelpCircle } from 'lucide-react';
import { DemoBadge } from '../Common/DemoBadge';
import { useLanguage } from '../../i18n/LanguageContext';

interface ConfigurationEditorProps {
  solar: SolarConfig;
  financial: FinancialConfig;
  onUpdateSolar: (solar: Partial<SolarConfig>) => void;
  onUpdateFinancial: (fin: Partial<FinancialConfig>) => void;
  onResetDefaults: () => void;
}

export const ConfigurationEditor: React.FC<ConfigurationEditorProps> = ({
  solar,
  financial,
  onUpdateSolar,
  onUpdateFinancial,
  onResetDefaults,
}) => {
  const { t, formatCurrency } = useLanguage();
  const capacityPresets = [3.3, 5.5, 6.6, 9.9, 13.2];

  const handleCapacityChange = (val: number) => {
    const panels = Math.round((val * 1000) / solar.panelWattage);
    const estCost = Math.round(val * 33333);
    onUpdateSolar({ systemCapacityKwp: Number(val.toFixed(2)), panelCount: panels });
    onUpdateFinancial({ installationCostThb: estCost });
  };

  return (
    <div className="bg-[#112239] rounded-xl p-5 border border-[#1B3252]">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#1B3252]">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-[#27D3BC]" />
          <h3 className="text-sm font-semibold text-white tracking-wide">
            {t('configTitle')}
          </h3>
          <DemoBadge label={t('configurable')} variant="demo" />
        </div>
        <button
          onClick={onResetDefaults}
          className="flex items-center gap-1.5 text-xs text-[#8FA3BF] hover:text-[#27D3BC] transition-colors"
          title="Reset to default benchmark values"
        >
          <RotateCcw className="w-3 h-3" />
          <span>{t('configReset')}</span>
        </button>
      </div>

      <p className="text-xs text-[#8FA3BF] mt-2 mb-4">
        {t('configSubtitle')}
      </p>

      {/* Quick Capacity Presets */}
      <div className="mb-5">
        <label className="text-xs font-semibold text-[#8FA3BF] mb-2 block">
          {t('configPresetsLabel')}
        </label>
        <div className="flex flex-wrap gap-2">
          {capacityPresets.map((preset) => (
            <button
              key={preset}
              onClick={() => handleCapacityChange(preset)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                Math.abs(solar.systemCapacityKwp - preset) < 0.1
                  ? 'bg-[#27D3BC] text-[#091526] font-bold shadow-sm shadow-[#27D3BC]/20'
                  : 'bg-[#091526] text-[#8FA3BF] hover:text-white border border-[#1B3252] hover:border-[#27D3BC]/40'
              }`}
            >
              {preset} kWp
            </button>
          ))}
        </div>
      </div>

      {/* Input Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        {/* System Capacity (kWp) */}
        <div className="bg-[#091526] p-3.5 rounded-lg border border-[#1B3252]">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-semibold text-white flex items-center gap-1">
              {t('configCapacity')}
              <span className="text-[#8FA3BF] font-normal">(kWp)</span>
            </span>
            <span className="font-mono text-sm font-bold text-[#27D3BC]">
              {solar.systemCapacityKwp.toFixed(1)} kWp
            </span>
          </div>
          <input
            type="range"
            min="1.0"
            max="25.0"
            step="0.5"
            value={solar.systemCapacityKwp}
            onChange={(e) => handleCapacityChange(parseFloat(e.target.value))}
            className="w-full accent-[#27D3BC] cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-[#64748B] mt-1">
            <span>1.0 kWp</span>
            <span>{t('configCapacitySub', { count: solar.panelCount })}</span>
            <span>25.0 kWp</span>
          </div>
        </div>

        {/* Installation Cost (THB) */}
        <div className="bg-[#091526] p-3.5 rounded-lg border border-[#1B3252]">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-semibold text-white flex items-center gap-1">
              {t('configInstallCost')}
              <span className="text-[#8FA3BF] font-normal">(THB)</span>
            </span>
            <span className="font-mono text-sm font-bold text-white">
              {formatCurrency(financial.installationCostThb)}
            </span>
          </div>
          <input
            type="number"
            min="20000"
            max="1500000"
            step="5000"
            value={financial.installationCostThb}
            onChange={(e) =>
              onUpdateFinancial({ installationCostThb: Math.max(0, parseInt(e.target.value) || 0) })
            }
            className="w-full bg-[#112239] border border-[#1B3252] rounded px-2.5 py-1 text-white font-mono text-xs focus:outline-none focus:border-[#27D3BC]"
          />
          <div className="text-[10px] text-[#64748B] mt-1 flex justify-between">
            <span>{t('configUnitCost')}</span>
            <span className="text-[#8FA3BF]">
              ~{formatCurrency(Math.round(financial.installationCostThb / Math.max(0.1, solar.systemCapacityKwp)))} / kWp
            </span>
          </div>
        </div>

        {/* Electricity Tariff (THB/kWh) */}
        <div className="bg-[#091526] p-3.5 rounded-lg border border-[#1B3252]">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-semibold text-white flex items-center gap-1">
              {t('configTariff')}
              <span className="text-[#8FA3BF] font-normal">(THB / kWh)</span>
            </span>
            <span className="font-mono text-sm font-bold text-emerald-400">
              ฿{financial.electricityTariffThb.toFixed(2)}
            </span>
          </div>
          <input
            type="range"
            min="3.00"
            max="7.50"
            step="0.05"
            value={financial.electricityTariffThb}
            onChange={(e) =>
              onUpdateFinancial({ electricityTariffThb: parseFloat(e.target.value) })
            }
            className="w-full accent-[#27D3BC] cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-[#64748B] mt-1">
            <span>{t('configTariffBase')}</span>
            <span>{t('configTariffMea')}</span>
            <span>{t('configTariffTou')}</span>
          </div>
        </div>

        {/* Self-Consumption Percentage (%) */}
        <div className="bg-[#091526] p-3.5 rounded-lg border border-[#1B3252]">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-semibold text-white flex items-center gap-1">
              {t('configSelfConsumption')}
              <span className="text-[#8FA3BF] font-normal">(%)</span>
            </span>
            <span className="font-mono text-sm font-bold text-[#27D3BC]">
              {financial.selfConsumptionPercent}%
            </span>
          </div>
          <input
            type="range"
            min="20"
            max="100"
            step="5"
            value={financial.selfConsumptionPercent}
            onChange={(e) =>
              onUpdateFinancial({ selfConsumptionPercent: parseInt(e.target.value) })
            }
            className="w-full accent-[#27D3BC] cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-[#64748B] mt-1">
            <span>{t('configSelfConsLow')}</span>
            <span>{t('configSelfConsMid')}</span>
            <span>{t('configSelfConsHigh')}</span>
          </div>
        </div>

        {/* Performance Ratio (PR) */}
        <div className="bg-[#091526] p-3.5 rounded-lg border border-[#1B3252] md:col-span-2">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1">
              <span className="font-semibold text-white">{t('configPr')}</span>
              <span title={t('configPrTooltip')}>
                <HelpCircle className="w-3 h-3 text-[#64748B] cursor-help" />
              </span>
            </div>
            <span className="font-mono text-sm font-bold text-white">
              {(solar.performanceRatio * 100).toFixed(0)}%
            </span>
          </div>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="0.65"
              max="0.88"
              step="0.01"
              value={solar.performanceRatio}
              onChange={(e) =>
                onUpdateSolar({ performanceRatio: parseFloat(e.target.value) })
              }
              className="w-full accent-[#27D3BC] cursor-pointer"
            />
            <div className="flex gap-1 shrink-0">
              {[0.75, 0.80, 0.85].map((pr) => (
                <button
                  key={pr}
                  onClick={() => onUpdateSolar({ performanceRatio: pr })}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                    Math.abs(solar.performanceRatio - pr) < 0.005
                      ? 'bg-[#27D3BC] text-[#091526] font-bold'
                      : 'bg-[#112239] text-[#8FA3BF] hover:text-white border border-[#1B3252]'
                  }`}
                >
                  {(pr * 100)}%
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
