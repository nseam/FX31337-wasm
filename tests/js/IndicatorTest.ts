import { readFileSync, readdirSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { Test, run, LibModule } from '../../lib/Runner';
import { TesterValuesColumns } from '../../lib/types/TesterValuesColumns';
import * as asciichart from 'asciichart';
import { ChartJSNodeCanvas } from 'chartjs-node-canvas';
import wasmJs from '../../dist/IndicatorTest';
import { TesterValues } from '../../lib/types/TesterValues';

class IndicatorRunTest extends Test {
  async run(lib: LibModule): Promise<void> {
    lib.Tester.Init();

    const ticker = new lib.indicators.TickProvider({ symbol: 'EURUSD' });

    const tfM1 = new lib.indicators.Tf(lib.timeframes.M1);
    tfM1.SetSource(ticker);

    const rsiM1 = new lib.indicators.RSI({ period: 14, appliedPrice: lib.ap.close, shift: 0 });
    rsiM1.SetName('RSI M1');
    rsiM1.SetSource(tfM1);

    lib.Tester.Add(rsiM1);

    // Load all CSV files from data folder sorted by date/time.
    const dataDir = join(dirname(fileURLToPath(import.meta.url)), '../data');
    const csvData = this.loadCsvData(dataDir);
    lib.Tester.FeedTickProviderCsv(ticker, csvData);

    // Process all ticks through the indicator pipeline.
    lib.Tester.RunAllTicks();

    // Generate chart for M1 input bars
    console.log('\n=== Generating M1 Candle Chart ===');
    await this.generateCandlestickChart(lib, tfM1, 'M1 Candles');

    // Retrieve all ungrouped (raw, bar-by-bar) indicator values.
    // Passing 0n for both parameters means: all available history, up to most recent bar.
    const testerValues: TesterValues = lib.Tester.GetValues(BigInt(0), BigInt(0), 0, false);

    for (const col of testerValues.timestep_based) {
      const name = col.indicator_info?.name ?? 'Unknown';

      // Extract the primary output (mode 0) values in chronological order.
      const series: number[] = (col.values as any[]).map((v: any) => v.values[0]);

      if (series.length < 2) {
        console.log(`\n=== ${name} — insufficient data (${series.length} point(s)) ===`);
        continue;
      }

      // Limit the number of bars to display (last 100 bars) to keep output manageable
      const maxBarsToShow = 100;
      const displayedSeries = series.slice(-maxBarsToShow);
      
      const min = Math.min(...displayedSeries).toFixed(4);
      const max = Math.max(...displayedSeries).toFixed(4);
       console.log(`\n=== ${name}  |  ${series.length} bars (showing last ${displayedSeries.length})  |  min=${min}  max=${max} ===`);
       console.log(asciichart.plot(displayedSeries, { height: 5 }));
       
       // Generate PNG chart directly using ChartJSNodeCanvas
       try {
         const width = 1024;
         const height = 512;
         const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height });

         const dataLabels = Array.from({ length: displayedSeries.length }, (_, i) => i);
         const configuration = {
           type: 'line',
           data: {
             labels: dataLabels,
             datasets: [
               {
                 label: name,
                 data: displayedSeries,
                 borderColor: 'rgb(75, 192, 192)',
                 backgroundColor: 'rgba(75, 192, 192, 0.1)',
                 borderWidth: 2,
                 fill: false,
                 tension: 0.1,
                 pointRadius: 2,
                 pointBackgroundColor: 'rgb(75, 192, 192)'
               }
             ]
           },
           options: {
             responsive: false,
             plugins: {
               title: {
                 display: true,
                 text: `${name} - Last ${displayedSeries.length} bars (Total: ${series.length})`
               },
               legend: {
                 display: true,
                 position: 'top'
               }
             },
             scales: {
               x: {
                 display: true,
                 title: {
                   display: true,
                   text: 'Bar Index'
                 }
               },
               y: {
                 display: true,
                 min: 0,
                 max: 100,
                 title: {
                   display: true,
                   text: `Value (actual range: ${min}-${max})`
                 }
               }
             }
           }
         };

         const image = await chartJSNodeCanvas.renderToBuffer(configuration as any, 'image/png');
         const fileName = `chart_${name.replace(/\s+/g, '_')}.png`;
         writeFileSync(fileName, image);
         console.log(`✓ Chart image saved to ${fileName}`);
       } catch (error) {
         console.error(`✗ Error generating chart for ${name}:`, error);
       }
    }
  }

  /**
   * Generates a candlestick chart for M1 input bars.
   * @param lib The LibModule instance
   * @param tfIndicator The M1 timeframe indicator
   * @param chartName Name for the chart
   */
  async generateCandlestickChart(lib: any, tfIndicator: any, chartName: string): Promise<void> {
    try {
      const barData = lib.Tester.GetIndicatorColumnsUngrouped(tfIndicator, BigInt(0), BigInt(0));

      console.log(barData);
      
      if (!barData.values || barData.values.length < 2) {
        console.log(`Insufficient data for ${chartName} chart`);
        return;
      }

      // Extract OHLC values from bars.
      // IndicatorDataEntry values indices match ENUM_INDI_CANDLE_MODE:
      //   0 = Open, 1 = High, 2 = Low, 3 = Close
      const ohlcData: any[] = (barData.values as any[])
        .filter((v: any) => Array.isArray(v.values) && v.values.length >= 4 &&
                          v.values.every((x: any) => typeof x === 'number'))
        .map((v: any) => ({
          o: v.values[0],
          h: v.values[1],
          l: v.values[2],
          c: v.values[3],
          x: v.timestamp || 0
        }));

      if (ohlcData.length < 2) {
        console.log(`Insufficient OHLC data for ${chartName} chart`);
        return;
      }

      // Limit to last 100 bars
      const maxBarsToShow = 100;
      const displayedOHLC = ohlcData.slice(-maxBarsToShow);
      
      const minPrice = Math.min(...displayedOHLC.map(d => d.l)).toFixed(4);
      const maxPrice = Math.max(...displayedOHLC.map(d => d.h)).toFixed(4);
      
      console.log(`\n=== ${chartName}  |  ${ohlcData.length} bars (showing last ${displayedOHLC.length})  |  low=${minPrice}  high=${maxPrice} ===`);

      // Generate candlestick chart
      const width = 1024;
      const height = 512;
      const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height });

      const dataLabels = Array.from({ length: displayedOHLC.length }, (_, i) => i);
      
      // Create line series for Open, High, Low, Close
      const configuration = {
        type: 'line',
        data: {
          labels: dataLabels,
          datasets: [
            {
              label: 'Close',
              data: displayedOHLC.map(d => d.c),
              borderColor: 'rgb(33, 150, 243)',
              backgroundColor: 'rgba(33, 150, 243, 0.1)',
              borderWidth: 2,
              fill: false,
              tension: 0.1,
              pointRadius: 1,
              order: 1
            },
            {
              label: 'High',
              data: displayedOHLC.map(d => d.h),
              borderColor: 'rgb(76, 175, 80)',
              backgroundColor: 'rgba(76, 175, 80, 0.05)',
              borderWidth: 1,
              fill: false,
              tension: 0.1,
              pointRadius: 0,
              borderDash: [5, 5],
              order: 2
            },
            {
              label: 'Low',
              data: displayedOHLC.map(d => d.l),
              borderColor: 'rgb(244, 67, 54)',
              backgroundColor: 'rgba(244, 67, 54, 0.05)',
              borderWidth: 1,
              fill: false,
              tension: 0.1,
              pointRadius: 0,
              borderDash: [5, 5],
              order: 3
            },
            {
              label: 'Open',
              data: displayedOHLC.map(d => d.o),
              borderColor: 'rgb(255, 152, 0)',
              backgroundColor: 'rgba(255, 152, 0, 0.05)',
              borderWidth: 1,
              fill: false,
              tension: 0.1,
              pointRadius: 0,
              order: 4
            }
          ]
        },
        options: {
          responsive: false,
          plugins: {
            title: {
              display: true,
              text: `${chartName} - Last ${displayedOHLC.length} bars (Total: ${ohlcData.length})`
            },
            legend: {
              display: true,
              position: 'top'
            }
          },
          scales: {
            x: {
              display: true,
              title: {
                display: true,
                text: 'Bar Index'
              }
            },
            y: {
              display: true,
              title: {
                display: true,
                text: `Price (range: ${minPrice}-${maxPrice})`
              }
            }
          }
        }
      };

      const image = await chartJSNodeCanvas.renderToBuffer(configuration as any, 'image/png');
      const fileName = `chart_${chartName.replace(/\s+/g, '_')}.png`;
      writeFileSync(fileName, image);
      console.log(`✓ OHLC chart saved to ${fileName}`);
    } catch (error) {
      console.error(`✗ Error generating ${chartName} chart:`, error);
    }
  }

  /**
   * Loads all CSV tick files from the given directory, sorted by date/time.
   * @param dataDir Path to the data directory
   * @returns Concatenated CSV content from all sorted files
   */
  loadCsvData(dataDir: string): string {
    const csvFiles = readdirSync(dataDir)
      .filter((f: string) => f.endsWith('_ticks.csv'))
      .sort((a: string, b: string) => {
        // Extract date-time part (YYYY-MM-DD--HH) from filename and sort lexicographically.
        const dateTimeA = a.substring(0, 13); // "2022-01-02--22"
        const dateTimeB = b.substring(0, 13);
        return dateTimeA.localeCompare(dateTimeB);
      });
  
    let allCsvData = '';
    for (const file of csvFiles) {
      const csvData = readFileSync(join(dataDir, file), 'utf8');

      allCsvData += csvData;

      if (!csvData.endsWith('\n'))
        allCsvData += '\n';
    }
  
    console.log(`Loaded ${csvFiles.length} CSV file(s): ${csvFiles.join(', ')}`);

    return allCsvData;
  }
}

run(IndicatorRunTest, wasmJs, 'dist/IndicatorTest.wasm');

