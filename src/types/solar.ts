export interface LocationPreset {
  id: string;
  name: string;
  province: string;
  lat: number;
  lng: number;
  description: string;
  avgDailyIrradiation: number; // kWh/m²/day
  monthlyIrradiation: number[]; // 12 months (Jan-Dec) in kWh/m²/day
}

export interface BuildingConfig {
  width: number; // meters (X axis)
  length: number; // meters (Z axis)
  wallHeight: number; // meters
  roofType: 'gable' | 'flat' | 'hip';
  roofPitch: number; // degrees (e.g. 15 to 40)
  roofAzimuth: number; // degrees from North (180 = South facing)
  roofColor: string;
  wallColor: string;
  isAssumed: boolean;
}

export interface SolarConfig {
  systemCapacityKwp: number; // kWp
  panelCount: number; // number of physical panels
  panelWattage: number; // watts per panel (e.g. 550W)
  performanceRatio: number; // 0.70 to 0.88, default 0.80
  tiltAngle: number; // degrees
  orientationAzimuth: number; // degrees
}

export interface FinancialConfig {
  installationCostThb: number; // THB
  electricityTariffThb: number; // THB/kWh (e.g., 4.70 THB/kWh in Thailand)
  selfConsumptionPercent: number; // e.g. 75%
  annualDegradation: number; // 0.5% per year
  tariffEscalation: number; // 2.0% per year
  lifespanYears: number; // 25 years
}

export interface ObstructionConfig {
  enabled: boolean;
  type: 'tree' | 'building' | 'pole';
  distanceX: number; // meters relative to house center
  distanceZ: number; // meters relative to house center
  height: number; // meters
  width: number; // meters
}

export interface SimulationTime {
  hour: number; // 6 to 18 (decimal, e.g. 14.5 = 14:30)
  month: number; // 0 to 11
  day: number; // 1 to 31
  isPlaying: boolean;
}

export interface SitePhoto {
  id: string;
  name: string;
  url: string;
  type: 'roof' | 'elevation' | 'meter' | 'general';
  uploadedAt: string;
  isDemo?: boolean;
  notes?: string;
}

export interface MonthlyEnergyOutput {
  monthName: string;
  days: number;
  dailyIrradiation: number; // kWh/m²/day
  totalIrradiation: number; // kWh/m²
  productionKwh: number; // kWh
  selfConsumedKwh: number; // kWh
  savingsThb: number; // THB
  gridFeedInKwh: number; // kWh
}

export interface SolarCalculationResult {
  annualProductionKwh: number;
  annualSavingsThb: number;
  annualSelfConsumedKwh: number;
  annualGridFeedInKwh: number;
  simplePaybackYears: number;
  lifetimeSavingsThb: number;
  co2OffsetTonsPerYear: number;
  equivalentTreesPlanted: number;
  monthlyBreakdown: MonthlyEnergyOutput[];
  scenarioComparisons: ScenarioResult[];
}

export interface ScenarioResult {
  label: string;
  capacityKwp: number;
  panelCount: number;
  estimatedCostThb: number;
  annualProductionKwh: number;
  annualSavingsThb: number;
  paybackYears: number;
  isCurrent?: boolean;
}
