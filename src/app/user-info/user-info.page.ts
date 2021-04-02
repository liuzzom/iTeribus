import { User } from '../../domain-model/User';
import { StorageService } from '../services/storage.service';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { GeoService } from '../services/geo.service';
import { Region } from '../../domain-model/Region';
import { Province } from '../../domain-model/Province';
import { Municipality } from '../../domain-model/Municipality';
import { DatePipe } from '@angular/common';
import { ToastController } from '@ionic/angular';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from "rxjs";
import { Document } from "../../domain-model/Document";
import { Place } from "../../domain-model/Place";

@Component({
  selector: 'app-user-info',
  templateUrl: './user-info.page.html',
  styleUrls: ['./user-info.page.scss'],
})
export class UserInfoPage implements OnInit {
  private readonly addressPattern = '^[A-Za-z][a-zàèéìòù]* ([A-Z-a-zàèéìòù]+\\.?)*\\ ?([A-Za-z][a-zàèéìòù]*)? ?([A-Za-zàèéìòù]*)+ (\\d+(\\/?[A-Z[a-z]+)?)';
  private user: User;

  // false: view mode, true: edit mode
  editMode: boolean = false;

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
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private geoService: GeoService,
    private router: Router,
    private storageService: StorageService,
    public toastController: ToastController
  ) { }


  // ----- Initialization Section ----- \\

  async ngOnInit() {
    // Init Form
    this.initForm();

    // Get User data from Storage
    this.user = await this.storageService.get('user');

    if (!this.user) {
      this.router.navigate(['./user-info-form']);
    }

    this.editMode = this.activatedRoute.snapshot.paramMap.get('mode') === 'edit' ? true : false;

    // Get Regions
    this.geoService.getRegions().subscribe(regions => {
      this.regions = regions;
      this.fillForm();
    });

  }

  // Initialize the User Form
  private initForm() {
    // ----- Anagraphic Validators ----- \\
    this.anagraphicFormGroup = this.formBuilder.group({
      name: new FormControl('', [Validators.required, Validators.pattern('^[A-Z][a-z]*(\ ([A-Z][a-z]*)?)*')]),
      surname: new FormControl('', [Validators.required, Validators.pattern('^[A-Z][a-z]*(\ ([A-Z][a-z]*)?)*')]),
      dateOfBirth: new FormControl('', [Validators.required]),
      phoneNumber: new FormControl('', [Validators.required, Validators.pattern('^\\+?[0-9\ ]*')]),
      email: new FormControl('', Validators.email)
    });

    // ----- Document Validators ----- \\
    this.documentFormGroup = this.formBuilder.group({
      type: new FormControl('', [Validators.required]),
      number: new FormControl('', [Validators.required, Validators.pattern('^[a-zA-Z0-9]*$')]),
      issuingAuthority: new FormControl('', [Validators.required]),
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

  // Get Data from Storage and Fill the User Form
  private fillForm() {
    // Anagraphical Section \\
    this.anagraphicFormGroup.get('name').setValue(this.user.name);
    this.anagraphicFormGroup.get('surname').setValue(this.user.surname);
    this.anagraphicFormGroup.get('dateOfBirth').setValue(this.user.dateOfBirth);
    this.anagraphicFormGroup.get('phoneNumber').setValue(this.user.phoneNumber);
    this.anagraphicFormGroup.get('email').setValue(this.user.email);

    // Document Section \\
    this.documentFormGroup.get('type').setValue(this.user.document.type);
    this.documentFormGroup.get('number').setValue(this.user.document.number);
    this.documentFormGroup.get('issuingAuthority').setValue(this.user.document.issuingAuthority);
    this.documentFormGroup.get('issueDate').setValue(this.user.document.issueDate);

    // Residence Section \\
    this.residenceDomicileFormGroup.get('residenceRegion').setValue(this.user.residence.region);
    this.getProvinceObservable('residence').subscribe(provinces => {
      // Filter is used to avoid performance drops
      this.residenceProvinces = provinces.
        filter(province => province.id_regione === this.getGeographicalControl('residenceRegion').value);
      this.residenceDomicileFormGroup.get('residenceProvince').setValue(this.user.residence.province);

      this.getMunicipalitiesObservable('residence').subscribe((municipalities) => {
        this.residenceMunicipalities = municipalities.
          filter(municipality => municipality.provincia === this.getGeographicalControl('residenceProvince').value);
        this.residenceDomicileFormGroup.get('residenceMunicipality').setValue(this.user.residence.municipality);
      });
    });
    this.residenceDomicileFormGroup.get('residenceAddress').setValue(this.user.residence.address);

    // Initialize domicile checkbox to false
    this.domicileChecked = false;

    // When Domicile is different to Residence
    if (JSON.stringify(this.user.domicile) !== JSON.stringify(this.user.residence)) {

      // domicile checkbox to true
      document.getElementById('domicileCheckbox').setAttribute('checked', 'true');

      // Domicile Section \\
      this.residenceDomicileFormGroup.get('domicileRegion').setValue(this.user.domicile.region);
      this.getProvinceObservable('domicile').subscribe(provinces => {
        // Filter is used to avoid performance drop
        this.domicileProvinces = provinces.
          filter(province => province.id_regione === this.getGeographicalControl('domicileRegion').value);
        this.residenceDomicileFormGroup.get('domicileProvince').setValue(this.user.domicile.province);

        this.getMunicipalitiesObservable('domicile').subscribe(municipalities => {
          this.domicileMunicipalities = municipalities.filter(municipality => municipality.provincia === this.getGeographicalControl('domicileProvince').value);
          this.residenceDomicileFormGroup.get('domicileMunicipality').setValue(this.user.domicile.municipality);
        })
      });
      this.residenceDomicileFormGroup.get('domicileAddress').setValue(this.user.domicile.address);
    }
  }

  // ----- Handler Section ----- \\


  toggleEditMode() {
    this.editMode = !this.editMode;
  }

  undo() {
    this.fillForm();
    this.toggleEditMode();
  }

  // Handle changes in domicile checkbox
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

  getProvinceObservable(mode: string): Observable<Province[]> {
    if (mode === 'residence') {
      this.residenceProvinces = [];
      return this.geoService.getProvinces();
    } else if (mode === 'domicile') {
      this.domicileProvinces = [];
      return this.geoService.getProvinces();
    } else {
      console.error('no supported mode');
      return null;
    }
  }

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

  getMunicipalitiesObservable(mode: string): Observable<Municipality[]> {
    if (mode === 'residence') {
      this.residenceMunicipalities = [];
      return this.geoService.getMunicipalities();
    } else if (mode === 'domicile') {
      this.domicileMunicipalities = [];
      return this.geoService.getMunicipalities();
    } else {
      console.error('no supported mode');
      return null;
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

  // ----- Storage Section ----- \\

  editUserInfo() {
    const name = this.capitalize(this.anagraphicFormGroup.get('name').value);
    const surname = this.capitalize(this.anagraphicFormGroup.get('surname').value);

    let userData: User = {
      name: name,
      surname: surname,
      dateOfBirth: this.anagraphicFormGroup.get('dateOfBirth').value,
      phoneNumber: this.anagraphicFormGroup.get('phoneNumber').value.replaceAll(' ', ''),
      email: this.anagraphicFormGroup.get('email').value,
      document: new Document(
        this.documentFormGroup.get('type').value,
        this.documentFormGroup.get('number').value.replaceAll(' ', '').toUpperCase(),
        this.documentFormGroup.get('issuingAuthority').value,
        this.documentFormGroup.get('issueDate').value,
      ),
      residence: new Place(
        this.residenceDomicileFormGroup.get('residenceRegion').value,
        this.residenceDomicileFormGroup.get('residenceProvince').value,
        this.residenceDomicileFormGroup.get('residenceMunicipality').value,
        this.residenceDomicileFormGroup.get('residenceAddress').value
      ),
      domicile: new Place(
        this.residenceDomicileFormGroup.get('residenceRegion').value,
        this.residenceDomicileFormGroup.get('residenceProvince').value,
        this.residenceDomicileFormGroup.get('residenceMunicipality').value,
        this.residenceDomicileFormGroup.get('residenceAddress').value
      ),
    };

    if (this.residenceDomicileFormGroup.get('domicileRegion').value &&
      this.residenceDomicileFormGroup.get('domicileProvince').value &&
      this.residenceDomicileFormGroup.get('domicileMunicipality').value &&
      this.residenceDomicileFormGroup.get('domicileAddress').value) {

      userData.domicile = {
        region: this.residenceDomicileFormGroup.get('residenceRegion').value,
        province: this.residenceDomicileFormGroup.get('domicileProvince').value,
        municipality: this.residenceDomicileFormGroup.get('domicileMunicipality').value,
        address: this.residenceDomicileFormGroup.get('domicileAddress').value
      };
    }

    this.storageService.set('user', userData).then(() => this.successToast()).catch(() => this.unsuccessToast());
  }

  // ----- Feedback Section ----- \\

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
