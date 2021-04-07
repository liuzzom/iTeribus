import { MovementReason } from './MovementReason';
import { GenerationOptions } from './GenerationOptions';
export class Movement {
    name: string;
    reason: MovementReason;
    otherReasonMessage: string;
    departure: string;
    destination: string;
    notes?: string;
    public repeat?: boolean;
    generationOptions?: GenerationOptions;

    constructor(
        name: string,
        reason: MovementReason,
        departure: string,
        destination: string,
        otherReasonMessage?: string,
        notes?: string,
        repeat?: boolean,
        generationOptions?: GenerationOptions
        ) {
        this.name = name;
        this.reason = reason;
        this.departure = departure;
        this.destination = destination;
        this.otherReasonMessage = otherReasonMessage ? otherReasonMessage : '';
        this.notes = notes ? notes : '';
        this.repeat = repeat ? repeat : false;
        this.generationOptions = generationOptions ? generationOptions : null;
    }
}
