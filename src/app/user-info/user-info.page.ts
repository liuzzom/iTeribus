import { StorageService } from './../services/storage.service';
import {Component, OnInit, OnChanges, SimpleChanges, SimpleChange} from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { GeoService } from '../services/geo.service';
import { Region } from '../../domain-model/Region';
import { Province } from '../../domain-model/Province';
import { Municipality } from '../../domain-model/Municipality';
import { DatePipe } from '@angular/common';
import { ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import {delay} from "rxjs/operators";

@Component({
  selector: 'app-user-info',
  templateUrl: './user-info.page.html',
  styleUrls: ['./user-info.page.scss'],
})
export class UserInfoPage implements OnInit{
  private readonly addressPattern = '^[A-Za-z][a-zàèéìòù]* ([A-Z-a-zàèéìòù]+\\.?)*\\ ?([A-Za-z][a-zàèéìòù]*)? ?([A-Za-zàèéìòù]*)+ (\\d+(\\/?[A-Z[a-z]+)?)';
  private userData;

  anagraphicFormGroup: FormGroup;
  documentFormGroup: FormGroup;
  residenceDomicileFormGroup: FormGroup;
  // initialMovementsFormGroup: FormGroup;

  regions: Region[];

  // ----- Residence ----- \\
  residenceProvinces: Province[] = [];
  residenceMunicipalities: Municipality[] = [];

  // ----- Domicile ----- \\

  domicileChecked: boolean;

  domicileProvinces: Province[] = [];
  domicileMunicipalities: Municipality[] = [];


  constructor(
    private datePipe: DatePipe,
    private formBuilder: FormBuilder,
    private geoService: GeoService,
    private router: Router,
    private storageService: StorageService,
    public toastController: ToastController
  ) { }

  private initForm(){
    // ----- Anagraphic Validators ----- \\
    this.anagraphicFormGroup = this.formBuilder.group({
      name: new FormControl('Antonino Mauro', [Validators.required, Validators.pattern('^[A-Z][a-z]*(\ ([A-Z][a-z]*)?)*')]),
      surname: new FormControl('Liuzzo', [Validators.required, Validators.pattern('^[A-Z][a-z]*(\ ([A-Z][a-z]*)?)*')]),
      dateOfBirth: new FormControl(new Date().toISOString(), [Validators.required]),
      phoneNumber: new FormControl('3489534151', [Validators.required, Validators.pattern('^\\+?[0-9\ ]*')]),
      email: new FormControl('', Validators.email)
    });

    // ----- Document Validators ----- \\
    this.documentFormGroup = this.formBuilder.group({
      type: new FormControl('cartaIdentità', [Validators.required]),
      number: new FormControl('AX2557411', [Validators.required, Validators.pattern('^[a-zA-Z0-9]*$')]),
      issuingAuthority: new FormControl('Comune di Campofranco', [Validators.required]),
      issueDate: new FormControl(new Date().toISOString(), [Validators.required])
    });

    // ----- Residence and Domicile Validators ----- \\
    this.residenceDomicileFormGroup = this.formBuilder.group({
      residenceRegion: new FormControl('', [Validators.required]),
      residenceProvince: new FormControl('', [Validators.required]),
      residenceMunicipality: new FormControl('', [Validators.required]),
      residenceAddress: new FormControl('', [Validators.required, Validators.pattern(this.addressPattern)]),
      domicileRegion: new FormControl('', []),
      domicileProvince: new FormControl('', []),
      domicileMunicipality: new FormControl('', []),
      domicileAddress: new FormControl('', [])
    });
  }

  ngOnInit() {
    console.log(this.regions);
    this.domicileChecked = false;

    // Init Form
    this.initForm();

    // Get Regions
    this.geoService.getRegions().subscribe(  regions => {
      this.regions = regions;
      this.residenceDomicileFormGroup.setControl('residenceRegion', new FormControl('15', [Validators.required]));
    });
  }

  delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
  }


  toggleDomicileCheckbox() {
    this.domicileChecked = !this.domicileChecked;

    if (this.domicileChecked) {
      // Set Domicile Required Validators
      this.residenceDomicileFormGroup.setControl('domicileRegion', new FormControl('', [Validators.required]));
      this.residenceDomicileFormGroup.setControl('domicileProvince', new FormControl('', [Validators.required]));
      this.residenceDomicileFormGroup.setControl('domicileMunicipality', new FormControl('', [Validators.required]));
      this.residenceDomicileFormGroup.setControl('domicileAddress',
        new FormControl('', [Validators.required, Validators.pattern(this.addressPattern)]));
    } else {
      // Clear Domicile Fields and Remove Required Validators
      this.residenceDomicileFormGroup.setControl('domicileRegion', new FormControl('', []));
      this.residenceDomicileFormGroup.setControl('domicileProvince', new FormControl('', []));
      this.residenceDomicileFormGroup.setControl('domicileMunicipality', new FormControl('', []));
      this.residenceDomicileFormGroup.setControl('domicileAddress', new FormControl('', []));
    }

    this.residenceDomicileFormGroup.updateValueAndValidity();
  }


  // ----- Getter and Setter for Residence/Domicile FormGroup ----- \\
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

  private capitalize(str: string) {
    return str.split(' ').map(str => str.charAt(0).toUpperCase() + str.slice(1)).join(' ');
  }

  addUserInfo() {

    const name = this.capitalize(this.anagraphicFormGroup.get('name').value);
    const surname = this.capitalize(this.anagraphicFormGroup.get('surname').value);

    let userData: any = {
      anagraphic: {
        name: name,
        surname: surname,
        dateOfBirth: this.datePipe.transform(this.anagraphicFormGroup.get('dateOfBirth').value, 'dd-MM-YYYY'),
        phoneNumber: this.anagraphicFormGroup.get('phoneNumber').value.replaceAll(' ', ''),
        email: this.anagraphicFormGroup.get('email').value
      },
      document: {
        type: this.documentFormGroup.get('type').value,
        number: this.documentFormGroup.get('number').value.replaceAll(' ', '').toUpperCase(),
        issuingAuthority: this.documentFormGroup.get('issuingAuthority').value,
        issueDate: this.datePipe.transform(this.documentFormGroup.get('issueDate').value, 'dd-MM-YYYY')
      },
      residence: {
        province: this.residenceDomicileFormGroup.get('residenceProvince').value,
        municipality: this.residenceDomicileFormGroup.get('residenceMunicipality').value,
        address: this.residenceDomicileFormGroup.get('residenceAddress').value
      },
      domicile: {
        province: this.residenceDomicileFormGroup.get('residenceProvince').value,
        municipality: this.residenceDomicileFormGroup.get('residenceMunicipality').value,
        address: this.residenceDomicileFormGroup.get('residenceAddress').value
      },
    };

    if (this.residenceDomicileFormGroup.get('domicileRegion').value &&
      this.residenceDomicileFormGroup.get('domicileProvince').value &&
      this.residenceDomicileFormGroup.get('domicileMunicipality').value &&
      this.residenceDomicileFormGroup.get('domicileAddress').value) {

      userData.domicile = {
        province: this.residenceDomicileFormGroup.get('domicileProvince').value,
        municipality: this.residenceDomicileFormGroup.get('domicileMunicipality').value,
        address: this.residenceDomicileFormGroup.get('domicileAddress').value
      };
    }

    /*const work = this.initialMovementsFormGroup.get('work').value;
    const school = this.initialMovementsFormGroup.get('school').value;
    const foodMarket = this.initialMovementsFormGroup.get('foodMarket').value;
    const relative = this.initialMovementsFormGroup.get('relative').value;
    const familyDoctor = this.initialMovementsFormGroup.get('familyDoctor').value;

    if (work || school || foodMarket || relative || familyDoctor) {
      userData.movements = {};

      if (work) { userData.movements.work = work; }
      if (school) { userData.movements.school = school; }
      if (foodMarket) { userData.movements.foodMarket = foodMarket; }
      if (relative) { userData.movements.relative = relative; }
      if (familyDoctor) { userData.movements.familyDoctor = familyDoctor; }
    }*/

    this.storageService.set('user', userData).then(() => this.successToast()).catch(() => this.unsuccessToast());
  }

  async successToast() {
    const toast = await this.toastController.create({
      message: 'Dati salvati correttamente.',
      color: 'success',
      duration: 2000
    });
    toast.present();

    this.router.navigate(['/home']);
  }

  async unsuccessToast() {
    const toast = await this.toastController.create({
      color: 'danger',
      message: 'Errore: impossibile salvare i dati.',
      duration: 2000
    });
    toast.present();
    this.router.navigate(['/user-info-form']);
  }
}