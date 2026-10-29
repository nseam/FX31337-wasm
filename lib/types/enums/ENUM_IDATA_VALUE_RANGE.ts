export enum ENUM_IDATA_VALUE_RANGE {
    IDATA_RANGE_BINARY,   // E.g. 0 or 1.
    IDATA_RANGE_BITWISE,  // Bitwise
    IDATA_RANGE_MIXED,
    IDATA_RANGE_PRICE,            // Values represent price.
    IDATA_RANGE_PRICE_DIFF,       // Values represent price differences.
    IDATA_RANGE_PRICE_ON_SIGNAL,  // Values represent price on signal, otherwise zero.
    IDATA_RANGE_RANGE,            // E.g. 0 to 100.
    IDATA_RANGE_UNKNOWN
}

export function ENUM_IDATA_VALUE_RANGE_ToString(value: ENUM_IDATA_VALUE_RANGE): string {
  switch (value) {
    case ENUM_IDATA_VALUE_RANGE.IDATA_RANGE_UNKNOWN: return "UNKNOWN";
    case ENUM_IDATA_VALUE_RANGE.IDATA_RANGE_BINARY: return "BINARY";
    case ENUM_IDATA_VALUE_RANGE.IDATA_RANGE_BITWISE: return "BITWISE";
    case ENUM_IDATA_VALUE_RANGE.IDATA_RANGE_MIXED: return "MIXED";
    case ENUM_IDATA_VALUE_RANGE.IDATA_RANGE_PRICE: return "PRICE";
    case ENUM_IDATA_VALUE_RANGE.IDATA_RANGE_PRICE_DIFF: return "PRICE_DIFF";
    case ENUM_IDATA_VALUE_RANGE.IDATA_RANGE_PRICE_ON_SIGNAL: return "PRICE_ON_SIGNAL";
    case ENUM_IDATA_VALUE_RANGE.IDATA_RANGE_RANGE: return "RANGE";
    default: return "UNKNOWN";
  }
}