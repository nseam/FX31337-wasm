import { readFileSync, writeFileSync } from 'fs';

/**
 * Calculate RSI (Relative Strength Index) for a given column.
 * Uses Wilder's smoothing method.
 */
function calculateRSI(values, period) {
  const rsi = new Array(values.length).fill(null);

  if (values.length < period + 1) return rsi;

  // Calculate initial average gain and loss
  let avgGain = 0;
  let avgLoss = 0;

  for (let i = 1; i <= period; i++) {
    const change = values[i] - values[i - 1];
    if (change > 0) avgGain += change;
    else avgLoss += Math.abs(change);
  }

  avgGain /= period;
  avgLoss /= period;

  // First RSI value at index `period`
  if (avgLoss === 0) {
    rsi[period] = 100;
  } else {
    const rs = avgGain / avgLoss;
    rsi[period] = 100 - (100 / (1 + rs));
  }

  // Calculate subsequent RSI values using Wilder's smoothing
  for (let i = period + 1; i < values.length; i++) {
    const change = values[i] - values[i - 1];
    const gain = change > 0 ? change : 0;
    const loss = change < 0 ? Math.abs(change) : 0;

    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;

    if (avgLoss === 0) {
      rsi[i] = 100;
    } else {
      const rs = avgGain / avgLoss;
      rsi[i] = 100 - (100 / (1 + rs));
    }
  }

  return rsi;
}

function parseDate(dateStr) {
  // Format: "2022.01.03 00:00:00.000"
  const [datePart, timePart] = dateStr.split(' ');
  const [year, month, day] = datePart.split('.').map(Number);
  const [hours, minutes, secondsWithMs] = timePart.split(':');
  const [seconds, ms] = secondsWithMs.split('.').map(Number);

  return new Date(year, month - 1, day, Number(hours), Number(minutes), seconds, ms);
}

function formatMetaTraderDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  const ms = String(date.getMilliseconds()).padStart(3, '0');

  return `${year}.${month}.${day} ${hours}:${minutes}:${seconds}.${ms}`;
}

async function main() {
  const inputPath = './tests/data/aggregated-rsi.csv';
  const outputPath = './tests/data/aggregated-rsi-out.csv';
  const period = 14;

  console.log(`Reading: ${inputPath}`);
  const csvContent = readFileSync(inputPath, 'utf-8');
  const lines = csvContent.trim().split('\n');

  if (lines.length < 2) {
    console.error('CSV file has no data rows');
    return;
  }

  // Parse header to find column indices
  const header = lines[0].split(',').map(h => h.trim());
  const openIndex = header.indexOf('Close');
  if (openIndex === -1) {
    console.error("'Open' column not found in CSV header");
    return;
  }

  // Parse data rows
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(',').map(p => p.trim());
    if (parts.length < openIndex + 1) continue;

    rows.push({
      date: parseDate(parts[0]),
      close: parseFloat(parts[openIndex]),
      originalLine: parts
    });
  }

  console.log(`Parsed ${rows.length} data rows`);

  // Extract Open prices
  const openPrices = rows.map(r => r.close);

  // Calculate RSI
  console.log(`Calculating RSI with period=${period}...`);
  const rsiValues = calculateRSI(openPrices, period);

  // Write output CSV with RSI column appended
  const outHeader = header.join(',') + ',RSI(14)\n';
  const outRows = rows.map((row, idx) => {
    const rsiStr = rsiValues[idx] !== null ? rsiValues[idx].toFixed(2) : '';
    return row.originalLine.join(',') + ',' + rsiStr;
  });

  const outputCsv = outHeader + outRows.join('\n');

  console.log(`Writing to: ${outputPath}`);
  writeFileSync(outputPath, outputCsv, 'utf-8');

  console.log('\n✓ RSI calculation complete!');
  console.log(`\nFirst 5 rows with RSI:`);
  const previewLines = [outHeader.trim(), ...outRows.slice(0, 5)].join('\n');
  console.log(previewLines);
}

main().catch(console.error);
