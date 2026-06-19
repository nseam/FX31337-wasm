import { readFileSync, writeFileSync } from 'fs';

/**
 * Calculate RSI (Relative Strength Index) using Wilder's smoothing method.
 */
function calculateRSI(values, period) {
  const rsi = new Array(values.length).fill(null);

  if (values.length < period + 1) return rsi;

  let avgGain = 0;
  let avgLoss = 0;

  for (let i = 1; i <= period; i++) {
    const change = values[i] - values[i - 1];
    if (change > 0) avgGain += change;
    else avgLoss += Math.abs(change);
  }

  avgGain /= period;
  avgLoss /= period;

  if (avgLoss === 0) {
    rsi[period] = 100;
  } else {
    const rs = avgGain / avgLoss;
    rsi[period] = 100 - (100 / (1 + rs));
  }

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
  const outputPath = './tests/data/aggregated-rsi-verified.csv';
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
  const closeIndex = header.indexOf('Close');
  const rsiIndex = header.indexOf('RSI(14)');

  if (closeIndex === -1) {
    console.error("'Close' column not found in CSV header");
    return;
  }

  // Parse data rows
  const dates = [];
  const closeValues = [];
  const existingRsi = [];

  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(',').map(p => p.trim());
    if (parts.length === 0) continue;

    dates.push(parts[0]);
    closeValues.push(parseFloat(parts[closeIndex]));

    // Existing RSI value (may be empty for first `period` rows)
    const existingVal = rsiIndex !== -1 && parts[rsiIndex] && parts[rsiIndex].length > 0
      ? parseFloat(parts[rsiIndex])
      : null;
    existingRsi.push(existingVal);
  }

  // Calculate RSI from Close column
  console.log(`Calculating RSI(${period}) from ${closeValues.length} Close values...`);
  const calculatedRsi = calculateRSI(closeValues, period);

  // Write output with separate columns for comparison
  const outHeader = `${header.join(',')},RSI(14)-calculated`;
  const outLines = [outHeader];

  let mismatches = 0;
  let comparedCount = 0;

  for (let i = 0; i < dates.length; i++) {
    const calculatedVal = calculatedRsi[i] !== null ? calculatedRsi[i].toFixed(2) : '';
    outLines.push(`${dates[i]},${closeValues[i].toFixed(5)},${existingRsi[i] !== null ? existingRsi[i].toFixed(2) : ''},${calculatedVal}`);

    // Compare if both exist
    if (existingRsi[i] !== null && calculatedRsi[i] !== null) {
      comparedCount++;
      const diff = Math.abs(existingRsi[i] - calculatedRsi[i]);
      if (diff > 0.01) {
        mismatches++;
        if (mismatches <= 20) {
          console.log(`  MISMATCH row ${i + 1} (${dates[i]}): existing=${existingRsi[i].toFixed(2)} calculated=${calculatedRsi[i].toFixed(2)} diff=${diff.toFixed(4)}`);
        }
      }
    }
  }

  console.log(`\nComparison: ${comparedCount} rows had both values.`);
  console.log(`Mismatches (diff > 0.01): ${mismatches}`);

  if (mismatches === 0) {
    console.log('\n✓ All RSI(14) values match!');
  } else {
    console.log(`\n⚠ Found ${mismatches} mismatch(es). See above for details.`);
  }

  // Write full output CSV (preserving original columns + adding calculated column)
  const outFullLines = [lines[0]]; // original header
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(',').map(p => p.trim());
    const calculatedVal = calculatedRsi[i - 1] !== null ? calculatedRsi[i - 1].toFixed(2) : '';
    outFullLines.push(`${lines[i]},${calculatedVal}`);
  }

  console.log(`\nWriting full verified CSV to: ${outputPath}`);
  writeFileSync(outputPath, outFullLines.join('\n') + '\n', 'utf-8');

  // Also write a compact comparison-only CSV
  const compPath = './tests/data/aggregated-rsi-compare.csv';
  const compHeader = 'Date,Close,RSI(14)-existing,RSI(14)-calculated';
  const compLines = [compHeader];
  for (let i = 0; i < dates.length; i++) {
    compLines.push(`${dates[i]},${closeValues[i].toFixed(5)},${existingRsi[i] !== null ? existingRsi[i].toFixed(2) : ''},${calculatedRsi[i] !== null ? calculatedRsi[i].toFixed(2) : ''}`);
  }
  console.log(`Writing compact comparison CSV to: ${compPath}`);
  writeFileSync(compPath, compLines.join('\n') + '\n', 'utf-8');

  // Print first rows with RSI values for quick visual check
  console.log('\n--- First 20 rows with RSI values (Date, Close, Existing, Calculated) ---');
  const startIdx = Math.max(1, period);
  const endIdx = Math.min(startIdx + 20, dates.length);
  for (let i = startIdx; i < endIdx; i++) {
    console.log(`  ${dates[i]} | Close=${closeValues[i].toFixed(5)} | existing=${existingRsi[i]?.toFixed(2) ?? 'N/A'} | calculated=${calculatedRsi[i]?.toFixed(2) ?? 'N/A'}`);
  }
}

main().catch(console.error);
