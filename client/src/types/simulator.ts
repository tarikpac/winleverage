export interface SimulatorParameters {
  initialCapital: number;
  targetPoints: number;
  pointValue: number;
  riskPerContract: number;
  tradingDays: number;
  startDate: string;
  afternoonPolicy: 'current' | 'half-next' | 'full-next';
}

export interface TradingDay {
  index: number;
  date: Date;
  dateStr: string;
  morning: boolean;
  afternoon: boolean;
}

export interface DayResult {
  date: string;
  startCapital: number;
  morningContracts: number;
  morningProfit: number;
  afternoonContracts: number;
  afternoonProfit: number;
  endCapital: number;
}

export interface ScenarioResult {
  scenario: 'S1' | 'S2' | 'S3';
  finalCapital: number;
  totalGain: number;
  roi: number;
  tradingDaysUsed: number;
  dailyResults: DayResult[];
}

export interface SimulationResults {
  s1: ScenarioResult;
  s2: ScenarioResult;
  s3: ScenarioResult;
}

export type ScenarioType = 'S1' | 'S2' | 'S3';
