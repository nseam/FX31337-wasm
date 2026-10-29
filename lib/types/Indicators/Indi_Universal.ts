import { IndicatorParams } from './IndicatorData';
import { IndicatorBase } from './IndicatorBase';

export type Indi_UniversalParams = IndicatorParams & {
    mode_1: number;
    shift_1: number;
};

export class Indi_Universal extends IndicatorBase {
    public constructor(_params: Indi_UniversalParams) { super(); }
}