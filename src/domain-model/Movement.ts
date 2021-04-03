import { MovementReason } from './MovementReason';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { GenerationOptions } from './GenerationOptions';
import { Place } from './Place';
export class Movement {
    name: string;
    reason: MovementReason;
    otherReasonMessage: string;
    departure: string;
    destination: string;
    notes?: string;
    repeat?: boolean;
    generationOptions?: GenerationOptions;

    constructor(
        name: string,
        reason: MovementReason,
        departure: string,
        destination: string,
        otherReasonMessage?: string,
        repeat?: boolean,
        notes?: string,
        generationOptions?: GenerationOptions
        ) {
        this.name = name;
        this.reason = reason;
        this.departure = departure;
        this.destination = destination;
        this.otherReasonMessage = otherReasonMessage,
        this.notes = notes ? notes : '';
        this.repeat = repeat ? repeat : false;
        this.generationOptions = generationOptions ? generationOptions : null;
    }
}
