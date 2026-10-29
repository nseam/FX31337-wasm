import { IndicatorParams } from './IndicatorData';
import { IndicatorBase } from './IndicatorBase';

export type Indi_PivotParams = IndicatorParams & {
    method: number;
};

export class Indi_Pivot extends IndicatorBase {
    public constructor(_params: Indi_PivotParams) { super(); }
}