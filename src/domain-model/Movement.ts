import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { Place } from './Place';
export class Movement {
    name: string;
    reason: string;
    departure: string;
    destination: string;
    notes: string;

    constructor(name: string, reason: string, departure: string, end: string, notes: string) {
        this.name = name;
        this.reason = reason;
        this.departure = departure;
        this.destination = this.destination;
        this.notes = notes;
    }
}