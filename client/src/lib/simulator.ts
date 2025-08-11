import { SimulatorParameters, TradingDay, ScenarioResult, DayResult } from '@/types/simulator';

export function calculateContracts(capital: number, riskPerContract: number): number {
  return Math.floor(capital / riskPerContract);
}

export function calculateProfit(contracts: number, targetPoints: number, pointValue: number): number {
  return contracts * targetPoints * pointValue;
}

export function simulateScenario(
  scenario: 'S1' | 'S2' | 'S3',
  parameters: SimulatorParameters,
  tradingDays: TradingDay[]
): ScenarioResult {
  const { initialCapital, targetPoints, pointValue, riskPerContract, afternoonPolicy } = parameters;
  const dailyResults: DayResult[] = [];
  let currentCapital = initialCapital;
  
  for (let i = 0; i < tradingDays.length; i++) {
    const day = tradingDays[i];
    const startCapital = currentCapital;
    
    let morningContracts = 0;
    let morningProfit = 0;
    let afternoonContracts = 0;
    let afternoonProfit = 0;
    
    // Morning session
    if (day.morning) {
      morningContracts = calculateContracts(currentCapital, riskPerContract);
      morningProfit = calculateProfit(morningContracts, targetPoints, pointValue);
      currentCapital += morningProfit;
    }
    
    // Afternoon session
    if (day.afternoon) {
      let contractsForAfternoon = 0;

      if (scenario === 'S1') {
        // S1 (Base): contratos da tarde iguais aos da manhã quando houver;
        // se não houver manhã, usa contratos calculados pelo capital do dia (startCapital).
        contractsForAfternoon = day.morning
          ? morningContracts
          : calculateContracts(startCapital, riskPerContract);
      } else {
        // S2 and S3: Use "next day" logic
        const capitalForNext = day.morning ? currentCapital : startCapital;
        const nextDayContracts = calculateContracts(capitalForNext, riskPerContract);
        
        if (day.morning) {
          // If there was morning, use next day logic
          if (scenario === 'S2') {
            contractsForAfternoon = Math.floor(nextDayContracts * 0.5);
          } else { // S3
            contractsForAfternoon = nextDayContracts;
          }
        } else {
          // If no morning, apply afternoon policy
          switch (afternoonPolicy) {
            case 'current':
              contractsForAfternoon = calculateContracts(startCapital, riskPerContract);
              break;
            case 'half-next':
              contractsForAfternoon = Math.floor(nextDayContracts * 0.5);
              break;
            case 'full-next':
              contractsForAfternoon = nextDayContracts;
              break;
          }
        }
      }

      afternoonContracts = contractsForAfternoon;
      afternoonProfit = calculateProfit(afternoonContracts, targetPoints, pointValue);
      currentCapital += afternoonProfit;
    }
    
    dailyResults.push({
      date: day.dateStr,
      startCapital,
      morningContracts,
      morningProfit,
      afternoonContracts,
      afternoonProfit,
      endCapital: currentCapital
    });
  }
  
  const finalCapital = currentCapital;
  const totalGain = finalCapital - initialCapital;
  const roi = (totalGain / initialCapital) * 100;
  const tradingDaysUsed = tradingDays.filter(day => day.morning || day.afternoon).length;
  
  return {
    scenario,
    finalCapital,
    totalGain,
    roi,
    tradingDaysUsed,
    dailyResults
  };
}
