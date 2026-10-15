import React from 'react';
import {
  Zap,
  TrendingUp,
  Clock,
  Leaf,
  ShieldCheck,
  Sun,
  MapPin,
  Flame,
} from 'lucide-react';
import {
  LocationPreset,
  BuildingConfig,
  SolarConfig,
  FinancialConfig,
  SolarCalculationResult,
} from '../../types/solar';
import { MetricCard } from './MetricCard';
import { MonthlyChart } from './MonthlyChart';
import { ConfigurationEditor } from './ConfigurationEditor';
import { ScenarioComparison } from './ScenarioComparison';
import { DemoBadge } from '../Common/DemoBadge';
import { useLanguage } from '../../i18n/LanguageContext';

interface SolarDashboardProps {
  location: LocationPreset;
  building: BuildingConfig;
  solar: SolarConfig;
  financial: FinancialConfig;
  metrics: SolarCalculationResult;
  onUpdateSolar: (solar: Partial<SolarConfig>) => void;
  onUpdateFinancial: (fin: Partial<FinancialConfig>) => void;
  onResetDefaults: () => void;
  onNavigateToStudio: () => void;
  onNavigateToPhotos: () => void;
}

export const SolarDashboard: React.FC<SolarDashboardProps> = ({
  location,
  solar,
  financial,
  metrics,
  onUpdateSolar,
  onUpdateFinancial,
  onResetDefaults,
  onNavigateToStudio,
  onNavigateToPhotos,
}) => {
  const { t, formatCurrency, formatNumber } = useLanguage();

  return (
    <div className="space-y-6">
      {/* Top Banner / Site Summary Bar */}
      <div className="bg-[#112239] rounded-xl p-4 sm:p-5 border border-[#1B3252] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {t('dashTitle')}
            </h1>
            <DemoBadge label={t('dashSimulationBadge')} variant="demo" />
            <DemoBadge label={t('dashAssumedRoofBadge')} variant="assumed" />
          </div>
          <p className="text-xs text-[#8FA3BF] mt-1 flex items-center gap-2 flex-wrap">
            <span>{t('dashSiteLabel')}: <strong className="text-white">{location.name}</strong> ({location.province})</span>
            <span className="text-[#1B3252]">•</span>
            <span>{t('dashSolarWindow')}: <strong className="text-[#27D3BC]">{location.avgDailyIrradiation} kWh/m²/day</strong></span>
            <span className="text-[#1B3252]">•</span>
            <span>{t('dashArrayLabel')}: <strong className="text-white">{solar.systemCapacityKwp} kWp</strong> ({solar.panelCount} × 550W)</span>
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onNavigateToPhotos}
            className="px-3 py-2 rounded-lg text-xs font-medium bg-[#091526] hover:bg-[#1A3150] text-[#8FA3BF] hover:text-white border border-[#1B3252] flex items-center gap-1.5 transition-colors"
          >
            <MapPin className="w-3.5 h-3.5 text-[#27D3BC]" />
            {t('btnSitePhotos')}
          </button>
          <button
            onClick={onNavigateToStudio}
            className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-[#27D3BC] hover:bg-[#20bfa9] text-[#091526] shadow-sm shadow-[#27D3BC]/20 flex items-center gap-1.5 transition-colors"
          >
            <Sun className="w-3.5 h-3.5" />
            {t('btnLaunchStudio')}
          </button>
        </div>
      </div>

      {/* 4 Core Required Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title={t('kpiAnnualProd')}
          value={formatNumber(metrics.annualProductionKwh)}
          unit={t('kpiAnnualProdUnit')}
          subtitle={`${t('kpiDailyAvg')}: ${(metrics.annualProductionKwh / 365).toFixed(1)} kWh/day`}
          badge={t('kpiCleanEnergy')}
          icon={Zap}
          iconColor="text-amber-400"
          highlight
        />

        <MetricCard
          title={t('kpiAnnualSavings')}
          value={formatCurrency(metrics.annualSavingsThb)}
          subtitle={`${t('kpiMonthlyAvg')}: ${formatCurrency(metrics.annualSavingsThb / 12)}`}
          badge={`${t('kpiAtTariff')} ฿${financial.electricityTariffThb.toFixed(2)}/kWh`}
          icon={TrendingUp}
          iconColor="text-[#27D3BC]"
          highlight
        />

        <MetricCard
          title={t('kpiSelfConsumed')}
          value={formatNumber(metrics.annualSelfConsumedKwh)}
          unit="kWh"
          subtitle={`${financial.selfConsumptionPercent}% ${t('kpiSelfConsumedSub')}`}
          badge={t('kpiOnsiteValue')}
          icon={Flame}
          iconColor="text-cyan-400"
        />

        <MetricCard
          title={t('kpiPayback')}
          value={metrics.simplePaybackYears > 0 ? `${metrics.simplePaybackYears}` : 'N/A'}
          unit={metrics.simplePaybackYears > 0 ? t('kpiYears') : ''}
          subtitle={`${t('kpiInvestment')}: ${formatCurrency(financial.installationCostThb)}`}
          badge={metrics.simplePaybackYears <= 5 ? t('kpiExcellentRoi') : t('kpiHealthyRoi')}
          icon={Clock}
          iconColor="text-emerald-400"
        />
      </div>

      {/* Environmental & Lifetime Secondary Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#0E1E34] p-4 rounded-xl border border-[#1B3252] text-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-[#091526] border border-[#1B3252] text-emerald-400">
            <Leaf className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[#8FA3BF] block text-[11px]">{t('ribbonCo2')}</span>
            <span className="font-mono text-base font-bold text-white">
              {metrics.co2OffsetTonsPerYear} {t('ribbonCo2Tons')}
            </span>
            <span className="text-[#64748B] block text-[10px]">
              {t('ribbonCo2Trees', { count: metrics.equivalentTreesPlanted })}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:border-l sm:border-[#1B3252] sm:pl-4">
          <div className="p-2.5 rounded-lg bg-[#091526] border border-[#1B3252] text-[#27D3BC]">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[#8FA3BF] block text-[11px]">{t('ribbonLifetime')}</span>
            <span className="font-mono text-base font-bold text-[#27D3BC]">
              {formatCurrency(metrics.lifetimeSavingsThb)}
            </span>
            <span className="text-[#64748B] block text-[10px]">
              {t('ribbonLifetimeSub')}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:border-l sm:border-[#1B3252] sm:pl-4">
          <div className="p-2.5 rounded-lg bg-[#091526] border border-[#1B3252] text-blue-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[#8FA3BF] block text-[11px]">{t('ribbonGridSurplus')}</span>
            <span className="font-mono text-base font-bold text-white">
              {formatNumber(metrics.annualGridFeedInKwh)} kWh/yr
            </span>
            <span className="text-[#64748B] block text-[10px]">
              {t('ribbonGridSub')}
            </span>
          </div>
        </div>
      </div>

      {/* Monthly Production Chart */}
      <MonthlyChart
        data={metrics.monthlyBreakdown}
        tariff={financial.electricityTariffThb}
      />

      {/* Editable Inputs & Scenario Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-12">
          <ConfigurationEditor
            solar={solar}
            financial={financial}
            onUpdateSolar={onUpdateSolar}
            onUpdateFinancial={onUpdateFinancial}
            onResetDefaults={onResetDefaults}
          />
        </div>
      </div>

      {/* Scenario Comparison Grid */}
      <ScenarioComparison
        scenarios={metrics.scenarioComparisons}
        onSelectCapacity={(cap) => {
          const panels = Math.round((cap * 1000) / solar.panelWattage);
          const estCost = Math.round(cap * 33333);
          onUpdateSolar({ systemCapacityKwp: cap, panelCount: panels });
          onUpdateFinancial({ installationCostThb: estCost });
        }}
      />
    </div>
  );
};
