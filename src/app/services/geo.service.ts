import { Injectable } from '@angular/core';
import {Region} from "../../domain-model/Region";
import {HttpClient} from "@angular/common/http";
import {Province} from "../../domain-model/Province";
import {Municipality} from "../../domain-model/Municipality";

@Injectable({
  providedIn: 'root'
})
export class GeoService {

  constructor(
    private httpClient: HttpClient
  ) {}

  getRegions(){
    return this.httpClient.get<Region[]>('assets/regioni.json');
  }

  getProvinces(){
    return this.httpClient.get<Province[]>('assets/province.json');
  }

  getMunicipalities() {
    return this.httpClient.get<Municipality[]>('assets/comuni.json');
  }
}
