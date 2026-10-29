import { IndicatorParams } from './IndicatorData';
import { IndicatorBase } from './IndicatorBase';

export type Indi_SARParams = IndicatorParams & {
    step: number;
    max: number;
};

export class Indi_SAR extends IndicatorBase {
    public constructor(_params: Indi_SARParams) { super(); }
}