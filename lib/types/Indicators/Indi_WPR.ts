import { IndicatorParams } from './IndicatorData';
import { IndicatorBase } from './IndicatorBase';

export type Indi_WPRParams = IndicatorParams & {
    period: number;
};

export class Indi_WPR extends IndicatorBase {
    public constructor(_params: Indi_WPRParams) { super(); }
}