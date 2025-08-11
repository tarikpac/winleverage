import { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useToast } from '@/hooks/use-toast';
import { useSimulator } from '@/hooks/use-simulator';
import { useTheme } from '@/hooks/use-theme';
import { formatCurrency, formatPercentage, formatNumber } from '@/lib/currency';
import { exportToCSV, exportToXLSX } from '@/lib/export';
import { ScenarioType } from '@/types/simulator';
import { ChartLine, Calendar as CalendarIcon, RotateCcw, Upload, Download, FileSpreadsheet, Play, RotateCcw as Reset, Moon, Sun } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export default function Home() {
  const { toast } = useToast();
  const { theme, toggleTheme } = useTheme();
  const {
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
  } = useSimulator();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<any>(null);

  // Initialize chart
  useEffect(() => {
    // @ts-ignore - Chart is loaded from CDN
    if (chartRef.current && typeof window.Chart !== 'undefined') {
      // Destroy existing chart
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }

      const ctx = chartRef.current;
      const results = simulationResults[activeScenario.toLowerCase() as keyof typeof simulationResults];
      
      const labels = results.dailyResults.map(day => day.date);
      const data = results.dailyResults.map(day => day.endCapital);

      // @ts-ignore - Chart is loaded from CDN
      chartInstanceRef.current = new window.Chart(ctx, {
        type: 'line',
        data: {
          labels,
          datasets: [{
            label: 'Capital (R$)',
            data,
            borderColor: activeScenario === 'S1' ? '#1976D2' : activeScenario === 'S2' ? '#42A5F5' : '#FF9800',
            backgroundColor: activeScenario === 'S1' ? 'rgba(25, 118, 210, 0.1)' : activeScenario === 'S2' ? 'rgba(66, 165, 245, 0.1)' : 'rgba(255, 152, 0, 0.1)',
            tension: 0.4,
            fill: true,
            pointBackgroundColor: activeScenario === 'S1' ? '#1976D2' : activeScenario === 'S2' ? '#42A5F5' : '#FF9800',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: false,
              ticks: {
                callback: function(value: any) {
                  return formatCurrency(value);
                }
              }
            }
          },
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              callbacks: {
                label: function(context: any) {
                  return formatCurrency(context.parsed.y);
                }
              }
            }
          }
        }
      });
    }

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [simulationResults, activeScenario]);

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/csv') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const csvData = e.target?.result as string;
        const success = importCSV(csvData);
        if (success) {
          toast({
            title: "Sucesso",
            description: "CSV importado com sucesso!",
          });
        } else {
          toast({
            title: "Erro",
            description: "Erro ao importar CSV. Verifique o formato.",
            variant: "destructive",
          });
        }
      };
      reader.readAsText(file);
    } else {
      toast({
        title: "Erro",
        description: "Por favor, selecione um arquivo CSV válido.",
        variant: "destructive",
      });
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleExportCSV = () => {
    const results = simulationResults[activeScenario.toLowerCase() as keyof typeof simulationResults];
    exportToCSV(results);
    toast({
      title: "Sucesso",
      description: "Arquivo CSV exportado com sucesso!",
    });
  };

  const handleExportXLSX = () => {
    const results = simulationResults[activeScenario.toLowerCase() as keyof typeof simulationResults];
    exportToXLSX(results);
    toast({
      title: "Sucesso",
      description: "Arquivo XLSX exportado com sucesso!",
    });
  };

  const currentDate = new Date().toLocaleDateString('pt-BR');
  const currentResults = simulationResults[activeScenario.toLowerCase() as keyof typeof simulationResults];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-primary text-white rounded-lg p-2">
                <ChartLine className="text-xl h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Simulador WIN B3</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Alavancagem Mini Índice</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                <Calendar className="inline mr-1 h-4 w-4 text-gray-600 dark:text-gray-400" />
                <span>{currentDate}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="w-9 h-9 p-0"
              >
                {theme === 'dark' ? (
                  <Sun className="h-4 w-4 text-yellow-500" />
                ) : (
                  <Moon className="h-4 w-4 text-gray-600" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Panel 1: Parameters */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="bg-white dark:bg-gray-800 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Parâmetros</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetParameters}
                    className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="initialCapital">Capital Inicial</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">R$</span>
                      <Input
                        id="initialCapital"
                        type="number"
                        className="pl-10"
                        value={parameters.initialCapital}
                        onChange={(e) => updateParameters({ initialCapital: Number(e.target.value) })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="targetPoints">Meta de Pontos por Sessão</Label>
                    <Input
                      id="targetPoints"
                      type="number"
                      value={parameters.targetPoints}
                      onChange={(e) => updateParameters({ targetPoints: Number(e.target.value) })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="pointValue">Valor do Ponto</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">R$</span>
                      <Input
                        id="pointValue"
                        type="number"
                        step="0.01"
                        className="pl-10"
                        value={parameters.pointValue}
                        onChange={(e) => updateParameters({ pointValue: Number(e.target.value) })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="riskPerContract">Risco por Contrato</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">R$</span>
                      <Input
                        id="riskPerContract"
                        type="number"
                        className="pl-10"
                        value={parameters.riskPerContract}
                        onChange={(e) => updateParameters({ riskPerContract: Number(e.target.value) })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="tradingDays">Número de Pregões</Label>
                    <Input
                      id="tradingDays"
                      type="number"
                      value={parameters.tradingDays}
                      onChange={(e) => updateParameters({ tradingDays: Number(e.target.value) })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="startDate">Data de Início</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-between text-left font-normal hover:bg-gray-50 dark:hover:bg-gray-700",
                            !parameters.startDate && "text-muted-foreground"
                          )}
                        >
                          <span className="flex-1">
                            {parameters.startDate ? format(new Date(parameters.startDate + 'T00:00:00'), 'dd/MM/yyyy') : "Clique para selecionar"}
                          </span>
                          <CalendarIcon className="h-4 w-4 opacity-50 dark:opacity-70" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent 
                        className="w-auto p-0 z-50" 
                        align="start"
                        sideOffset={5}
                        onOpenAutoFocus={(e) => e.preventDefault()}
                      >
                        <Calendar
                          mode="single"
                          selected={parameters.startDate ? new Date(parameters.startDate + 'T00:00:00') : undefined}
                          onSelect={(date) => {
                            if (date) {
                              const formattedDate = format(date, 'yyyy-MM-dd');
                              updateParameters({ startDate: formattedDate });
                            }
                          }}
                          disabled={(date) => {
                            const today = new Date();
                            today.setHours(23, 59, 59, 999);
                            return date > today || date < new Date("2020-01-01");
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div>
                    <Label htmlFor="afternoonPolicy">Política quando não houver manhã</Label>
                    <Select
                      value={parameters.afternoonPolicy}
                      onValueChange={(value: 'current' | 'half-next' | 'full-next') => 
                        updateParameters({ afternoonPolicy: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="current">Contratos do dia (padrão)</SelectItem>
                        <SelectItem value="half-next">Metade do próximo</SelectItem>
                        <SelectItem value="full-next">Próximo inteiro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex space-x-3 pt-4 border-t border-gray-200">
                    <Button className="flex-1">
                      <Play className="mr-2 h-4 w-4" />
                      Simular
                    </Button>
                    <Button variant="outline" onClick={resetParameters}>
                      <Reset className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="pt-2">
                    <Button
                      variant="ghost"
                      className="w-full text-sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Importar CSV de Sessões
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv"
                      className="hidden"
                      onChange={handleFileImport}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Panel 2: Trading Schedule */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="bg-white dark:bg-gray-800 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Agenda dos Pregões</h2>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{tradingDays.length} dias úteis</span>
                </div>
                
                <div className="flex gap-2 mb-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const allMorningChecked = tradingDays.every(day => day.morning);
                      tradingDays.forEach((_, index) => {
                        updateTradingDay(index, { morning: !allMorningChecked });
                      });
                    }}
                    className="text-xs px-2 py-1 flex-1"
                  >
                    {tradingDays.every(day => day.morning) ? 'Desmarcar' : 'Marcar'} Manhãs
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const allAfternoonChecked = tradingDays.every(day => day.afternoon);
                      tradingDays.forEach((_, index) => {
                        updateTradingDay(index, { afternoon: !allAfternoonChecked });
                      });
                    }}
                    className="text-xs px-2 py-1 flex-1"
                  >
                    {tradingDays.every(day => day.afternoon) ? 'Desmarcar' : 'Marcar'} Tardes
                  </Button>
                </div>
                
                <div className="overflow-auto max-h-96 md:max-h-none md:overflow-visible">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0 md:static">
                      <tr>
                        <th className="text-left py-2 px-3 font-medium text-gray-700 dark:text-gray-300">#</th>
                        <th className="text-left py-2 px-3 font-medium text-gray-700 dark:text-gray-300">Data</th>
                        <th className="text-center py-2 px-3 font-medium text-gray-700 dark:text-gray-300">Manhã</th>
                        <th className="text-center py-2 px-3 font-medium text-gray-700 dark:text-gray-300">Tarde</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {tradingDays.map((day, index) => (
                        <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                          <td className="py-2 px-3 text-gray-600 dark:text-gray-400">{day.index}</td>
                          <td className="py-2 px-3 font-medium dark:text-gray-300">{day.dateStr}</td>
                          <td className="py-2 px-3 text-center">
                            <Checkbox
                              checked={day.morning}
                              onCheckedChange={(checked) => 
                                updateTradingDay(index, { morning: checked as boolean })
                              }
                            />
                          </td>
                          <td className="py-2 px-3 text-center">
                            <Checkbox
                              checked={day.afternoon}
                              onCheckedChange={(checked) => 
                                updateTradingDay(index, { afternoon: checked as boolean })
                              }
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Sessões ativas:</span>
                    <span className="font-medium">{activeSessions}/{totalSessions}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Panel 3: Results */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <CardContent className="p-4 text-center">
                  <div className="text-lg lg:text-xl xl:text-2xl font-bold text-primary whitespace-nowrap">{formatCurrency(simulationResults.s1.finalCapital)}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">S1 - Base</div>
                  <div className="text-xs text-green-600 dark:text-green-400 font-medium whitespace-nowrap">{formatPercentage(simulationResults.s1.roi)} ROI</div>
                </CardContent>
              </Card>
              <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <CardContent className="p-4 text-center">
                  <div className="text-lg lg:text-xl xl:text-2xl font-bold text-blue-400 whitespace-nowrap">{formatCurrency(simulationResults.s2.finalCapital)}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">S2 - Moderado</div>
                  <div className="text-xs text-green-600 dark:text-green-400 font-medium whitespace-nowrap">{formatPercentage(simulationResults.s2.roi)} ROI</div>
                </CardContent>
              </Card>
              <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <CardContent className="p-4 text-center">
                  <div className="text-lg lg:text-xl xl:text-2xl font-bold text-orange-500 whitespace-nowrap">{formatCurrency(simulationResults.s3.finalCapital)}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">S3 - Agressivo</div>
                  <div className="text-xs text-green-600 dark:text-green-400 font-medium whitespace-nowrap">{formatPercentage(simulationResults.s3.roi)} ROI</div>
                </CardContent>
              </Card>
            </div>

            {/* Scenario Tabs */}
            <Card className="bg-white dark:bg-gray-800 shadow-sm">
              <Tabs value={activeScenario} onValueChange={(value) => setActiveScenario(value as ScenarioType)}>
                <div className="border-b border-gray-200 dark:border-gray-700">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="S1" className="text-sm">S1 - Base</TabsTrigger>
                    <TabsTrigger value="S2" className="text-sm">S2 - Moderado</TabsTrigger>
                    <TabsTrigger value="S3" className="text-sm">S3 - Agressivo</TabsTrigger>
                  </TabsList>
                </div>

                <CardContent className="p-2 lg:p-4">
                  {/* Chart */}
                  <div className="mb-6 h-48">
                    <canvas ref={chartRef} className="w-full h-full"></canvas>
                  </div>

                  {/* Results Table */}
                  <div className="overflow-x-auto md:overflow-x-visible">
                    <table className="w-full text-xs md:text-sm">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="text-left py-2 px-2 md:px-3 font-medium text-gray-700 dark:text-gray-300">Data</th>
                          <th className="text-right py-2 px-2 md:px-3 font-medium text-gray-700 dark:text-gray-300">
                            <span className="hidden md:inline">Cap. Início</span>
                            <span className="md:hidden">Início</span>
                          </th>
                          <th className="text-right py-2 px-2 md:px-3 font-medium text-gray-700 dark:text-gray-300">Ctt M</th>
                          <th className="text-right py-2 px-2 md:px-3 font-medium text-gray-700 dark:text-gray-300">Lucro M</th>
                          <th className="text-right py-2 px-2 md:px-3 font-medium text-gray-700 dark:text-gray-300">Ctt T</th>
                          <th className="text-right py-2 px-2 md:px-3 font-medium text-gray-700 dark:text-gray-300">Lucro T</th>
                          <th className="text-right py-2 px-2 md:px-3 font-medium text-gray-700 dark:text-gray-300">
                            <span className="hidden md:inline">Cap. Fim</span>
                            <span className="md:hidden">Fim</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-xs md:text-sm">
                        {currentResults.dailyResults.map((day, index) => (
                          <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                            <td className="py-2 px-2 md:px-3 font-medium dark:text-gray-300">{day.date}</td>
                            <td className="py-2 px-2 md:px-3 text-right dark:text-gray-300 whitespace-nowrap">{formatCurrency(day.startCapital)}</td>
                            <td className="py-2 px-2 md:px-3 text-right dark:text-gray-300">{day.morningContracts || '-'}</td>
                            <td className="py-2 px-2 md:px-3 text-right text-green-600 dark:text-green-400 whitespace-nowrap">
                              {day.morningProfit ? formatCurrency(day.morningProfit) : '-'}
                            </td>
                            <td className="py-2 px-2 md:px-3 text-right dark:text-gray-300">{day.afternoonContracts || '-'}</td>
                            <td className="py-2 px-2 md:px-3 text-right text-green-600 dark:text-green-400 whitespace-nowrap">
                              {day.afternoonProfit ? formatCurrency(day.afternoonProfit) : '-'}
                            </td>
                            <td className="py-2 px-2 md:px-3 text-right font-medium dark:text-gray-200 whitespace-nowrap">{formatCurrency(day.endCapital)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Export Buttons */}
                  <div className="flex space-x-2 mt-4 pt-4 border-t border-gray-200">
                    <Button className="flex-1" variant="outline" onClick={handleExportCSV}>
                      <Download className="mr-1 h-4 w-4" />
                      CSV
                    </Button>
                    <Button className="flex-1" onClick={handleExportXLSX}>
                      <FileSpreadsheet className="mr-1 h-4 w-4" />
                      XLSX
                    </Button>
                  </div>
                </CardContent>
              </Tabs>
            </Card>
          </div>
        </div>

        {/* Comparison Summary */}
        <div className="mt-8">
          <Card className="bg-white dark:bg-gray-800 shadow-sm">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Resumo Comparativo</h2>
              
              <div className="overflow-x-auto md:overflow-x-visible">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Cenário</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Capital Inicial</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Capital Final</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Ganho Total</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-700 dark:text-gray-300">ROI</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Pregões Utilizados</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="py-3 px-4 font-medium text-primary">S1 - Base</td>
                      <td className="py-3 px-4 text-right dark:text-gray-300">{formatCurrency(parameters.initialCapital)}</td>
                      <td className="py-3 px-4 text-right font-medium dark:text-gray-200">{formatCurrency(simulationResults.s1.finalCapital)}</td>
                      <td className="py-3 px-4 text-right text-green-600 dark:text-green-400 font-medium">{formatCurrency(simulationResults.s1.totalGain)}</td>
                      <td className="py-3 px-4 text-right text-green-600 dark:text-green-400 font-bold">{formatPercentage(simulationResults.s1.roi)}</td>
                      <td className="py-3 px-4 text-right dark:text-gray-300">{simulationResults.s1.tradingDaysUsed}</td>
                    </tr>
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="py-3 px-4 font-medium text-blue-400">S2 - Moderado</td>
                      <td className="py-3 px-4 text-right dark:text-gray-300">{formatCurrency(parameters.initialCapital)}</td>
                      <td className="py-3 px-4 text-right font-medium dark:text-gray-200">{formatCurrency(simulationResults.s2.finalCapital)}</td>
                      <td className="py-3 px-4 text-right text-green-600 dark:text-green-400 font-medium">{formatCurrency(simulationResults.s2.totalGain)}</td>
                      <td className="py-3 px-4 text-right text-green-600 dark:text-green-400 font-bold">{formatPercentage(simulationResults.s2.roi)}</td>
                      <td className="py-3 px-4 text-right dark:text-gray-300">{simulationResults.s2.tradingDaysUsed}</td>
                    </tr>
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="py-3 px-4 font-medium text-orange-500">S3 - Agressivo</td>
                      <td className="py-3 px-4 text-right dark:text-gray-300">{formatCurrency(parameters.initialCapital)}</td>
                      <td className="py-3 px-4 text-right font-medium dark:text-gray-200">{formatCurrency(simulationResults.s3.finalCapital)}</td>
                      <td className="py-3 px-4 text-right text-green-600 dark:text-green-400 font-medium">{formatCurrency(simulationResults.s3.totalGain)}</td>
                      <td className="py-3 px-4 text-right text-green-600 dark:text-green-400 font-bold">{formatPercentage(simulationResults.s3.roi)}</td>
                      <td className="py-3 px-4 text-right dark:text-gray-300">{simulationResults.s3.tradingDaysUsed}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Mobile Notice */}
      <div className="fixed bottom-4 right-4 lg:hidden">
        <div className="bg-primary text-white text-xs rounded-lg p-2 shadow-lg">
          <i className="fas fa-mobile-alt mr-1"></i>
          Modo mobile
        </div>
      </div>
    </div>
  );
}
