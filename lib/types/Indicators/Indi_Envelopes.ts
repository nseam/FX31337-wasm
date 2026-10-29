import { IndicatorParams } from './IndicatorData';
import { IndicatorBase } from './IndicatorBase';

export type Indi_EnvelopesParams = IndicatorParams & {
    ma_period: number;
    ma_shift: number;
    ma_method: number;
    applied_price: number;
    deviation: number;
};

export class Indi_Envelopes extends IndicatorBase {
    public constructor(_params: Indi_EnvelopesParams) { super(); }
}