import { IndicatorDataEntry } from './IndicatorDataEntry';
import { TesterIndicatorInfo } from './TesterIndicatorInfo';

/**
 * A single time-column entry returned by Tester.GetValues(). Groups all
 * indicator output values that fall within the same time-step bucket.
 *
 * Returned as a plain JS object (not an Emscripten heap object), so no
 * .delete() call is required.
 */
export interface TesterValuesColumns {
  /** Details about the indicator this column belongs to. */
  indicator_info: TesterIndicatorInfo;
  /** Centre timestamp of this column in milliseconds. */
  time_ms: number;
  /** Aggregated per-output values for this column. */
  values: IndicatorDataEntry[];
}
