export class Document {
    type: string;
    number: string;
    issuingAuthority: string;
    issueDate: Date;

    constructor(type: string, number: string, issuingAuthority: string, issueDate: Date) {
        this.type = type;
        this.number = number;
        this.issuingAuthority = issuingAuthority;
        this.issueDate = issueDate;
    }
}
