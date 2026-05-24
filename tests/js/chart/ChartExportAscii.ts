import * as asciichart from 'asciichart';
import { SeriesData } from './Utils';
import { asciiChartOptions } from './ChartExportAsciiSettings';

export function plotAsciiChart(name: string, seriesData: SeriesData): void {
  console.log(`\n=== ${name}  |  ${seriesData.series.length} bars (showing last ${seriesData.displayedSeries.length})  |  min=${seriesData.min}  max=${seriesData.max} ===`);
  console.log(asciichart.plot(seriesData.displayedSeries, asciiChartOptions));
}
