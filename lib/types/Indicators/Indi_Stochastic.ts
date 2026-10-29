import { IndicatorParams } from './IndicatorData';
import { IndicatorBase } from './IndicatorBase';

export type Indi_StochasticParams = IndicatorParams & {
    kperiod: number;
    dperiod: number;
    slowing: number;
    ma_method: number;
    price_field: number;
};

export class Indi_Stochastic extends IndicatorBase {
    public constructor(_params: Indi_StochasticParams) { super(); }
}