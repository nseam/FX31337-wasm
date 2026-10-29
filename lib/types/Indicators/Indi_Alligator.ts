import { IndicatorParams } from './IndicatorData';
import { IndicatorBase } from './IndicatorBase';

export type Indi_AlligatorParams = IndicatorParams & {
    jaw_period: number;
    jaw_shift: number;
    teeth_period: number;
    teeth_shift: number;
    lips_period: number;
    lips_shift: number;
    ma_method: number;
    applied_price: number;
};

export class Indi_Alligator extends IndicatorBase {
    public constructor(_params: Indi_AlligatorParams) { super(); }
}