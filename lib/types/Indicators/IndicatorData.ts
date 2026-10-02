import { IndicatorBase } from './IndicatorBase';

export interface IndicatorParams {
    shift: number;
}

export class IndicatorData extends IndicatorBase {
    public constructor(params: IndicatorParams) {
        super();
    }
}
