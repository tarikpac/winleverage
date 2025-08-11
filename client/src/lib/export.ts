import { ScenarioResult } from '@/types/simulator';
import { formatCurrency, formatPercentage } from './currency';

export function exportToCSV(scenarioResult: ScenarioResult): void {
  const headers = [
    'Data',
    'Capital Início',
    'Contratos Manhã',
    'Lucro Manhã',
    'Contratos Tarde',
    'Lucro Tarde',
    'Capital Fim'
  ];
  
  const rows = scenarioResult.dailyResults.map(day => [
    day.date,
    formatCurrency(day.startCapital),
    day.morningContracts.toString(),
    formatCurrency(day.morningProfit),
    day.afternoonContracts.toString(),
    formatCurrency(day.afternoonProfit),
    formatCurrency(day.endCapital)
  ]);
  
  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `simulador_${scenarioResult.scenario.toLowerCase()}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportToXLSX(scenarioResult: ScenarioResult): void {
  // @ts-ignore - XLSX is loaded from CDN
  if (typeof window.XLSX === 'undefined') {
    console.error('XLSX library not loaded');
    return;
  }
  
  const headers = [
    'Data',
    'Capital Início',
    'Contratos Manhã',
    'Lucro Manhã',
    'Contratos Tarde',
    'Lucro Tarde',
    'Capital Fim'
  ];
  
  const data = [
    headers,
    ...scenarioResult.dailyResults.map(day => [
      day.date,
      day.startCapital,
      day.morningContracts,
      day.morningProfit,
      day.afternoonContracts,
      day.afternoonProfit,
      day.endCapital
    ])
  ];
  
  // @ts-ignore - XLSX is loaded from CDN
  const ws = window.XLSX.utils.aoa_to_sheet(data);
  // @ts-ignore - XLSX is loaded from CDN
  const wb = window.XLSX.utils.book_new();
  // @ts-ignore - XLSX is loaded from CDN
  window.XLSX.utils.book_append_sheet(wb, ws, scenarioResult.scenario);
  
  // Format currency columns
  // @ts-ignore - XLSX is loaded from CDN
  const range = window.XLSX.utils.decode_range(ws['!ref'] || 'A1');
  const currencyColumns = [1, 3, 5, 6]; // Capital Início, Lucro Manhã, Lucro Tarde, Capital Fim
  
  for (let row = 1; row <= range.e.r; row++) {
    currencyColumns.forEach(col => {
      // @ts-ignore - XLSX is loaded from CDN
      const cellAddress = window.XLSX.utils.encode_cell({ r: row, c: col });
      if (ws[cellAddress]) {
        ws[cellAddress].z = '"R$ "#,##0.00';
      }
    });
  }
  
  // @ts-ignore - XLSX is loaded from CDN
  window.XLSX.writeFile(wb, `simulador_${scenarioResult.scenario.toLowerCase()}_${new Date().toISOString().split('T')[0]}.xlsx`);
}
