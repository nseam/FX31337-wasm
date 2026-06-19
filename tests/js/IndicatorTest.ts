import { readFileSync, readdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { Test, run, LibModule } from '../../lib/Runner';
import { TesterValues } from '../../lib/types/TesterValues';
import { extractSeriesData, generateCandlestickChart } from './chart/Utils';
import { plotAsciiChart } from './chart/ChartExportAscii';
import { saveIndicatorChart } from './chart/ChartExportImage';

// @ts-ignore
import wasmJs from '../../dist/IndicatorTest';

const __debug__ = false;

class IndicatorRunTest extends Test {
  async run(lib: LibModule): Promise<void> {
    lib.Tester.Init();

    const ticker = new lib.indicators.TickProvider({ symbol: 'EURUSD' });

    const tfM1 = new lib.indicators.Tf(lib.timeframes.M1);
    tfM1.SetSource(ticker);

    const rsiM1 = new lib.indicators.RSI({ period: 14, appliedPrice: lib.ap.close, shift: 0 });
    rsiM1.SetName('RSI M1');
    rsiM1.SetSource(tfM1);

    const appliedPriceM1 = new lib.indicators.AppliedPrice({ appliedPrice: lib.ap.close, shift: 0 });
    appliedPriceM1.SetName('Applied Price M1');
    appliedPriceM1.SetSource(tfM1);

    lib.Tester.Add(rsiM1);
    //lib.Tester.Add(appliedPriceM1);

    // Load all CSV files from data folder sorted by date/time.
    const dataDir = join(dirname(fileURLToPath(import.meta.url)), '../data');
    const csvData = this.loadCsvData(dataDir);
    lib.Tester.FeedTickProviderCsv(ticker, csvData);

    // Process all ticks through the indicator pipeline.
    lib.Tester.RunAllTicks();

    // Generate chart for M1 input bars
    await generateCandlestickChart(lib, tfM1, 'M1 Candles');

    // Retrieve all ungrouped (raw, bar-by-bar) indicator values.
    // Passing 0n for both parameters means: all available history, up to most recent bar.
    const testerValues: TesterValues = lib.Tester.GetValues(BigInt(0), BigInt(0), 0, false);

    for (const col of testerValues.timestep_based) {
      const name = col.indicator_info?.name ?? 'Unknown';
      const seriesData = extractSeriesData(col);

      if (seriesData.series.length < 2) {
        console.log(`\n=== ${name} — insufficient data (${seriesData.series.length} point(s)) ===`);
        continue;
      }

      plotAsciiChart(name, seriesData);

      if (__debug__) {
        console.log(JSON.stringify(col.values, (key, value) => {
            value = (typeof value === "bigint" ? Number(value) : value);

            if (key == 'timestamp')
              value = new Date(value * 1000).toISOString().replace('T', ' ').replace('Z', '').replace(/-/g, '.').replace(/:/g, '.');
            else if (typeof value === 'number')
              value = value.toFixed(5);

            return value;
          },
          2
        ));
      }


      try {
        await saveIndicatorChart(name, seriesData);
      } catch (error) {
        console.error(`✗ Error generating chart for ${name}:`, error);
      }
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

