import { EmStruct } from './EmStruct';
import { ENUM_IDATA_VALUE_RANGE } from './enums/ENUM_IDATA_VALUE_RANGE';

/**
 * Details about a given indicator, as retrieved from Tester.GetValues().
 */
export class TesterIndicatorInfo extends EmStruct {
  /** Name of the indicator. */
  name: string = '';
  /** Index of the indicator in the Platform. */
  index: number = 0;
  /** Number of values calculated for this indicator. */
  num_values: number = 0;
  /** Symbol pair the indicator works on. */
  symbol: string = '';
  /** Number of digits after the decimal point for the symbol. */
  symbol_digits: number = 0;
  /** Time-frame the indicator works on (ENUM_TIMEFRAMES integer value). */
  tf: number = 0;
  /** Data type of the indicator (ENUM_DATATYPE integer value). */
  data_type: number = 0;
  /** Value range of the indicator (ENUM_IDATA_VALUE_RANGE integer value). */
  value_range: ENUM_IDATA_VALUE_RANGE = 0;
  /** Color of the indicator. */
  color: number = 0;
}
