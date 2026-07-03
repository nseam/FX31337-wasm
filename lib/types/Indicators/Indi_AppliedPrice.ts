import { IndicatorBase } from './IndicatorBase';

export interface Indi_AppliedPriceParams {
    appliedPrice: number;
    shift: number;
}

export class Indi_AppliedPrice extends IndicatorBase {
    public constructor(params: Indi_AppliedPriceParams) {
        super();
    }
}
