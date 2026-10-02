import { IndicatorParams } from 'fx31337-wasm/lib/types/Indicators/IndicatorData';
import { IndicatorBase } from './IndicatorBase';

export type OHLCParams = IndicatorParams & {
};

export class Indi_OHLC extends IndicatorBase {
    public constructor(params: OHLCParams) {
        super();
    }
}
