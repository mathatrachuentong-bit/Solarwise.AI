/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { Navbar, NavTab } from './components/Navbar';
import { SolarDashboard } from './components/Dashboard/SolarDashboard';
import { Solar3DStudio } from './components/Studio3D/Solar3DStudio';
import { LocationPhotos } from './components/LocationPhotos/LocationPhotos';
import { AnalysisReport } from './components/AnalysisReport/AnalysisReport';
import {
  LocationPreset,
  BuildingConfig,
  SolarConfig,
  FinancialConfig,
  ObstructionConfig,
  SitePhoto,
} from './types/solar';
import {
  THAILAND_LOCATIONS,
  DEFAULT_BUILDING,
  DEFAULT_SOLAR,
  DEFAULT_FINANCIAL,
  DEFAULT_SITE_PHOTOS,
  calculateSolarMetrics,
} from './utils/solarCalculations';
import { LanguageProvider, useLanguage } from './i18n/LanguageContext';

function SolarWiseApp() {
  const { t } = useLanguage();
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [quotaExceeded, setQuotaExceeded] = useState(false);

  useEffect(() => {
    const handleQuota = () => setQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', handleQuota);
    return () => window.removeEventListener('gmp-quota-exceeded', handleQuota);
  }, []);

  // Shared Application State
  const [location, setLocation] = useState<LocationPreset>(THAILAND_LOCATIONS[0]); // Bangkok
  const [building, setBuilding] = useState<BuildingConfig>(DEFAULT_BUILDING);
  const [solar, setSolar] = useState<SolarConfig>(DEFAULT_SOLAR);
  const [financial, setFinancial] = useState<FinancialConfig>(DEFAULT_FINANCIAL);
  const [obstruction, setObstruction] = useState<ObstructionConfig>({
    enabled: true,
    type: 'tree',
    distanceX: 9,
    distanceZ: -4,
    height: 8.5,
    width: 4,
  });
  const [photos, setPhotos] = useState<SitePhoto[]>(DEFAULT_SITE_PHOTOS);

  // Deterministic Solar & Financial Calculations (Live sync with inputs)
  const metrics = useMemo(() => {
    return calculateSolarMetrics(location, solar, financial);
  }, [location, solar, financial]);

  // State Update Handlers
  const handleUpdateBuilding = (partial: Partial<BuildingConfig>) => {
    setBuilding((prev) => ({ ...prev, ...partial }));
  };

  const handleUpdateSolar = (partial: Partial<SolarConfig>) => {
    setSolar((prev) => ({ ...prev, ...partial }));
  };

  const handleUpdateFinancial = (partial: Partial<FinancialConfig>) => {
    setFinancial((prev) => ({ ...prev, ...partial }));
  };

  const handleUpdateObstruction = (partial: Partial<ObstructionConfig>) => {
    setObstruction((prev) => ({ ...prev, ...partial }));
  };

  const handleSelectLocation = (newLoc: LocationPreset) => {
    setLocation(newLoc);
  };

  const handleUpdateCoords = (lat: number, lng: number, placeName?: string) => {
    setLocation((prev) => ({
      ...prev,
      lat,
      lng,
      name: placeName || `Custom (${lat.toFixed(3)}°N, ${lng.toFixed(3)}°E)`,
    }));
  };

  const handleAddPhoto = (photo: SitePhoto) => {
    setPhotos((prev) => [photo, ...prev]);
  };

  const handleRemovePhoto = (id: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  };

  const handleResetDefaults = () => {
    setBuilding(DEFAULT_BUILDING);
    setSolar(DEFAULT_SOLAR);
    setFinancial(DEFAULT_FINANCIAL);
  };

  return (
    <div className="min-h-screen bg-[#091526] text-white flex flex-col font-sans selection:bg-[#27D3BC]/30 selection:text-white">
      {/* Google Maps Demo Quota Notification Banner */}
      {quotaExceeded && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm flex items-center justify-between">
          <div className="flex-1 text-center">
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </div>
          <button
            onClick={() => setQuotaExceeded(false)}
            className="text-amber-700 hover:text-amber-900 ml-2 font-bold text-xs"
            title="Dismiss"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Fixed / Sticky Navigation Bar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        location={location}
        solar={solar}
        metrics={metrics}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {currentTab === 'dashboard' && (
          <SolarDashboard
            location={location}
            building={building}
            solar={solar}
            financial={financial}
            metrics={metrics}
            onUpdateSolar={handleUpdateSolar}
            onUpdateFinancial={handleUpdateFinancial}
            onResetDefaults={handleResetDefaults}
            onNavigateToStudio={() => setCurrentTab('studio')}
            onNavigateToPhotos={() => setCurrentTab('location')}
          />
        )}

        {currentTab === 'location' && (
          <LocationPhotos
            currentLocation={location}
            onSelectLocation={handleSelectLocation}
            onUpdateCoords={handleUpdateCoords}
            building={building}
            onUpdateBuilding={handleUpdateBuilding}
            photos={photos}
            onAddPhoto={handleAddPhoto}
            onRemovePhoto={handleRemovePhoto}
          />
        )}

        {currentTab === 'studio' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#112239] p-4 rounded-xl border border-[#1B3252]">
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                  <span>{t('studioTitle')}</span>
                  <span className="text-xs font-normal text-[#27D3BC] bg-[#27D3BC]/10 px-2 py-0.5 rounded border border-[#27D3BC]/20">
                    {t('studioTag')}
                  </span>
                </h2>
                <p className="text-xs text-[#8FA3BF] mt-0.5">
                  {t('studioInstruction')}
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  onClick={() => setCurrentTab('dashboard')}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#8FA3BF] hover:text-white bg-[#091526] border border-[#1B3252]"
                >
                  {t('studioReturnDash')}
                </button>
                <button
                  onClick={() => setCurrentTab('report')}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#27D3BC] text-[#091526] hover:bg-[#20bfa9]"
                >
                  {t('studioGenerateReport')}
                </button>
              </div>
            </div>

            <Solar3DStudio
              location={location}
              building={building}
              solar={solar}
              obstruction={obstruction}
              onUpdateBuilding={handleUpdateBuilding}
              onUpdateSolar={handleUpdateSolar}
              onUpdateObstruction={handleUpdateObstruction}
            />
          </div>
        )}

        {currentTab === 'report' && (
          <AnalysisReport
            location={location}
            building={building}
            solar={solar}
            financial={financial}
            metrics={metrics}
          />
        )}
      </main>

      {/* Global Footer */}
      <footer className="border-t border-[#1B3252] bg-[#0A1628] py-6 text-xs text-[#8FA3BF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white">SolarWise AI</span>
            <span>•</span>
            <span>Startup Smart Flora</span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline text-[#64748B]">
              Deterministic Clean Energy Sizing Engine
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span className="text-[#64748B]">{t('footerDisclaimer')}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#27D3BC]" />
            <span className="text-emerald-400">{t('footerMilestone')}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <SolarWiseApp />
    </LanguageProvider>
  );
}
