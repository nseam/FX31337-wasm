import { IndicatorParams } from 'fx31337-wasm/lib/types/Indicators/IndicatorData';
import { IndicatorBase } from './IndicatorBase';

export type Indi_AppliedPriceParams = IndicatorParams & {
    applied_price: number;
};

export class Indi_AppliedPrice extends IndicatorBase {
    public constructor(params: Indi_AppliedPriceParams) {
        super();
    }
}
