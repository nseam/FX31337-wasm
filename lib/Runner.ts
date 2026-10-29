import { Tester } from './types/Tester';
import { TickAB } from './types/TickAB';
import { TickTAB } from './types/TickTAB';
import { IndicatorDataEntry } from './types/IndicatorDataEntry';
import { timeframes } from '.';
import { type IndicatorTf } from './types/Indicators/IndicatorTf';
import { type IndicatorData } from './types/Indicators/IndicatorData';
import { type Indi_TickProvider } from './types/Indicators/Indi_TickProvider';
import { Indi_AppliedPrice } from './types/Indicators/Indi_AppliedPrice';
import { Indi_MA } from './types/Indicators/Indi_MA';
import { Indi_RSI } from './types/Indicators/Indi_RSI';
import { Indi_OHLC } from './types/Indicators/Indi_OHLC';
import { Indi_MACD } from './types/Indicators/Indi_MACD';
import { Indi_Stochastic } from './types/Indicators/Indi_Stochastic';
import { Indi_WPR } from './types/Indicators/Indi_WPR';
import { Indi_Alligator } from './types/Indicators/Indi_Alligator';
import { Indi_Bands } from './types/Indicators/Indi_Bands';
import { Indi_Envelopes } from './types/Indicators/Indi_Envelopes';
import { Indi_Pivot } from './types/Indicators/Indi_Pivot';
import { Indi_SAR } from './types/Indicators/Indi_SAR';
import { Indi_Universal } from './types/Indicators/Indi_Universal';

export type LibModuleDefaults = {
  [key: string]: any;
  TickAB: typeof TickAB;
  TickTAB: typeof TickTAB;
  IndicatorDataEntry: typeof IndicatorDataEntry;
  indicators: {
    TickProvider: typeof Indi_TickProvider;
    Tf: typeof IndicatorTf;
    RSI: typeof Indi_RSI;
    MA: typeof Indi_MA;
    AppliedPrice: typeof Indi_AppliedPrice;
    OHLC: typeof Indi_OHLC;
    MACD: typeof Indi_MACD;
    Stochastic: typeof Indi_Stochastic;
    WPR: typeof Indi_WPR;
    Alligator: typeof Indi_Alligator;
    Bands: typeof Indi_Bands;
    Envelopes: typeof Indi_Envelopes;
    Pivot: typeof Indi_Pivot;
    SAR: typeof Indi_SAR;
    Universal: typeof Indi_Universal;
  };
  timeframes: typeof timeframes;
  ap: {
    open: number;
    high: number;
    low: number;
    close: number;
  },
  ma_methods: {
    SMA: number;
    EMA: number;
    SMMA: number;
    LWMA: number;
  };
  sto_prices: {
    LOWHIGH: number;
    CLOSECLOSE: number;
  };
  idata: {
    value_range: {
      IDATA_RANGE_BINARY: number;
      IDATA_RANGE_BITWISE: number;
      IDATA_RANGE_MIXED: number;
      IDATA_RANGE_PRICE: number;
      IDATA_RANGE_PRICE_DIFF: number;
      IDATA_RANGE_PRICE_ON_SIGNAL: number;
      IDATA_RANGE_RANGE: number;
      IDATA_RANGE_UNKNOWN: number;
    };
  };
  pivot_methods: {
    CAMARILLA: number;
    CLASSIC: number;
    FIBONACCI: number;
    WOODIE: number;
  };
  Tester: typeof Tester
}

export type LibModule = LibModuleDefaults;

export type ContentJsLoader = (moduleArg?: {}) => Promise<{}>;

export class Test {
  run(lib: LibModule): void {}
}

function set(schema: Record<string, any>, path: string, value: any, delimiter: string = '.'): void {
  const pList = path.split(delimiter);
  const len = pList.length;
  for (let i = 0; i < len - 1; i++) {
    const elem = pList[i];
    if (!schema[elem]) schema[elem] = {};
    schema = schema[elem];
  }
  schema[pList[len - 1]] = value;
}

/**
 * Credits: https://github.com/emscripten-core/emscripten/issues/5874#issuecomment-348141138
 *
 * Generates an object that corresponds to the namespaces in c++
 * if classes are exported like this
 * EMSCRIPTEN_BINDINGS(MyClass) {
 *  class_< a::b::c::MyClass >("a.b.c.MyClass")
 *  //..
 *  }
 */
function namespaces(module: LibModule): LibModule {
  const ns: LibModule = {};
  const filtered = Object.keys(module).filter(k => k.indexOf('$') !== -1);
  for (const key of filtered) {
    set(ns, key, module[key], '$');
  }
  return ns;
}

export async function runTest(
  what: new () => Test,
  contentJs?: string | ContentJsLoader,
  contentWasm?: string,
  existingInstance?: Test
): Promise<void> {
  if (typeof contentJs !== 'function') {
    return;
  }
  let lib: LibModule = await contentJs({
    print: (...args) => {
      console.log(...args);
    },
    printErr: (...args) => {
      console.error(...args);
    },

    locateFile(path: string): string {
      if (path.endsWith('.wasm') && !path.endsWith('.debug.wasm') && contentWasm) {
        return contentWasm;
      }
      return path;
    },
  });

  lib = { ...lib, ...namespaces(lib) };

  lib['TickAB'] = TickAB;
  lib['TickTAB'] = TickTAB;

  const test = existingInstance ?? new what();
  
  test.run(lib);
}

export async function run(
  what: new () => Test,
  contentJs?: string | ContentJsLoader,
  contentWasm?: string,
  existingInstance?: Test
): Promise<void> {
  return await runTest(what, contentJs, contentWasm, existingInstance);
}
