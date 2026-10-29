import { IndicatorParams } from './IndicatorData';
import { IndicatorBase } from './IndicatorBase';

export type Indi_BandsParams = IndicatorParams & {
    period: number;
    deviation: number;
    bshift: number;
    applied_price: number;
};

export class Indi_Bands extends IndicatorBase {
    public constructor(_params: Indi_BandsParams) { super(); }
}