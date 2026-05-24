/**
 * Represents a single tick record from CSV
 */
export interface TickRecord {
  date: Date;
  bidPrice: number;
  askPrice: number;
  volume: number;
  spread: number;
}

/**
 * Represents a minute-aggregated OHLC bar
 */
export interface OHLCBar {
  date: string;
  firstBidPrice: number;
  highestBidPrice: number;
  lowestBidPrice: number;
  lastBidPrice: number;
  totalVolume: number;
}

/**
 * Parse CSV data with columns: Date, Bid Price, Ask Price, Volume, Spread
 * @param csvContent CSV content as string
 * @returns Array of parsed tick records
 */
export function parseTickCsv(csvContent: string): TickRecord[] {
  const lines = csvContent.trim().split('\n');
  if (lines.length < 2) {
    throw new Error('CSV must contain at least a header and one data row');
  }

  // Skip header line
  const records: TickRecord[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const parts = line.split(',').map(p => p.trim());
    if (parts.length < 5) continue;

    records.push({
      date: new Date(parts[0]),
      bidPrice: parseFloat(parts[1]),
      askPrice: parseFloat(parts[2]),
      volume: parseFloat(parts[3]),
      spread: parseFloat(parts[4])
    });
  }

  return records;
}

/**
 * Group tick records by minute and calculate OHLC values from Bid prices
 * @param records Array of tick records
 * @returns Array of minute-aggregated OHLC bars
 */
export function aggregateToOHLC(records: TickRecord[]): OHLCBar[] {
  if (records.length === 0) {
    return [];
  }

  // Sort records by date to ensure chronological order
  records.sort((a, b) => a.date.getTime() - b.date.getTime());

  const barMap = new Map<string, TickRecord[]>();

  // Group ticks by minute
  for (const record of records) {
    const minute = new Date(record.date);
    minute.setSeconds(0, 0); // Reset to start of minute
    const key = minute.toISOString();

    if (!barMap.has(key)) {
      barMap.get(key) || barMap.set(key, []);
    }
    barMap.get(key)!.push(record);
  }

  // Calculate OHLC for each minute
  const bars: OHLCBar[] = [];
  for (const [dateKey, ticks] of Array.from(barMap.entries()).sort()) {
    if (ticks.length === 0) continue;

    const bidPrices = ticks.map(t => t.bidPrice);
    const bar: OHLCBar = {
      date: dateKey,
      firstBidPrice: ticks[0].bidPrice,
      highestBidPrice: Math.max(...bidPrices),
      lowestBidPrice: Math.min(...bidPrices),
      lastBidPrice: ticks[ticks.length - 1].bidPrice,
      totalVolume: ticks.reduce((sum, t) => sum + t.volume, 0)
    };
    bars.push(bar);
  }

  return bars;
}

/**
 * Convert OHLC bars back to CSV format
 * @param bars Array of OHLC bars
 * @returns CSV string
 */
export function ohlcToCSV(bars: OHLCBar[]): string {
  const header = 'Date,First Bid Price,Highest Bid Price,Lowest Bid Price,Last Bid Price,Total Volume\n';
  const rows = bars.map(
    bar =>
      `${bar.date},${bar.firstBidPrice},${bar.highestBidPrice},${bar.lowestBidPrice},${bar.lastBidPrice},${bar.totalVolume}`
  );
  return header + rows.join('\n');
}

/**
 * Main function: process CSV tick data to minute-based OHLC bars
 * @param csvContent Input CSV content with tick data
 * @returns CSV string with OHLC bars
 */
export function processTickDataToOHLC(csvContent: string): string {
  const records = parseTickCsv(csvContent);
  const bars = aggregateToOHLC(records);
  return ohlcToCSV(bars);
}
