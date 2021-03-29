import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
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

  residenceProvinces: Province[] = [];
  residenceMunicipalities: Municipality[] = [];

  selectedRegion: string;
  selectedProvince: string;
  selectedMunicipality: string;

  domicileProvinces: Province[] = [];
  domicileMunicipalities: Municipality[] = [];

  selectedDomicileRegion: string;
  selectedDomicileProvince: string;
  selectedDomicileMunicipality: string;

  constructor(
    private geoService: GeoService
  ) {
  }

  ngOnInit() {
    this.geoService.getRegions().subscribe(regions => {
      this.regions = regions;
    });
  }

  // ----- Geographical Filtering for Select -----

  getProvince(mode: string) {
    if (mode === 'residence') {
      this.residenceProvinces = [];
      this.geoService.getProvinces().subscribe(provinces => {
        this.residenceProvinces = provinces.filter(province => province.id_regione === this.selectedRegion);
      });
    } else if (mode === 'domicile') {
      this.domicileProvinces = [];
      this.geoService.getProvinces().subscribe(provinces => {
        this.domicileProvinces = provinces.filter(province => province.id_regione === this.selectedDomicileRegion);
      });
    } else {
      console.error('no supported mode');
    }
  }


  getMunicipalities(mode: string) {
    if (mode === 'residence') {
      this.residenceMunicipalities = [];
      this.geoService.getMunicipalities().subscribe(municipalities => {
        this.residenceMunicipalities = municipalities.filter(municipality => municipality.provincia === this.selectedProvince);
      });
    } else if (mode === 'domicile') {
      this.domicileMunicipalities = [];
      this.geoService.getMunicipalities().subscribe(municipalities => {
        this.domicileMunicipalities = municipalities.filter(municipality => municipality.provincia === this.selectedDomicileProvince);
      });
    } else {
      console.error('no supported mode');
    }
  }

  clearProvMunFields(mode: string) {
    if(mode === 'residence') {
      this.selectedProvince = "";
      this.selectedMunicipality = "";
    } else if(mode === 'domicile') {
      this.selectedDomicileProvince = "";
      this.selectedDomicileMunicipality = "";
    } else {
      console.error('no supported mode');
    }

  }

  clearMunFields(mode: string) {
    if(mode === 'residence'){
      this.selectedMunicipality = "";
    } else if(mode === 'domicile') {
      this.selectedDomicileMunicipality = "";
    } else {
      console.error('no supported mode');
    }
  }
}
