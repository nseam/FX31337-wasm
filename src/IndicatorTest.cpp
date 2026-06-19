//+------------------------------------------------------------------+
//|                                                     FX31337 wasm |
//|                                 Copyright 2022-2022, EA31337 Ltd |
//|                          https://github.com/FX31337/FX31337-wasm |
//+------------------------------------------------------------------+

/*
 * This file is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * @file
 * Task runner.
 */

// Includes
#ifdef __EMSCRIPTEN__
#include <emscripten/bind.h>
#include <emscripten/emscripten.h>
#endif
//#define __debug__
//#define __debug_indicator__
//#define __debug_emscripten__
//#define __debug_verbose__

// Local includes.
#include "classes/Tester/Tester.h"

#define INDICATOR_TEST_SYMBOL "EURUSD"
#define INDICATOR_TEST_TIMEFRAME PERIOD_M1

/*

 Example in JS:

 const tester = new lib.Tester('EURUSD', lib.timeframes.M5);
 const ticks  = new lib.indicators.TickProvider();
 const rsi    = new lib.indicators.RSI(13);

 tester.Add(rsi);

 // Note that all timeframes shares the same ticks and so you may reuse single
 // TickProvider indicator for other Tester instances for the same symbols pair.
 ticks.Add([
   {timestamp: ..., ask: ..., bid: ...},
   {timestamp: ..., ask: ..., bid: ...}
 ]);

 // You can also use tester.RunTick() method in a loop or if you're sure that
 // new tick arrived.
 tester.RunAllTicks();

 for (let indicator of tester.GetIndicatorsInfo()) {
   console.log(`Indicator ${indicator.name}'s has completed. `)
 }

*/

int main(int argc, char **argv) {
#ifdef __debug_emscripten__

  Indi_TickProviderParams ticker_params;
  ticker_params.symbol = "EURUSD";
  Ref<Indi_TickProvider> ticker = new Indi_TickProvider(ticker_params);

  Ref<IndicatorTfDummy> tfM5 = new IndicatorTfDummy(PERIOD_M1);
  tfM5 REF_DEREF SetDataSource(ticker.Ptr());

  IndiRSIParams rsiM5_params(13, PRICE_OPEN, 0);
  Ref<Indi_RSI> rsiM5 = new Indi_RSI(rsiM5_params);
  rsiM5 REF_DEREF SetDataSource(tfM5.Ptr());

  Tester::Add(rsiM5.Ptr());

  // Note that all timeframes shares the same ticks and so you may reuse single TickProvider indicator for other Tester
  // instances for the same symbols pair.

  ARRAY(TickTAB<double>, ticks);

  ArrayPush(ticks, TickTAB<double>(1000 * 1, 0.1, 0.11));
  ArrayPush(ticks, TickTAB<double>(1000 * 60, 0.2, 0.22));
  ArrayPush(ticks, TickTAB<double>(1000 * 120, 0.3, 0.33));

  ticker REF_DEREF Feed(ticks);

  Tester::RunAllTicks();

  TesterValuesFetchParams getValuesParams = Tester::GetTimeByScrollAndZoom(0, 0, 32);

  TesterValues values = Tester::GetValues(getValuesParams);

  Print("Fetched values for params: ", getValuesParams.ToString());

  Print("Values fetched:\n", values.ToString());

#endif

#ifdef __EMSCRIPTEN__
  emscripten_exit_with_live_runtime();
#endif

  return 0;
}
