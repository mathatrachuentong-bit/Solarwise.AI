import {
  LocationPreset,
  BuildingConfig,
  SolarConfig,
  FinancialConfig,
  SolarCalculationResult,
  MonthlyEnergyOutput,
  ScenarioResult,
  SitePhoto,
} from '../types/solar';

// Pre-defined Thailand locations with calibrated demonstration solar resource data (kWh/m²/day)
export const THAILAND_LOCATIONS: LocationPreset[] = [
  {
    id: 'bkk',
    name: 'Bangkok Metropolis',
    province: 'Bangkok',
    lat: 13.7563,
    lng: 100.5018,
    description: 'Central Plain - High commercial tariff, consistent annual solar window with monsoon dip in Aug-Oct.',
    avgDailyIrradiation: 5.12,
    // Jan - Dec demonstration solar irradiation (kWh/m²/day)
    monthlyIrradiation: [5.2, 5.6, 5.8, 5.9, 5.3, 4.7, 4.6, 4.5, 4.4, 4.9, 5.1, 5.0],
  },
  {
    id: 'cnx',
    name: 'Chiang Mai Valley',
    province: 'Chiang Mai',
    lat: 18.7883,
    lng: 98.9853,
    description: 'Northern Highlands - High dry season yield (Nov-Apr), seasonal haze in Mar-Apr and cool winter clarity.',
    avgDailyIrradiation: 5.25,
    monthlyIrradiation: [5.1, 5.7, 6.0, 5.9, 5.2, 4.6, 4.4, 4.3, 4.8, 5.2, 5.5, 5.3],
  },
  {
    id: 'hkt',
    name: 'Phuket Island',
    province: 'Phuket',
    lat: 7.8804,
    lng: 98.3923,
    description: 'Andaman Coast - Strong tropical sunshine with pronounced southwest monsoon clouds from June to October.',
    avgDailyIrradiation: 4.98,
    monthlyIrradiation: [5.4, 5.7, 5.8, 5.5, 4.7, 4.3, 4.2, 4.3, 4.1, 4.5, 4.9, 5.3],
  },
  {
    id: 'pty',
    name: 'Pattaya / Chonburi EEC',
    province: 'Chonburi',
    lat: 12.9276,
    lng: 100.8771,
    description: 'Eastern Seaboard - High industrial demand, coastal sun reflection and steady maritime breezes.',
    avgDailyIrradiation: 5.20,
    monthlyIrradiation: [5.3, 5.7, 5.9, 5.8, 5.2, 4.8, 4.7, 4.6, 4.5, 5.0, 5.3, 5.1],
  },
  {
    id: 'kkn',
    name: 'Khon Kaen Plateau',
    province: 'Khon Kaen',
    lat: 16.4322,
    lng: 102.8236,
    description: 'Northeastern Isan - High solar irradiance, lower cloud coverage during dry season and excellent land factor.',
    avgDailyIrradiation: 5.31,
    monthlyIrradiation: [5.4, 5.8, 6.1, 6.0, 5.3, 4.9, 4.8, 4.7, 4.9, 5.3, 5.5, 5.4],
  },
];

export const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

// Default configurations
export const DEFAULT_BUILDING: BuildingConfig = {
  width: 10, // 10 meters wide
  length: 12, // 12 meters deep
  wallHeight: 5.5, // 2-story modern residential
  roofType: 'gable',
  roofPitch: 22, // 22 degrees optimal for tropical rain runoff and solar tilt
  roofAzimuth: 180, // Facing South for maximum Northern hemisphere irradiation
  roofColor: '#2A3B50',
  wallColor: '#E2E8F0',
  isAssumed: true,
};

export const DEFAULT_SOLAR: SolarConfig = {
  systemCapacityKwp: 6.6, // 6.6 kWp (12 x 550W panels)
  panelCount: 12,
  panelWattage: 550,
  performanceRatio: 0.80, // 80% standard tropical PV performance ratio
  tiltAngle: 22,
  orientationAzimuth: 180, // South
};

export const DEFAULT_FINANCIAL: FinancialConfig = {
  installationCostThb: 220000, // 220,000 THB (~33,300 THB/kWp for Tier 1 equipment)
  electricityTariffThb: 4.70, // 4.70 THB/kWh (MEA/PEA residential rate)
  selfConsumptionPercent: 75, // 75% daytime self-consumption
  annualDegradation: 0.5, // 0.5% degradation
  tariffEscalation: 2.0, // 2.0% annual electricity price increase
  lifespanYears: 25,
};

// Procedural SVG site photos to avoid any broken image links
export const DEFAULT_SITE_PHOTOS: SitePhoto[] = [
  {
    id: 'demo-photo-1',
    name: 'Bangkok_Res_Aerial_Roof_Survey.png',
    type: 'roof',
    uploadedAt: '2026-10-12',
    isDemo: true,
    notes: 'Aerial drone survey showing clean south-facing pitched roof with minimal shade.',
    url: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="600" height="400" fill="%230F1F35"/><rect x="40" y="40" width="520" height="320" rx="8" fill="%231E3352" stroke="%2327D3BC" stroke-width="2" stroke-dasharray="6,4"/><polygon points="300,70 120,330 480,330" fill="%23263E63"/><line x1="300" y1="70" x2="300" y2="330" stroke="%233A5780" stroke-width="3"/><g fill="%2327D3BC" opacity="0.85"><rect x="180" y="210" width="45" height="28" rx="2" stroke="%23091526"/><rect x="235" y="210" width="45" height="28" rx="2" stroke="%23091526"/><rect x="180" y="245" width="45" height="28" rx="2" stroke="%23091526"/><rect x="235" y="245" width="45" height="28" rx="2" stroke="%23091526"/><rect x="180" y="280" width="45" height="28" rx="2" stroke="%23091526"/><rect x="235" y="280" width="45" height="28" rx="2" stroke="%23091526"/><rect x="320" y="210" width="45" height="28" rx="2" stroke="%23091526"/><rect x="375" y="210" width="45" height="28" rx="2" stroke="%23091526"/><rect x="320" y="245" width="45" height="28" rx="2" stroke="%23091526"/><rect x="375" y="245" width="45" height="28" rx="2" stroke="%23091526"/><rect x="320" y="280" width="45" height="28" rx="2" stroke="%23091526"/><rect x="375" y="280" width="45" height="28" rx="2" stroke="%23091526"/></g><text x="300" y="375" fill="%238FA3BF" font-family="sans-serif" font-size="13" text-anchor="middle">DEMO SATELLITE ROOF ORTHOPHOTO (BANGKOK SUBURB)</text></svg>`,
  },
  {
    id: 'demo-photo-2',
    name: 'Front_Elevation_StreetView.png',
    type: 'elevation',
    uploadedAt: '2026-10-12',
    isDemo: true,
    notes: 'Two-story residential building facade with unobstructed southern sun exposure.',
    url: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="600" height="400" fill="%230B182B"/><polygon points="300,70 80,180 520,180" fill="%23213757" stroke="%23385780" stroke-width="2"/><rect x="110" y="180" width="380" height="170" fill="%23CBD5E1"/><rect x="260" y="250" width="60" height="100" fill="%23475569"/><rect x="140" y="210" width="70" height="60" fill="%2338BDF8" opacity="0.6"/><rect x="370" y="210" width="70" height="60" fill="%2338BDF8" opacity="0.6"/><circle cx="510" cy="90" r="30" fill="%23FBBF24" opacity="0.85"/><text x="300" y="380" fill="%238FA3BF" font-family="sans-serif" font-size="13" text-anchor="middle">DEMO FACADE REFERENCE ELEVATION</text></svg>`,
  },
];

/**
 * Deterministic Solar Energy and Financial Calculation
 * Specified by User Prompt:
 * Monthly production (kWh) = system capacity (kWp) × monthly solar irradiation (kWh/m²/day) × days in month × performance ratio.
 * Annual savings (THB) = estimated self-consumed solar energy (kWh) × electricity tariff (THB/kWh).
 * Simple payback (years) = installation cost (THB) ÷ annual savings (THB), provided annual savings are positive.
 */
export function calculateSolarMetrics(
  location: LocationPreset,
  solar: SolarConfig,
  financial: FinancialConfig,
): SolarCalculationResult {
  const capacityKwp = Math.max(0.1, solar.systemCapacityKwp);
  const pr = Math.max(0.5, Math.min(1.0, solar.performanceRatio));
  const tariff = Math.max(0, financial.electricityTariffThb);
  const selfConsRatio = Math.max(0, Math.min(100, financial.selfConsumptionPercent)) / 100;
  const installCost = Math.max(0, financial.installationCostThb);

  const monthlyBreakdown: MonthlyEnergyOutput[] = [];
  let totalAnnualProductionKwh = 0;
  let totalAnnualSelfConsumedKwh = 0;
  let totalAnnualSavingsThb = 0;
  let totalAnnualGridFeedInKwh = 0;

  for (let i = 0; i < 12; i++) {
    const days = DAYS_IN_MONTH[i];
    const dailyIrrad = location.monthlyIrradiation[i] || location.avgDailyIrradiation;
    const monthlyTotalIrrad = dailyIrrad * days;

    // Standard engineering formula
    const monthProdKwh = capacityKwp * dailyIrrad * days * pr;
    const selfConsumedKwh = monthProdKwh * selfConsRatio;
    const gridFeedInKwh = monthProdKwh - selfConsumedKwh;
    const savingsThb = selfConsumedKwh * tariff;

    totalAnnualProductionKwh += monthProdKwh;
    totalAnnualSelfConsumedKwh += selfConsumedKwh;
    totalAnnualSavingsThb += savingsThb;
    totalAnnualGridFeedInKwh += gridFeedInKwh;

    monthlyBreakdown.push({
      monthName: MONTH_NAMES[i],
      days,
      dailyIrradiation: Number(dailyIrrad.toFixed(2)),
      totalIrradiation: Number(monthlyTotalIrrad.toFixed(1)),
      productionKwh: Math.round(monthProdKwh),
      selfConsumedKwh: Math.round(selfConsumedKwh),
      savingsThb: Math.round(savingsThb),
      gridFeedInKwh: Math.round(gridFeedInKwh),
    });
  }

  // Simple payback period (years)
  const simplePaybackYears =
    totalAnnualSavingsThb > 0
      ? Number((installCost / totalAnnualSavingsThb).toFixed(1))
      : 0;

  // 25-Year Cumulative Savings (accounting for 0.5% degradation & 2% tariff escalation)
  let lifetimeSavingsThb = 0;
  for (let y = 1; y <= 25; y++) {
    const degradedFactor = Math.pow(1 - financial.annualDegradation / 100, y - 1);
    const escalatedTariff = tariff * Math.pow(1 + financial.tariffEscalation / 100, y - 1);
    const yearProd = totalAnnualSelfConsumedKwh * degradedFactor;
    lifetimeSavingsThb += yearProd * escalatedTariff;
  }

  // Environmental impact in Thailand (approx 0.50 kg CO2 / kWh grid factor)
  const co2OffsetTonsPerYear = Number(
    ((totalAnnualProductionKwh * 0.4999) / 1000).toFixed(2),
  );
  const equivalentTreesPlanted = Math.round(totalAnnualProductionKwh * 0.045);

  // Scenario comparisons for common capacity benchmarks
  const scenarioCapacities = [3.3, 5.5, capacityKwp, 10.0, 15.0];
  // Remove duplicates close to current capacity
  const filteredCaps = Array.from(
    new Set(
      scenarioCapacities.map((c) =>
        Math.abs(c - capacityKwp) < 0.3 ? Number(capacityKwp.toFixed(1)) : c,
      ),
    ),
  ).sort((a, b) => a - b);

  const scenarioComparisons: ScenarioResult[] = filteredCaps.map((cap) => {
    const isCurrent = Math.abs(cap - capacityKwp) < 0.05;
    const estCost = isCurrent
      ? installCost
      : Math.round(cap * (installCost / capacityKwp));
    const pCount = Math.round((cap * 1000) / solar.panelWattage);
    const annualProd = Math.round(
      cap *
        location.monthlyIrradiation.reduce(
          (sum, val, idx) => sum + val * DAYS_IN_MONTH[idx],
          0,
        ) *
        pr,
    );
    const annualSavings = Math.round(annualProd * selfConsRatio * tariff);
    const pbYears =
      annualSavings > 0 ? Number((estCost / annualSavings).toFixed(1)) : 0;

    let label = `${cap} kWp`;
    if (cap <= 3.5) label += ' (Small Home)';
    else if (cap <= 6.0) label += ' (Standard Villa)';
    else if (cap <= 10.0) label += ' (Large Residence)';
    else label += ' (Light Commercial)';

    return {
      label,
      capacityKwp: cap,
      panelCount: pCount,
      estimatedCostThb: estCost,
      annualProductionKwh: annualProd,
      annualSavingsThb: annualSavings,
      paybackYears: pbYears,
      isCurrent,
    };
  });

  return {
    annualProductionKwh: Math.round(totalAnnualProductionKwh),
    annualSavingsThb: Math.round(totalAnnualSavingsThb),
    annualSelfConsumedKwh: Math.round(totalAnnualSelfConsumedKwh),
    annualGridFeedInKwh: Math.round(totalAnnualGridFeedInKwh),
    simplePaybackYears,
    lifetimeSavingsThb: Math.round(lifetimeSavingsThb),
    co2OffsetTonsPerYear,
    equivalentTreesPlanted,
    monthlyBreakdown,
    scenarioComparisons,
  };
}

/**
 * Astronomical Solar Position Calculation
 * Calculates exact Solar Altitude (elevation angle above horizon)
 * and Solar Azimuth (degrees clockwise from North)
 * based on Latitude, Longitude, Day of Year, and Local Solar Time.
 */
export function calculateSunPosition(
  lat: number,
  _lng: number,
  dayOfYear: number,
  hourDecimal: number,
): { altitude: number; azimuth: number; isDaylight: boolean } {
  // Convert latitude to radians
  const phi = (lat * Math.PI) / 180;

  // Solar declination delta in radians
  // Cooper's equation: delta = 23.45 * sin(360/365 * (284 + n))
  const deltaDeg = 23.45 * Math.sin(((360 / 365) * (284 + dayOfYear) * Math.PI) / 180);
  const delta = (deltaDeg * Math.PI) / 180;

  // Solar Hour Angle omega in radians: 15 degrees per hour from solar noon (12:00)
  const omegaDeg = 15 * (hourDecimal - 12);
  const omega = (omegaDeg * Math.PI) / 180;

  // Solar Altitude alpha
  const sinAlpha = Math.sin(phi) * Math.sin(delta) + Math.cos(phi) * Math.cos(delta) * Math.cos(omega);
  const altitudeRad = Math.asin(Math.max(-1, Math.min(1, sinAlpha)));
  const altitudeDeg = (altitudeRad * 180) / Math.PI;

  // Solar Azimuth gamma (from North: 0=N, 90=E, 180=S, 270=W)
  const cosGamma =
    (Math.sin(altitudeRad) * Math.sin(phi) - Math.sin(delta)) /
    (Math.cos(altitudeRad) * Math.cos(phi));
  let azimuthDeg = (Math.acos(Math.max(-1, Math.min(1, cosGamma))) * 180) / Math.PI;

  if (hourDecimal < 12) {
    // Morning (Sun is in the East)
    azimuthDeg = 180 - azimuthDeg;
  } else {
    // Afternoon (Sun is in the West)
    azimuthDeg = 180 + azimuthDeg;
  }

  // Normalize azimuth to [0, 360)
  azimuthDeg = (azimuthDeg + 360) % 360;

  return {
    altitude: altitudeDeg,
    azimuth: azimuthDeg,
    isDaylight: altitudeDeg > 0,
  };
}

/**
 * Format numbers with localized commas and abbreviations
 */
export function formatCurrency(num: number): string {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    maximumFractionDigits: 0,
  }).format(num);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}
