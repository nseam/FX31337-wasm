import { IndicatorParams } from './IndicatorData';
import { IndicatorBase } from './IndicatorBase';

export type Indi_MACDParams = IndicatorParams & {
    ema_fast_period: number;
    ema_slow_period: number;
    signal_period: number;
    applied_price: number;
};

export class Indi_MACD extends IndicatorBase {
    public constructor(_params: Indi_MACDParams) { super(); }
}