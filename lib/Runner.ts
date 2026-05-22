import { Tester } from './types/Tester';
import { TickAB } from './types/TickAB';
import { TickTAB } from './types/TickTAB';
import { IndicatorDataEntry } from './types/IndicatorDataEntry';
import { timeframes } from '.';
import { type IndicatorTf } from './types/Indicators/IndicatorTf';
import { type IndicatorData } from './types/Indicators/IndicatorData';
import { type Indi_TickProvider } from './types/Indicators/Indi_TickProvider';

export type LibModuleDefaults = {
  [key: string]: any;
  TickAB: typeof TickAB;
  TickTAB: typeof TickTAB;
  IndicatorDataEntry: typeof IndicatorDataEntry;
  indicators: {
    TickProvider: typeof Indi_TickProvider;
    Tf: typeof IndicatorTf;
    RSI: typeof IndicatorData;
  };
  timeframes: typeof timeframes;
  ap: {
    open: number;
    high: number;
    low: number;
    close: number;
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
  contentWasm?: string
): Promise<void> {
  if (typeof contentJs !== 'function') {
    return;
  }
  let lib: LibModule = await contentJs({
    // Suppress all C++ Print() output to keep the terminal clean.
    print: () => {},
    printErr: () => {},
    locateFile(path: string): string {
      if (path.endsWith('.wasm') && contentWasm) {
        return contentWasm;
      }
      return path;
    },
  });

  lib = { ...lib, ...namespaces(lib) };

  lib['TickAB'] = TickAB;
  lib['TickTAB'] = TickTAB;

  const test = new what();
  test.run(lib);
}

export function run(
  what: new () => Test,
  contentJs?: string | ContentJsLoader,
  contentWasm?: string
): void {
  runTest(what, contentJs, contentWasm).then(() => {});
}
