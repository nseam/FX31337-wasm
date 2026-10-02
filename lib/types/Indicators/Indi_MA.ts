import { IndicatorBase } from './IndicatorBase';
import { IndicatorParams } from './IndicatorData';
import { MAMethod } from './MAMethod';

export type Indi_MAParams = IndicatorParams & {
    applied_price: number;
    period: number;
    ma_shift: number;
    ma_method: MAMethod;
}

export class Indi_MA extends IndicatorBase {
    public constructor(params: Indi_MAParams) {
        super();
    }
}
