import { useState, useEffect, useMemo } from 'react';
import { SimulatorParameters, TradingDay, SimulationResults, ScenarioType } from '@/types/simulator';
import { generateBusinessDays, formatDate, formatDateShort } from '@/lib/business-days';
import { simulateScenario } from '@/lib/simulator';

const DEFAULT_PARAMETERS: SimulatorParameters = {
  initialCapital: 2000,
  targetPoints: 60,
  pointValue: 0.20,
  riskPerContract: 100,
  tradingDays: 15,
  startDate: new Date().toISOString().split('T')[0],
  afternoonPolicy: 'current'
};

const STORAGE_KEY = 'win-simulator';

export function useSimulator() {
  const [parameters, setParameters] = useState<SimulatorParameters>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return { ...DEFAULT_PARAMETERS, ...JSON.parse(stored).parameters };
      } catch {
        return DEFAULT_PARAMETERS;
      }
    }
    return DEFAULT_PARAMETERS;
  });

  const [tradingDays, setTradingDays] = useState<TradingDay[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        if (data.tradingDays) {
          return data.tradingDays.map((day: any) => ({
            ...day,
            date: new Date(day.date)
          }));
        }
      } catch {
        // Fall through to generate new days
      }
    }
    
    const businessDays = generateBusinessDays(new Date(DEFAULT_PARAMETERS.startDate), DEFAULT_PARAMETERS.tradingDays);
    return businessDays.map((date, index) => ({
      index: index + 1,
      date,
      dateStr: formatDateShort(date),
      morning: true,
      afternoon: true
    }));
  });

  const [activeScenario, setActiveScenario] = useState<ScenarioType>('S1');

  // Generate trading days when parameters change
  useEffect(() => {
    const businessDays = generateBusinessDays(new Date(parameters.startDate), parameters.tradingDays);
    const newTradingDays = businessDays.map((date, index) => ({
      index: index + 1,
      date,
      dateStr: formatDateShort(date),
      morning: true,
      afternoon: true
    }));
    setTradingDays(newTradingDays);
  }, [parameters.startDate, parameters.tradingDays]);

  // Save to localStorage
  useEffect(() => {
    const dataToStore = {
      parameters,
      tradingDays: tradingDays.map(day => ({
        ...day,
        date: day.date.toISOString()
      }))
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToStore));
  }, [parameters, tradingDays]);

  // Calculate simulation results
  const simulationResults = useMemo<SimulationResults>(() => {
    return {
      s1: simulateScenario('S1', parameters, tradingDays),
      s2: simulateScenario('S2', parameters, tradingDays),
      s3: simulateScenario('S3', parameters, tradingDays)
    };
  }, [parameters, tradingDays]);

  const updateParameters = (newParameters: Partial<SimulatorParameters>) => {
    setParameters(prev => ({ ...prev, ...newParameters }));
  };

  const updateTradingDay = (index: number, updates: Partial<Pick<TradingDay, 'morning' | 'afternoon'>>) => {
    setTradingDays(prev => 
      prev.map(day => 
        day.index === index + 1 ? { ...day, ...updates } : day
      )
    );
  };

  const resetParameters = () => {
    setParameters(DEFAULT_PARAMETERS);
  };

  const importCSV = (csvData: string) => {
    try {
      const lines = csvData.trim().split('\n');
      const header = lines[0].toLowerCase();
      
      if (!header.includes('date') || !header.includes('morning') || !header.includes('afternoon')) {
        throw new Error('CSV deve conter colunas: date, morning, afternoon');
      }
      
      const updatedDays = [...tradingDays];
      
      for (let i = 1; i < lines.length && i - 1 < updatedDays.length; i++) {
        const values = lines[i].split(',');
        if (values.length >= 3) {
          updatedDays[i - 1] = {
            ...updatedDays[i - 1],
            morning: values[1].trim() === '1',
            afternoon: values[2].trim() === '1'
          };
        }
      }
      
      setTradingDays(updatedDays);
      return true;
    } catch (error) {
      console.error('Erro ao importar CSV:', error);
      return false;
    }
  };

  const activeSessions = tradingDays.reduce((count, day) => {
    return count + (day.morning ? 1 : 0) + (day.afternoon ? 1 : 0);
  }, 0);

  const totalSessions = tradingDays.length * 2;

  return {
    parameters,
    tradingDays,
    simulationResults,
    activeScenario,
    activeSessions,
    totalSessions,
    updateParameters,
    updateTradingDay,
    resetParameters,
    importCSV,
    setActiveScenario
  };
}
