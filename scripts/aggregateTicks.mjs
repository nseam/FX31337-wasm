import { readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

function parseMetaTraderDate(dateStr) {
  // Format: "2022.01.02 22:03:54.650"
  const [datePart, timePart] = dateStr.split(' ');
  const [year, month, day] = datePart.split('.').map(Number);
  const [hours, minutes, secondsWithMs] = timePart.split(':');
  const [seconds, ms] = secondsWithMs.split('.').map(Number);
  
  return new Date(year, month - 1, day, Number(hours), Number(minutes), seconds, ms);
}

function formatMetaTraderDate(date) {
  // Format: "2022.01.02 22:03:54.000"
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  const ms = String(date.getMilliseconds()).padStart(3, '0');
  
  return `${year}.${month}.${day} ${hours}:${minutes}:${seconds}.${ms}`;
}

function parseTickCsv(csvContent) {
  const lines = csvContent.trim().split('\n');
  const records = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const parts = trimmed.split(',').map(p => p.trim());
    if (parts.length < 5) continue;

    try {
      records.push({
        date: parseMetaTraderDate(parts[0]),
        bidPrice: parseFloat(parts[1]),
        askPrice: parseFloat(parts[2]),
        volume: parseFloat(parts[3]),
        spread: parseFloat(parts[4])
      });
    } catch (e) {
      console.warn(`Failed to parse line: ${line}`);
    }
  }

  return records;
}

function aggregateToOHLC(records) {
  if (records.length === 0) {
    return [];
  }

  // Sort records by date
  records.sort((a, b) => a.date.getTime() - b.date.getTime());

  const barMap = new Map();

  // Group ticks by minute
  for (const record of records) {
    const minute = new Date(record.date);
    minute.setSeconds(0, 0);
    const key = minute.getTime();

    if (!barMap.has(key)) {
      barMap.set(key, []);
    }
    barMap.get(key).push(record);
  }

  // Calculate OHLC for each minute
  const bars = [];
  const sortedKeys = Array.from(barMap.keys()).sort((a, b) => a - b);

  for (const timeKey of sortedKeys) {
    const ticks = barMap.get(timeKey);
    if (ticks.length === 0) continue;

    const bidPrices = ticks.map(t => t.bidPrice);
    const date = new Date(timeKey);
    const bar = {
      date: date,
      open: ticks[0].bidPrice,
      high: Math.max(...bidPrices),
      low: Math.min(...bidPrices),
      close: ticks[ticks.length - 1].bidPrice,
      volume: ticks.reduce((sum, t) => sum + t.volume, 0)
    };
    bars.push(bar);
  }

  return bars;
}

function ohlcToCSV(bars) {
  const header = 'Date,Open,High,Low,Close,Volume\n';
  const rows = bars.map(
    bar =>
      `${formatMetaTraderDate(bar.date)},${bar.open.toFixed(5)},${bar.high.toFixed(5)},${bar.low.toFixed(5)},${bar.close.toFixed(5)},${bar.volume.toFixed(2)}`
  );
  return header + rows.join('\n');
}

async function main() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);

  const inputPath = join(__dirname, '../tests/data/2022-01-02--22h_ticks.csv');
  const outputPath = join(__dirname, '../tests/data/2022-01-02--22h_ohlc.csv');

  console.log(`Reading: ${inputPath}`);
  const csvContent = readFileSync(inputPath, 'utf-8');
  
  console.log('Parsing tick data...');
  const records = parseTickCsv(csvContent);
  console.log(`Parsed ${records.length} tick records`);

  console.log('Aggregating to OHLC...');
  const bars = aggregateToOHLC(records);
  console.log(`Generated ${bars.length} minute bars`);

  console.log('Converting to CSV...');
  const ohlcCsv = ohlcToCSV(bars);

  console.log(`Writing to: ${outputPath}`);
  writeFileSync(outputPath, ohlcCsv, 'utf-8');

  console.log('\n✓ Aggregation complete!');
  console.log(`\nFirst 5 bars:`);
  console.log(ohlcCsv.split('\n').slice(0, 6).join('\n'));
}

main().catch(console.error);
