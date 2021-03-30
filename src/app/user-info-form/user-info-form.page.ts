import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { GeoService } from "../services/geo.service";
import { Region } from "../../domain-model/Region";
import { Province } from "../../domain-model/Province";
import { Municipality } from "../../domain-model/Municipality";

@Component({
  selector: 'app-user-info-form',
  templateUrl: './user-info-form.page.html',
  styleUrls: ['./user-info-form.page.scss'],
})
export class UserInfoFormPage implements OnInit {

  anagraphicFormGroup: FormGroup;
  documentFormGroup: FormGroup;
  residenceDomicileFormGroup: FormGroup;

  regions: Region[];

  // ----- Residence ----- \\
  residenceProvinces: Province[] = [];
  residenceMunicipalities: Municipality[] = [];

  selectedRegion: string;
  selectedProvince: string;
  selectedMunicipality: string;

  // ----- Domicile ----- \\

  domicileChecked: boolean;

  domicileProvinces: Province[] = [];
  domicileMunicipalities: Municipality[] = [];

  selectedDomicileRegion: string;
  selectedDomicileProvince: string;
  selectedDomicileMunicipality: string;


  constructor(
    private formBuilder: FormBuilder,
    private geoService: GeoService
  ) {
  }

  ngOnInit() {
    this.domicileChecked = false;

    this.anagraphicFormGroup = this.formBuilder.group({
      name: new FormControl('G', [Validators.required, Validators.pattern('^[A-Z][a-z]*(\ ([A-Z][a-z]*)?)*')]),
      surname: new FormControl('B', [Validators.required, Validators.pattern('^[A-Z][a-z]*(\ ([A-Z][a-z]*)?)*')]),
      dateOfBirth: new FormControl(new Date().toISOString(), [Validators.required]),
      phoneNumber: new FormControl('+3978', [Validators.required, Validators.pattern('^\\+?[0-9\ ]*')]),
      email: new FormControl('', Validators.email)
    });

    this.documentFormGroup = this.formBuilder.group({
      type: new FormControl('', [Validators.required]),
      number: new FormControl('au7894123', [Validators.required, Validators.pattern('^[a-zA-Z0-9]*$')]),
      issuingAuthority: new FormControl('Comune di Scandicci', [Validators.required]),
      issueDate: new FormControl(new Date().toISOString(), [Validators.required])
    });

    this.residenceDomicileFormGroup = this.formBuilder.group({
      residenceRegion: new FormControl('', [Validators.required]),
      residenceProvince: new FormControl('', [Validators.required]),
      residenceMunicipality: new FormControl('', [Validators.required]),
      residenceAddress: new FormControl('', [Validators.required]),
      domicileRegion: new FormControl('', []),
      domicileProvince: new FormControl('', []),
      domicileMunicipality: new FormControl('', []),
      domicileAddress: new FormControl('', [])
    });

    this.geoService.getRegions().subscribe(regions => {
      this.regions = regions;
    });
  }

  toggleCheckbox() {
    this.domicileChecked = !this.domicileChecked;
    console.log(this.domicileChecked);

    if (this.domicileChecked) {
      console.log('La checkbox è attiva');
      this.residenceDomicileFormGroup.controls['domicileRegion'].setValidators([Validators.required]);
      this.residenceDomicileFormGroup.controls['domicileProvince'].setValidators([Validators.required]);
      this.residenceDomicileFormGroup.controls['domicileMunicipality'].setValidators([Validators.required]);
      this.residenceDomicileFormGroup.controls['domicileAddress'].setValidators([Validators.required]);
    } else {
      console.log('La checkbox è disattivata');
      this.residenceDomicileFormGroup.controls['domicileRegion'].setValidators([]);
      this.residenceDomicileFormGroup.controls['domicileProvince'].setValidators([]);
      this.residenceDomicileFormGroup.controls['domicileMunicipality'].setValidators([]);
      this.residenceDomicileFormGroup.controls['domicileAddress'].setValidators([]);

    }

    this.residenceDomicileFormGroup.updateValueAndValidity();

    console.log(this.getGeographicalControl('domicileRegion').valid);
    console.log(this.getGeographicalControl('domicileProvince').valid);
    console.log(this.getGeographicalControl('domicileMunicipality').valid);
    console.log(this.getGeographicalControl('domicileAddress').valid);
  }


  getGeographicalControl(key: string): AbstractControl {
    return this.residenceDomicileFormGroup.get(key);
  }

  setGeographicalControl(key: string, value: string): void {
    this.residenceDomicileFormGroup.get(key).setValue(value);
  }



  // ----- Geographical Filtering for Select -----

  getProvince(mode: string) {
    if (mode === 'residence') {
      this.residenceProvinces = [];
      this.geoService.getProvinces().subscribe(provinces => {
        this.residenceProvinces =
          provinces.filter(province => province.id_regione === this.getGeographicalControl('residenceRegion').value);
      });
    } else if (mode === 'domicile') {
      this.domicileProvinces = [];
      this.geoService.getProvinces().subscribe(provinces => {
        this.domicileProvinces = provinces.filter(province => province.id_regione === this.getGeographicalControl('domicileRegion').value);
      });
    } else {
      console.error('no supported mode');
    }
  }

  getMunicipalities(mode: string) {
    if (mode === 'residence') {
      this.residenceMunicipalities = [];
      this.geoService.getMunicipalities().subscribe(municipalities => {
        this.residenceMunicipalities = municipalities.filter(municipality => municipality.provincia === this.getGeographicalControl('residenceProvince').value);
      });
    } else if (mode === 'domicile') {
      this.domicileMunicipalities = [];
      this.geoService.getMunicipalities().subscribe(municipalities => {
        this.domicileMunicipalities = municipalities.filter(municipality => municipality.provincia === this.getGeographicalControl('domicileProvince').value);
      });
    } else {
      console.error('no supported mode');
    }
  }

  clearProvMunFields(mode: string) {
    if (mode === 'residence') {
      this.setGeographicalControl('residenceProvince', '');
      this.setGeographicalControl('residenceMunicipality', '');
    } else if (mode === 'domicile') {
      this.setGeographicalControl('domicileProvince', '');
      this.setGeographicalControl('domicileMunicipality', '');
    } else {
      console.error('no supported mode');
    }

  }

  clearMunFields(mode: string) {
    if (mode === 'residence') {
      this.setGeographicalControl('residenceMunicipality', '');
    } else if (mode === 'domicile') {
      this.setGeographicalControl('domicileMunicipality', '');
    } else {
      console.error('no supported mode');
    }
  }
}
