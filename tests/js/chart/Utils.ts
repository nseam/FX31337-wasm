import { writeFileSync } from 'fs';
import { ChartJSNodeCanvas } from 'chartjs-node-canvas';
import { getCandlestickChartConfig } from './ChartExportImageSettings';

export interface SeriesData {
  series: number[];
  displayedSeries: number[];
  min: string;
  max: string;
}

export function extractSeriesData(col: any, maxBarsToShow: number = 100): SeriesData {
  const series: number[] = (col.values as any[]).map((v: any) => v.values[0]);
  const displayedSeries = series.slice(-maxBarsToShow);
  const min = Math.min(...displayedSeries).toFixed(5);
  const max = Math.max(...displayedSeries).toFixed(5);
  return { series, displayedSeries, min, max };
}

export async function generateCandlestickChart(lib: any, tfIndicator: any, chartName: string): Promise<void> {
  try {
    const barData = lib.Tester.GetIndicatorColumnsUngrouped(tfIndicator, BigInt(0), BigInt(0));

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

    console.log(JSON.stringify(ohlcData, (key, value) => {
        value = (typeof value === "bigint" ? Number(value) : value);

        if (key === 'o' || key === 'h' || key === 'l' || key === 'c')
          value = parseFloat(value).toFixed(5);
        else if (key === 'x')
          // Converting timestamp into `2022.01.02 22:03:00.000` format.
          value = new Date(value * 1000).toISOString().replace('T', ' ').replace('Z', '').replace(/-/g, '.').replace(/:/g, '.');
        
        return value;
      },
      2
    ));

    const maxBarsToShow = 100;
    const displayedOHLC = ohlcData.slice(-maxBarsToShow);

    const minPrice = Math.min(...displayedOHLC.map(d => d.l)).toFixed(5);
    const maxPrice = Math.max(...displayedOHLC.map(d => d.h)).toFixed(5);

    console.log(`\n=== ${chartName}  |  ${ohlcData.length} bars (showing last ${displayedOHLC.length})  |  low=${minPrice}  high=${maxPrice} ===`);

    const width = 1024;
    const height = 512;
    const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height });

    const dataLabels = Array.from({ length: displayedOHLC.length }, (_, i) => i);
    const configuration = getCandlestickChartConfig(chartName, displayedOHLC, ohlcData, minPrice, maxPrice, dataLabels);

    const image = await chartJSNodeCanvas.renderToBuffer(configuration as any, 'image/png');
    const fileName = `chart_${chartName.replace(/\s+/g, '_')}.png`;
    writeFileSync(fileName, image);
    console.log(`✓ OHLC chart saved to ${fileName}`);
  } catch (error) {
    console.error(`✗ Error generating ${chartName} chart:`, error);
  }
}
