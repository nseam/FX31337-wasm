import { IndicatorData } from './Indicators/IndicatorData';
import { Indi_TickProvider } from './Indicators/Indi_TickProvider';
import { TesterValuesFetchParams } from './TesterValuesFetchParams';
import { TesterValues } from './TesterValues';
import { TesterValuesColumns } from './TesterValuesColumns';

/**
 * Tester class for backtesting indicators.
 *
 * Allows adding indicators, feeding them with tick data, running historical ticks,
 * and retrieving aggregated indicator values for visualization and analysis.
 */
export class Tester {
  /**
   * Initializes the Tester and underlying platform.
   * Must be called once before using other Tester methods.
   */
  public static Init(): void {}

  /**
   * Adds an indicator to the Tester for testing.
   * The indicator must have its candle/tick sources already configured.
   *
   * @param indicator The indicator to add (must have source bindings set up).
   */
  public static Add(indicator: IndicatorData): void {}

  /**
   * Adds an indicator using the default candle and tick indicators for the given symbol/timeframe.
   *
   * Under Emscripten, the default tick indicator is TickProvider. After calling this method,
   * the TickProvider must be fed with actual tick data via FeedTickProvider().
   *
   * @param indicator The indicator to add.
   * @param symbol Symbol pair (e.g. "EURUSD").
   * @param tf Timeframe constant (e.g. from lib.timeframes).
   */
  public static AddPlatformWise(indicator: IndicatorData, symbol: string, tf: number): void {}

  /**
   * Feeds a TickProvider indicator with tick data parsed from a CSV string.
   *
   * CSV format (no header row): Date,Bid,Ask,Volume,Spread
   * Date format: YYYY.MM.DD HH:MM:SS.mmm (UTC)
   * Volume and Spread columns are accepted but ignored.
   *
   * @param tickProvider The TickProvider indicator to feed.
   * @param csv Raw CSV text with no header row.
   */
  public static FeedTickProviderCsv(tickProvider: Indi_TickProvider, csv: string): void {}

  /**
   * Feeds the default tick provider for a given symbol with tick data.
   *
   * @param tickProvider A TickProvider indicator instance to feed.
   */
  public static FeedTickProvider(tickProvider: Indi_TickProvider): void {}

  /**
   * Processes all remaining ticks in the system.
   * Blocks until all ticks are consumed by all indicators.
   */
  public static RunAllTicks(): void {}

  /**
   * Processes a single tick through all indicators.
   *
   * @returns `true` if a tick was processed, `false` if no more ticks are available.
   */
  public static RunTick(): boolean { return false; }

  /**
   * Retrieves aggregated indicator values for the given time range.
   *
   * Values are grouped into time-step columns. When multiple indicator values
   * fall within the same column, they are aggregated into open/high/low/close/average.
   * TF-based indicators (regular candles) are returned in `timestep_based`.
   * Non-TF indicators (e.g., Renko) are returned in `loose`.
   *
   * @param timeFromMs Start of the range in milliseconds (inclusive).
   * @param timeToMs End of the range in milliseconds (inclusive).
   * @param timeStepSecs Column width in seconds. Values within one column are aggregated.
   * @param aggregateNoFits Whether to aggregate loose-TF values (default: true).
   * @returns Object with `timestep_based` and `loose` column arrays.
   */
  public static GetValues(
    timeFromMs: bigint,
    timeToMs: bigint,
    timeStepSecs: number,
    aggregateNoFits?: boolean
  ): TesterValues { return { timestep_based: [], loose: [] }; }

  /**
   * Retrieves aggregated indicator values using pre-built parameters.
   *
   * Equivalent to GetValues() but takes a single TesterValuesFetchParams object
   * (which can be created via GetTimeByScrollAndZoom()).
   *
   * @param params Fetch parameters object with timeFromMs, timeToMs, timeStepSecs.
   * @param aggregateNoFits Whether to aggregate loose-TF values (default: true).
   * @returns Object with `timestep_based` and `loose` column arrays.
   */
  public static GetValuesByParams(
    params: TesterValuesFetchParams,
    aggregateNoFits?: boolean
  ): TesterValues { return { timestep_based: [], loose: [] }; }

  /**
   * Converts a scroll/zoom/viewport combination into fetch parameters.
   *
   * Base interval for zoom 1 is 1 minute. Zoom 2 means 60s / 2 = 30s per column.
   * Scroll 0.0 represents the oldest visible data point.
   *
   * @param scroll Scroll offset (0 = start of visible range).
   * @param zoom Zoom level (1 = 1 minute per column). Higher values = shorter intervals.
   * @param visibleIntervals Number of columns visible in the viewport.
   * @returns Parameters ready for GetValues() or GetValuesByParams().
   */
  public static GetTimeByScrollAndZoom(
    scroll: number,
    zoom: number,
    visibleIntervals: number
  ): TesterValuesFetchParams { return new TesterValuesFetchParams(); }

  /**
   * Retrieves raw (ungrouped) values for a single indicator without time-step aggregation.
   *
   * Each valid bar produces one `TesterValuesColumnValue` per output mode, in chronological
   * order (oldest first). Suitable for direct series rendering.
   *
   * @param indicator The indicator to retrieve values from.
   * @param timeFromMs Start of range in ms; pass `0n` to retrieve all available history.
   * @param timeToMs End of range in ms; pass `0n` to retrieve up to the most recent bar.
   * @returns Column object with `indicator_info` and `values` array.
   */
  public static GetIndicatorColumnsUngrouped(
    indicator: IndicatorData,
    timeFromMs: bigint,
    timeToMs: bigint
  ): TesterValuesColumns { return { indicator_info: { name: '', index: 0, num_values: 0, symbol: '', tf: 0 }, time_ms: 0, values: [] }; }

  /**
   * Retrieves raw (ungrouped) values for every non-candle, non-tick indicator on the platform.
   *
   * Returns one entry per indicator. Each entry's `values` array contains one
   * `TesterValuesColumnValue` per valid bar per output mode, in chronological order.
   * For multi-mode indicators output names are suffixed: `"RSI[0]"`, `"RSI[1]"`, etc.
   *
   * @param timeFromMs Start of range in ms; pass `0n` to retrieve all available history.
   * @param timeToMs End of range in ms; pass `0n` to retrieve up to the most recent bar.
   * @returns Array of column objects, one per indicator.
   */
  public static GetAllIndicatorColumnsUngrouped(
    timeFromMs: bigint,
    timeToMs: bigint
  ): TesterValuesColumns[] { return []; }
}
