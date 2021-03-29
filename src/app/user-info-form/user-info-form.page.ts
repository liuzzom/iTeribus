import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {GeoService} from "../services/geo.service";
import {Region} from "../../domain-model/Region";
import {Province} from "../../domain-model/Province";
import {Municipality} from "../../domain-model/Municipality";

@Component({
  selector: 'app-user-info-form',
  templateUrl: './user-info-form.page.html',
  styleUrls: ['./user-info-form.page.scss'],
})
export class UserInfoFormPage implements OnInit {
  regions: Region[];
  provinces: Province[] = [];
  municipalities: Municipality[] = [];

  selectedRegion: string;
  selectedProvince: string;
  selectedMunicipality: string;

  domicileRegions: Region[];
  domicileProvinces: Province[] = [];
  domicileMunicipalities: Municipality[] = [];

  selectedDomicileRegion: string;
  selectedDomicileProvince: string;
  selectedDomicileMunicipality: string;

  constructor(
    private geoService: GeoService
  ) { }

  ngOnInit() {
    this.geoService.getRegions().subscribe(regions => {
      this.regions = regions;
      this.domicileRegions = regions;
    });
  }

  // ----- Residence -----

  getProvince(){
    this.provinces = [];
    this.geoService.getProvinces().subscribe(provinces => {
      this.provinces = provinces.filter(province => province.id_regione === this.selectedRegion);
    });
  }


  getMunicipalities() {
    this.municipalities = [];
    this.geoService.getMunicipalities().subscribe(municipalities => {
      this.municipalities = municipalities.filter(municipality => municipality.provincia === this.selectedProvince);
    });
  }

  clearResidenceProvMunFields() {
    this.selectedProvince = "";
    this.selectedMunicipality = "";
  }

  clearResidenceMunFields() {
    this.selectedMunicipality = "";
  }

  // ----- Domicile -----

  getDomicileProvince(){
    this.domicileProvinces = [];
    this.geoService.getProvinces().subscribe(provinces => {
      this.domicileProvinces = provinces.filter(province => province.id_regione === this.selectedDomicileRegion);
    });
  }


  getDomicileMunicipalities() {
    this.domicileMunicipalities = [];
    this.geoService.getMunicipalities().subscribe(municipalities => {
      this.domicileMunicipalities = municipalities.filter(municipality => municipality.provincia === this.selectedDomicileProvince);
    });
  }

  clearDomicileProvMunFields() {
    this.selectedDomicileProvince = "";
    this.selectedDomicileMunicipality = "";
  }

  clearDomicileMunFields() {
    this.selectedDomicileMunicipality = "";
  }
}
