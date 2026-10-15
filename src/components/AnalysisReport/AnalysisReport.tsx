import React, { useRef, useState, useMemo } from 'react';
import {
  Printer,
  Download,
  CheckCircle,
  Lightbulb,
  Building2,
  Calendar,
  Sun,
  Coins,
  ShieldAlert,
  MessageSquareQuote,
  Copy,
  Check,
  Sparkles,
} from 'lucide-react';
import {
  LocationPreset,
  BuildingConfig,
  SolarConfig,
  FinancialConfig,
  SolarCalculationResult,
} from '../../types/solar';
import { DemoBadge } from '../Common/DemoBadge';
import { useLanguage } from '../../i18n/LanguageContext';
import { generateConsultantSummaryText } from '../../utils/consultantSummary';

interface AnalysisReportProps {
  location: LocationPreset;
  building: BuildingConfig;
  solar: SolarConfig;
  financial: FinancialConfig;
  metrics: SolarCalculationResult;
}

const THAI_MONTH_NAMES = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม',
];

export const AnalysisReport: React.FC<AnalysisReportProps> = ({
  location,
  building,
  solar,
  financial,
  metrics,
}) => {
  const { language, t, formatCurrency, formatNumber } = useLanguage();
  const reportRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  // Generate pure, clean customer-friendly consultant spoken text
  // Reusable for future ElevenLabs text-to-speech integration
  const consultantSpeechText = useMemo(() => {
    return generateConsultantSummaryText({
      location,
      building,
      solar,
      financial,
      metrics,
      language,
    });
  }, [location, building, solar, financial, metrics, language]);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyScript = () => {
    navigator.clipboard.writeText(consultantSpeechText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadCsv = () => {
    const headers = [
      language === 'th' ? 'เดือน' : 'Month',
      language === 'th' ? 'จำนวนวัน' : 'Days',
      language === 'th' ? 'ความเข้มแสงอาทิตย์ (kWh/m2/day)' : 'Daily Solar Irradiation (kWh/m2/day)',
      language === 'th' ? 'ความเข้มแสงรวม (kWh/m2)' : 'Total Solar Irradiation (kWh/m2)',
      language === 'th' ? 'ผลิตไฟฟ้าโดยประมาณ (kWh)' : 'Estimated Generation (kWh)',
      language === 'th' ? 'ใช้เองในบ้าน (kWh)' : 'Self-Consumed Solar (kWh)',
      language === 'th' ? 'ไฟฟ้าส่วนเกิน (kWh)' : 'Grid Feed-In Surplus (kWh)',
      language === 'th' ? 'ประหยัดค่าไฟ (THB)' : 'Estimated Savings (THB)',
    ];

    const rows = metrics.monthlyBreakdown.map((m, idx) => [
      language === 'th' ? THAI_MONTH_NAMES[idx] : m.monthName,
      m.days,
      m.dailyIrradiation,
      m.totalIrradiation,
      m.productionKwh,
      m.selfConsumedKwh,
      m.gridFeedInKwh,
      m.savingsThb,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `SolarWise_Report_${location.province}_${solar.systemCapacityKwp}kWp_${language.toUpperCase()}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="bg-[#112239] rounded-xl p-5 border border-[#1B3252] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-xl font-bold text-white tracking-tight">
              {t('reportTitle')}
            </h2>
            <DemoBadge label={t('reportPrelimBadge')} variant="demo" />
          </div>
          <p className="text-xs text-[#8FA3BF] mt-1">
            {t('reportSubtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadCsv}
            className="px-3.5 py-2 rounded-lg text-xs font-medium bg-[#091526] hover:bg-[#1A3150] text-[#8FA3BF] hover:text-white border border-[#1B3252] flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-[#27D3BC]" />
            {t('reportExportCsv')}
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#27D3BC] hover:bg-[#20bfa9] text-[#091526] flex items-center gap-1.5 shadow-sm shadow-[#27D3BC]/20 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            {t('reportPrint')}
          </button>
        </div>
      </div>

      {/* Printable Report Document Body */}
      <div
        ref={reportRef}
        className="bg-[#112239] rounded-2xl p-6 sm:p-8 border border-[#1B3252] space-y-8"
      >
        {/* Document Header */}
        <div className="border-b border-[#1B3252] pb-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#27D3BC] uppercase tracking-wider">
                Smart Flora Energy Systems
              </span>
              <span className="text-[#1B3252]">•</span>
              <span className="text-xs text-[#8FA3BF]">SolarWise AI Studio</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              {t('reportDocTitle')}
            </h1>
            <p className="text-xs text-[#8FA3BF] mt-1">
              {t('reportDocId')} SW-2026-{location.id.toUpperCase()}-{(solar.systemCapacityKwp * 10).toFixed(0)} • {t('reportDate')} {new Date().toLocaleDateString(language === 'th' ? 'th-TH' : 'en-GB')}
            </p>
          </div>

          <div className="bg-[#091526] p-3 rounded-xl border border-[#1B3252] text-right shrink-0">
            <span className="text-[10px] text-[#8FA3BF] uppercase font-mono block">
              {t('reportStatus')}
            </span>
            <span className="text-xs font-bold text-[#27D3BC] block">
              {t('reportMilestone')}
            </span>
            <span className="text-[10px] text-amber-400 block mt-0.5">
              {t('reportPrelimSite')}
            </span>
          </div>
        </div>

        {/* TASK 3: CUSTOMER-FRIENDLY SPOKEN SUMMARY (สรุปผลสำหรับอธิบายลูกค้า) */}
        <div className="bg-gradient-to-br from-[#0B1A2E] to-[#0E233C] rounded-2xl p-6 sm:p-7 border border-[#27D3BC]/40 shadow-xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1B3252]/80">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#27D3BC]/15 border border-[#27D3BC]/30 flex items-center justify-center text-[#27D3BC] shrink-0">
                <MessageSquareQuote className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                    {t('spokenSummarySectionTitle')}
                  </h2>
                  <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold text-[#27D3BC] bg-[#27D3BC]/10 border border-[#27D3BC]/20 px-2 py-0.5 rounded-full">
                    <Sparkles className="w-2.5 h-2.5" />
                    {t('spokenSummaryReadyVoice')}
                  </span>
                </div>
                <p className="text-xs text-[#8FA3BF] mt-0.5">
                  {t('spokenSummarySubtitle')}
                </p>
              </div>
            </div>

            <button
              onClick={handleCopyScript}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all self-start sm:self-auto shrink-0 ${
                copied
                  ? 'bg-emerald-500 text-[#091526] shadow-sm shadow-emerald-500/20'
                  : 'bg-[#112239] hover:bg-[#1E3758] text-[#27D3BC] border border-[#27D3BC]/30 hover:border-[#27D3BC]'
              }`}
              title="Copy script to clipboard for presentation or text-to-speech"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>{t('spokenSummaryCopied')}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>{t('spokenSummaryCopyBtn')}</span>
                </>
              )}
            </button>
          </div>

          {/* Formatted Spoken Paragraphs */}
          <div className="mt-4 space-y-3.5 text-xs sm:text-sm text-[#CBD5E1] leading-relaxed">
            {consultantSpeechText.split('\n\n').map((paragraph, pIdx) => (
              <p
                key={pIdx}
                className="bg-[#091526]/50 p-3.5 rounded-xl border border-[#1B3252]/50 text-justify"
              >
                {paragraph}
              </p>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-[#1B3252]/60 flex items-center justify-between text-[11px] text-[#8FA3BF]">
            <span className="flex items-center gap-1.5 text-[#27D3BC]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#27D3BC]" />
              {t('spokenSummaryConsultantVoice')} ({language.toUpperCase()})
            </span>
            <span className="text-[#64748B]">
              Smart Flora Solar Assessment Sizing Model
            </span>
          </div>
        </div>

        {/* Section 1: Executive Sizing & Financial Summary */}
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <Coins className="w-4 h-4 text-[#27D3BC]" />
            {t('sec1Title')}
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-[#091526] p-4 rounded-xl border border-[#1B3252]">
              <span className="text-[#8FA3BF] block text-[11px]">{t('kpiAnnualProd')}</span>
              <span className="text-xl sm:text-2xl font-bold font-mono text-white mt-1 block">
                {formatNumber(metrics.annualProductionKwh)}
              </span>
              <span className="text-[10px] text-[#27D3BC] font-medium">{t('kpiAnnualProdUnit')}</span>
            </div>

            <div className="bg-[#091526] p-4 rounded-xl border border-[#1B3252]">
              <span className="text-[#8FA3BF] block text-[11px]">{t('kpiAnnualSavings')}</span>
              <span className="text-xl sm:text-2xl font-bold font-mono text-emerald-400 mt-1 block">
                {formatCurrency(metrics.annualSavingsThb)}
              </span>
              <span className="text-[10px] text-[#8FA3BF]">@{financial.electricityTariffThb.toFixed(2)} THB/kWh</span>
            </div>

            <div className="bg-[#091526] p-4 rounded-xl border border-[#1B3252]">
              <span className="text-[#8FA3BF] block text-[11px]">{t('kpiPayback')}</span>
              <span className="text-xl sm:text-2xl font-bold font-mono text-amber-300 mt-1 block">
                {metrics.simplePaybackYears > 0 ? `${metrics.simplePaybackYears} ${t('kpiYears')}` : 'N/A'}
              </span>
              <span className="text-[10px] text-[#8FA3BF]">{t('kpiInvestment')}: {formatCurrency(financial.installationCostThb)}</span>
            </div>

            <div className="bg-[#091526] p-4 rounded-xl border border-[#1B3252]">
              <span className="text-[#8FA3BF] block text-[11px]">{t('ribbonLifetime')}</span>
              <span className="text-xl sm:text-2xl font-bold font-mono text-[#27D3BC] mt-1 block">
                {formatCurrency(metrics.lifetimeSavingsThb)}
              </span>
              <span className="text-[10px] text-[#64748B]">Degr. 0.5% | Esc. 2%</span>
            </div>
          </div>
        </div>

        {/* Section 2: Site & Architectural Baseline */}
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#27D3BC]" />
            {t('sec2Title')}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-[#091526] p-4 rounded-xl border border-[#1B3252] space-y-2.5">
              <div className="flex justify-between border-b border-[#1B3252]/60 pb-1.5">
                <span className="text-[#8FA3BF]">{language === 'th' ? 'ทำเลที่ตั้ง:' : 'Geographic Region:'}</span>
                <span className="text-white font-medium">{location.name}</span>
              </div>
              <div className="flex justify-between border-b border-[#1B3252]/60 pb-1.5">
                <span className="text-[#8FA3BF]">{language === 'th' ? 'พิกัดภูมิศาสตร์:' : 'Coordinates:'}</span>
                <span className="text-white font-mono">{location.lat.toFixed(4)}° N, {location.lng.toFixed(4)}° E</span>
              </div>
              <div className="flex justify-between border-b border-[#1B3252]/60 pb-1.5">
                <span className="text-[#8FA3BF]">{language === 'th' ? 'ค่าความเข้มแสงอาทิตย์เฉลี่ย:' : 'Solar Resource Benchmark:'}</span>
                <span className="text-[#27D3BC] font-mono">{location.avgDailyIrradiation} kWh/m²/day</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8FA3BF]">{language === 'th' ? 'เขตสภาพภูมิอากาศ:' : 'Climate Zone:'}</span>
                <span className="text-white">Tropical Savanna (Aw / Koppen)</span>
              </div>
            </div>

            <div className="bg-[#091526] p-4 rounded-xl border border-[#1B3252] space-y-2.5">
              <div className="flex justify-between border-b border-[#1B3252]/60 pb-1.5">
                <span className="text-[#8FA3BF]">{language === 'th' ? 'ขนาดอาคาร (โดยประมาณ):' : 'Building Footprint (Assumed):'}</span>
                <span className="text-white font-mono">{building.width}m × {building.length}m ({building.width * building.length} m²)</span>
              </div>
              <div className="flex justify-between border-b border-[#1B3252]/60 pb-1.5">
                <span className="text-[#8FA3BF]">{language === 'th' ? 'รูปทรงหลังคา:' : 'Roof Geometry:'}</span>
                <span className="text-white">{building.roofType === 'gable' ? (language === 'th' ? 'หลังคาทรงจั่ว' : 'Gable Roof') : (language === 'th' ? 'ดาดฟ้าเรียบ' : 'Flat Roof')}</span>
              </div>
              <div className="flex justify-between border-b border-[#1B3252]/60 pb-1.5">
                <span className="text-[#8FA3BF]">{language === 'th' ? 'ความชันและทิศทางหลังคา:' : 'Roof Pitch & Orientation:'}</span>
                <span className="text-white font-mono">{building.roofPitch}° Tilt, {building.roofAzimuth}° Azimuth (South)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8FA3BF]">{language === 'th' ? 'สถานะการตรวจวัด:' : 'Measurement Status:'}</span>
                <DemoBadge label={t('assumedBadge')} variant="assumed" />
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Technical PV Configuration */}
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <Sun className="w-4 h-4 text-[#27D3BC]" />
            {t('sec3Title')}
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-[#091526] p-3 rounded-lg border border-[#1B3252]">
              <span className="text-[#8FA3BF] block text-[10px]">{language === 'th' ? 'กำลังผลิตรวม (DC)' : 'TOTAL DC CAPACITY'}</span>
              <span className="text-base font-bold text-white font-mono mt-0.5 block">
                {solar.systemCapacityKwp} kWp
              </span>
            </div>
            <div className="bg-[#091526] p-3 rounded-lg border border-[#1B3252]">
              <span className="text-[#8FA3BF] block text-[10px]">{language === 'th' ? 'จำนวนแผงโซลาร์' : 'PV MODULE UNITS'}</span>
              <span className="text-base font-bold text-white font-mono mt-0.5 block">
                {solar.panelCount} × 550W
              </span>
            </div>
            <div className="bg-[#091526] p-3 rounded-lg border border-[#1B3252]">
              <span className="text-[#8FA3BF] block text-[10px]">{t('configPr')}</span>
              <span className="text-base font-bold text-[#27D3BC] font-mono mt-0.5 block">
                {(solar.performanceRatio * 100).toFixed(0)}% (0.{Math.round(solar.performanceRatio * 100)})
              </span>
            </div>
            <div className="bg-[#091526] p-3 rounded-lg border border-[#1B3252]">
              <span className="text-[#8FA3BF] block text-[10px]">{t('configSelfConsumption')}</span>
              <span className="text-base font-bold text-emerald-400 font-mono mt-0.5 block">
                {financial.selfConsumptionPercent}%
              </span>
            </div>
          </div>
        </div>

        {/* Section 4: Deterministic Monthly Breakdown Table */}
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#27D3BC]" />
            {t('sec4Title')}
          </h3>
          <p className="text-xs text-[#8FA3BF] mb-3">
            {language === 'th'
              ? 'คำนวณจากสูตรวิศวกรรม: กำลังผลิตรายเดือน (kWh) = กำลังติดตั้ง (kWp) × ความเข้มแสงรายวัน × จำนวนวัน × PR'
              : 'Calculated with formula: Monthly Production (kWh) = Capacity (kWp) × Daily Irradiation × Days × PR'}
          </p>

          <div className="overflow-x-auto rounded-xl border border-[#1B3252]">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#091526] text-[#8FA3BF] uppercase text-[10px] border-b border-[#1B3252]">
                <tr>
                  <th className="py-2.5 px-3">{language === 'th' ? 'เดือน' : 'Month'}</th>
                  <th className="py-2.5 px-3">{language === 'th' ? 'จำนวนวัน' : 'Days'}</th>
                  <th className="py-2.5 px-3">{language === 'th' ? 'แสงแดด (kWh/m²/d)' : 'Irradiation (kWh/m²/d)'}</th>
                  <th className="py-2.5 px-3 text-right">{language === 'th' ? 'ผลิตไฟฟ้า (kWh)' : 'Production (kWh)'}</th>
                  <th className="py-2.5 px-3 text-right">{language === 'th' ? 'ใช้เอง (kWh)' : 'Self-Consumed (kWh)'}</th>
                  <th className="py-2.5 px-3 text-right">{language === 'th' ? 'ส่วนเกิน (kWh)' : 'Surplus (kWh)'}</th>
                  <th className="py-2.5 px-3 text-right text-[#27D3BC]">{language === 'th' ? 'ประหยัดเงิน (THB)' : 'Savings (THB)'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1B3252]/60">
                {metrics.monthlyBreakdown.map((row, idx) => (
                  <tr key={row.monthName} className="hover:bg-[#0E1E34] transition-colors">
                    <td className="py-2 px-3 text-white font-sans font-semibold">
                      {language === 'th' ? THAI_MONTH_NAMES[idx] : row.monthName}
                    </td>
                    <td className="py-2 px-3 text-[#8FA3BF]">{row.days}</td>
                    <td className="py-2 px-3 text-amber-300">{row.dailyIrradiation}</td>
                    <td className="py-2 px-3 text-right text-white font-bold">{formatNumber(row.productionKwh)}</td>
                    <td className="py-2 px-3 text-right text-emerald-400">{formatNumber(row.selfConsumedKwh)}</td>
                    <td className="py-2 px-3 text-right text-sky-400">{formatNumber(row.gridFeedInKwh)}</td>
                    <td className="py-2 px-3 text-right text-[#27D3BC] font-bold">{formatCurrency(row.savingsThb)}</td>
                  </tr>
                ))}
                {/* Total Row */}
                <tr className="bg-[#091526] font-bold border-t-2 border-[#1B3252]">
                  <td className="py-3 px-3 text-white font-sans">{language === 'th' ? 'รวมทั้งปี' : 'ANNUAL TOTAL'}</td>
                  <td className="py-3 px-3 text-[#8FA3BF]">365</td>
                  <td className="py-3 px-3 text-amber-300">{location.avgDailyIrradiation} {language === 'th' ? 'เฉลี่ย' : 'avg'}</td>
                  <td className="py-3 px-3 text-right text-white">{formatNumber(metrics.annualProductionKwh)}</td>
                  <td className="py-3 px-3 text-right text-emerald-400">{formatNumber(metrics.annualSelfConsumedKwh)}</td>
                  <td className="py-3 px-3 text-right text-sky-400">{formatNumber(metrics.annualGridFeedInKwh)}</td>
                  <td className="py-3 px-3 text-right text-[#27D3BC]">{formatCurrency(metrics.annualSavingsThb)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 5: Preliminary Recommendations */}
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-[#27D3BC]" />
            {t('sec5Title')}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="bg-[#091526] p-4 rounded-xl border border-[#1B3252] space-y-1.5">
              <div className="flex items-center gap-1.5 text-[#27D3BC] font-bold">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>{t('recInverterTitle')}</span>
              </div>
              <p className="text-[#8FA3BF] leading-relaxed">
                {t('recInverterBody', { inverterKw: Math.round(solar.systemCapacityKwp * 0.85) })}
              </p>
            </div>

            <div className="bg-[#091526] p-4 rounded-xl border border-[#1B3252] space-y-1.5">
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>{t('recPitchTitle')}</span>
              </div>
              <p className="text-[#8FA3BF] leading-relaxed">
                {t('recPitchBody', { pitch: building.roofPitch })}
              </p>
            </div>

            <div className="bg-[#091526] p-4 rounded-xl border border-[#1B3252] space-y-1.5">
              <div className="flex items-center gap-1.5 text-amber-300 font-bold">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>{t('recBatteryTitle')}</span>
              </div>
              <p className="text-[#8FA3BF] leading-relaxed">
                {t('recBatteryBody', { surplus: formatNumber(metrics.annualGridFeedInKwh) })}
              </p>
            </div>
          </div>
        </div>

        {/* Section 6: Assumptions, Limitations & Non-Warranty Disclaimer */}
        <div className="bg-amber-500/5 rounded-xl p-5 border border-amber-500/20 text-xs text-[#8FA3BF] space-y-2">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wide">
            <ShieldAlert className="w-4 h-4" />
            <span>{t('sec6Title')}</span>
          </div>
          <p className="leading-relaxed">
            <strong>{t('disclaimerHeader')}</strong> {t('disclaimerBody')}
          </p>
          <ul className="list-disc list-inside space-y-1 text-[11px] text-[#8FA3BF]">
            <li><strong>{t('disclaimerItem1Title')}</strong> {t('disclaimerItem1Body', { name: location.name })}</li>
            <li><strong>{t('disclaimerItem2Title')}</strong> {t('disclaimerItem2Body', { w: building.width, l: building.length })}</li>
            <li><strong>{t('disclaimerItem3Title')}</strong> {t('disclaimerItem3Body', { tariff: financial.electricityTariffThb.toFixed(2) })}</li>
          </ul>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-[#1B3252] flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#64748B] gap-2">
          <span>{t('footerLeft')}</span>
          <span>{t('footerRight')}</span>
        </div>
      </div>
    </div>
  );
};
