import { Document } from './Document';
import { Place } from './Place';
export class User{
    name: string;
    surname: string;
    dateOfBirth: Date;
    birthPlace?: Place;
    phoneNumber: string;
    email: string;
    document: Document;
    residence: Place;
    domicile: Place;
}
