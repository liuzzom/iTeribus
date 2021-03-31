export class Place{
    region: number;
    province: string;
    municipality: string;
    address: string;

    constructor(region: number, province: string, municipality: string, address: string){
        this.region = region;
        this.province = province;
        this.municipality = municipality;
        this.address = address;
    }
}
