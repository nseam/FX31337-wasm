import { writeFileSync } from 'fs';
import { ChartJSNodeCanvas } from 'chartjs-node-canvas';
import { SeriesData } from './Utils';
import { getIndicatorChartConfig } from './ChartExportImageSettings';

export async function saveIndicatorChart(name: string, seriesData: SeriesData): Promise<void> {
  const width = 1024;
  const height = 512;
  const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height });

  const dataLabels = Array.from({ length: seriesData.displayedSeries.length }, (_, i) => i);
  const configuration = getIndicatorChartConfig(name, seriesData.displayedSeries, seriesData.series, seriesData.min, seriesData.max, dataLabels);

  const image = await chartJSNodeCanvas.renderToBuffer(configuration as any, 'image/png');
  const fileName = `chart_${name.replace(/\s+/g, '_')}.png`;
  writeFileSync(fileName, image);
  console.log(`✓ Chart image saved to ${fileName}`);
}
