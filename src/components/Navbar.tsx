import React, { useState } from 'react';
import {
  Sun,
  LayoutDashboard,
  MapPin,
  Box,
  FileText,
  Menu,
  X,
  Zap,
  TrendingUp,
  Languages,
} from 'lucide-react';
import { DemoBadge } from './Common/DemoBadge';
import { LocationPreset, SolarConfig, SolarCalculationResult } from '../types/solar';
import { useLanguage } from '../i18n/LanguageContext';

export type NavTab = 'dashboard' | 'location' | 'studio' | 'report';

interface NavbarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  location: LocationPreset;
  solar: SolarConfig;
  metrics: SolarCalculationResult;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  location,
  solar,
  metrics,
}) => {
  const { language, setLanguage, t, formatCurrency } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard' as NavTab, label: t('navDashboard'), icon: LayoutDashboard },
    { id: 'location' as NavTab, label: t('navLocation'), icon: MapPin },
    { id: 'studio' as NavTab, label: t('navStudio'), icon: Box },
    { id: 'report' as NavTab, label: t('navReport'), icon: FileText },
  ];

  const handleTabClick = (tab: NavTab) => {
    onSelectTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#091526]/95 border-b border-[#1B3252] backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-[#27D3BC]/15 border border-[#27D3BC]/30 text-[#27D3BC]">
              <Sun className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base sm:text-lg tracking-tight text-white">
                  {t('brandTitle')}<span className="text-[#27D3BC]">{t('brandAi')}</span>
                </span>
                <span className="hidden sm:inline-block text-[11px] font-medium text-[#8FA3BF] border-l border-[#1B3252] pl-2">
                  {t('bySmartFlora')}
                </span>
              </div>
              <p className="text-[10px] text-[#8FA3BF] hidden sm:block">
                {t('brandTagline')}
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 bg-[#112239] p-1 rounded-lg border border-[#1B3252]">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-[#27D3BC] text-[#091526] font-semibold shadow-sm shadow-[#27D3BC]/20'
                      : 'text-[#8FA3BF] hover:text-white hover:bg-[#1A3150]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Quick Metrics, Language Switch & Demo Tag */}
          <div className="hidden lg:flex items-center gap-3">
            <div className="flex items-center gap-3 bg-[#112239]/80 px-3 py-1.5 rounded-lg border border-[#1B3252] text-xs">
              <div className="flex items-center gap-1.5 text-[#8FA3BF]">
                <MapPin className="w-3 h-3 text-[#27D3BC]" />
                <span className="text-white font-medium">{location.province}</span>
              </div>
              <div className="w-px h-3 bg-[#1B3252]" />
              <div className="flex items-center gap-1.5 text-[#8FA3BF]">
                <Zap className="w-3 h-3 text-amber-400" />
                <span className="text-white font-medium">{solar.systemCapacityKwp} kWp</span>
              </div>
              <div className="w-px h-3 bg-[#1B3252]" />
              <div className="flex items-center gap-1.5 text-[#8FA3BF]">
                <TrendingUp className="w-3 h-3 text-[#27D3BC]" />
                <span className="text-[#27D3BC] font-semibold">
                  {formatCurrency(metrics.annualSavingsThb)}{t('perYearShort')}
                </span>
              </div>
            </div>

            {/* Language Switch Toggle (Task 2) */}
            <div className="flex items-center bg-[#112239] p-0.5 rounded-lg border border-[#1B3252] text-xs">
              <button
                onClick={() => setLanguage('en')}
                className={`px-2 py-1 rounded text-xs font-semibold transition-all ${
                  language === 'en'
                    ? 'bg-[#27D3BC] text-[#091526] shadow-sm'
                    : 'text-[#8FA3BF] hover:text-white'
                }`}
                title="Switch to English"
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('th')}
                className={`px-2 py-1 rounded text-xs font-semibold transition-all ${
                  language === 'th'
                    ? 'bg-[#27D3BC] text-[#091526] shadow-sm'
                    : 'text-[#8FA3BF] hover:text-white'
                }`}
                title="เปลี่ยนเป็นภาษาไทย"
              >
                ไทย
              </button>
            </div>

            <DemoBadge label={t('demoBadge')} variant="demo" />
          </div>

          {/* Mobile Right Controls: Language Switch + Hamburger */}
          <div className="flex items-center gap-2 md:hidden">
            {/* Mobile Language Toggle */}
            <div className="flex items-center bg-[#112239] p-0.5 rounded-lg border border-[#1B3252] text-xs">
              <button
                onClick={() => setLanguage('en')}
                className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${
                  language === 'en'
                    ? 'bg-[#27D3BC] text-[#091526]'
                    : 'text-[#8FA3BF]'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('th')}
                className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${
                  language === 'th'
                    ? 'bg-[#27D3BC] text-[#091526]'
                    : 'text-[#8FA3BF]'
                }`}
              >
                ไทย
              </button>
            </div>

            <DemoBadge label={t('demoBadge')} variant="demo" />

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-[#112239] text-[#8FA3BF] hover:text-white border border-[#1B3252]"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#1B3252] bg-[#0D1C30] px-4 pt-3 pb-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#27D3BC] text-[#091526] font-semibold'
                    : 'text-[#8FA3BF] hover:text-white hover:bg-[#112239]'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
          <div className="pt-3 border-t border-[#1B3252] flex flex-wrap gap-2 text-xs text-[#8FA3BF]">
            <span className="bg-[#112239] px-2.5 py-1 rounded border border-[#1B3252] text-white">
              📍 {location.name}
            </span>
            <span className="bg-[#112239] px-2.5 py-1 rounded border border-[#1B3252] text-white">
              ⚡ {solar.systemCapacityKwp} kWp
            </span>
            <span className="bg-[#112239] px-2.5 py-1 rounded border border-[#1B3252] text-[#27D3BC]">
              💰 {formatCurrency(metrics.annualSavingsThb)}{t('perYearShort')}
            </span>
          </div>
        </div>
      )}
    </header>
  );
};
