import { IndicatorBase } from './IndicatorBase';
import { IndicatorParams } from './IndicatorData';

export type Indi_RSIParams = IndicatorParams & {
    period: number;
    applied_price: number;
}

export class Indi_RSI extends IndicatorBase {
    public constructor(params: Indi_RSIParams) {
        super();
    }
}
