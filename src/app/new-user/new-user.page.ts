import {MovementReason} from './../../domain-model/MovementReason';
import {User} from './../../domain-model/User';
import {Movement} from './../../domain-model/Movement';
import {Place} from './../../domain-model/Place';
import {StorageService} from './../services/storage.service';
import {Component, OnInit} from '@angular/core';
import {AbstractControl, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {GeoService} from '../services/geo.service';
import {Region} from '../../domain-model/Region';
import {Province} from '../../domain-model/Province';
import {Municipality} from '../../domain-model/Municipality';
import {ToastController} from '@ionic/angular';
import {Router} from '@angular/router';
import {Document} from 'src/domain-model/Document';

@Component({
  selector: 'app-user-info-form',
  templateUrl: './new-user.page.html',
  styleUrls: ['./new-user.page.scss'],
})
export class NewUserPage implements OnInit {
  private readonly addressPattern = '^[A-Za-z][a-zàèéìòù]* ([A-Z-a-zàèéìòù]+\\.?)*\\ ?([A-Za-z][a-zàèéìòù]*)? ?([A-Za-zàèéìòù]*)+ (\\d+(\\/?[A-Z[a-z]+)?)';

  anagraphicFormGroup: FormGroup;
  documentFormGroup: FormGroup;
  residenceDomicileFormGroup: FormGroup;
  initialMovementsFormGroup: FormGroup;

  regions: Region[];

  // ----- Birth Place ----- \\
  birthProvinces: Province[] = [];
  birthMunicipalities: Municipality[] = [];

  // ----- Residence ----- \\
  residenceProvinces: Province[] = [];
  residenceMunicipalities: Municipality[] = [];

  // ----- Domicile ----- \\
  domicileChecked: boolean;

  domicileProvinces: Province[] = [];
  domicileMunicipalities: Municipality[] = [];


  constructor(
    private formBuilder: FormBuilder,
    private geoService: GeoService,
    private router: Router,
    private storageService: StorageService,
    public toastController: ToastController
  ) {
  }

  async ngOnInit() {
    this.domicileChecked = false;

    // ----- Anagraphic Validators ----- \\
    this.anagraphicFormGroup = this.formBuilder.group({
      name: new FormControl('', [Validators.required, Validators.pattern('[A-z[a-z]*(\ ([A-Z[a-z]*)?)*')]),
      surname: new FormControl('', [Validators.required, Validators.pattern('[A-z[a-z]*(\ ([A-Z[a-z]*)?)*')]),
      dateOfBirth: new FormControl('', [Validators.required]),
      birthRegion: new FormControl('', [Validators.required]),
      birthProvince: new FormControl('', [Validators.required]),
      birthMunicipality: new FormControl('', [Validators.required]),
      phoneNumber: new FormControl('', [Validators.required, Validators.pattern('^\\+?[0-9\ ]*')]),
      email: new FormControl('', Validators.email)
    });

    // ----- Document Validators ----- \\
    this.documentFormGroup = this.formBuilder.group({
      type: new FormControl('cartaIdentità', [Validators.required]),
      number: new FormControl('', [Validators.required, Validators.pattern('^[a-zA-Z0-9]*$')]),
      issuingAuthority: new FormControl('', [Validators.required]),
      issueDate: new FormControl('', [Validators.required])
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

    // ----- Initial Movement Form ----- \\
    this.initialMovementsFormGroup = this.formBuilder.group({
      work: new FormControl('', []),
      school: new FormControl('', []),
      foodMarket: new FormControl('', []),
      relative: new FormControl('', []),
      familyDoctor: new FormControl('', []),
    });

    // Get Regions
    this.geoService.getRegions().subscribe(regions => {
      this.regions = regions;
    });

    const user = await this.storageService.get('user');

    if (user) {
      this.router.navigate(['./home']);
    }
  }


  // ----- Handler Section ----- \\

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


  // ----- Geographical Filtering for Select ----- \\

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
    } else if (mode === 'birth') {
      this.birthProvinces = [];
      this.geoService.getProvinces().subscribe(provinces => {
        this.birthProvinces = provinces.filter(province => province.id_regione === this.anagraphicFormGroup.get('birthRegion').value);
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
    } else if (mode === 'birth') {
      this.birthMunicipalities = [];
      this.geoService.getMunicipalities().subscribe(municipalities => {
        this.birthMunicipalities = municipalities.filter(municipality => municipality.provincia === this.anagraphicFormGroup.get('birthProvince').value);
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
    } else if (mode === 'birth') {
      this.anagraphicFormGroup.get('birthProvince').setValue('');
      this.anagraphicFormGroup.get('birthMunicipality').setValue('');
    } else {
      console.error('no supported mode');
    }

  }

  clearMunFields(mode: string) {
    if (mode === 'residence') {
      this.setGeographicalControl('residenceMunicipality', '');
    } else if (mode === 'domicile') {
      this.setGeographicalControl('domicileMunicipality', '');
    } else if (mode === 'birth') {
      this.anagraphicFormGroup.get('birthMunicipality').setValue('');
    } else {
      console.error('no supported mode');
    }
  }

  private capitalize(str: string) {
    return str.split(' ').map(str => str.charAt(0).toUpperCase() + str.slice(1)).join(' ');
  }

  // ----- Storage Section ----- \\

  addUserInfo() {

    const name = this.capitalize(this.anagraphicFormGroup.get('name').value.toLowerCase());
    const surname = this.capitalize(this.anagraphicFormGroup.get('surname').value.toLowerCase());

    let userData: User = {
      name: name,
      surname: surname,
      dateOfBirth: this.anagraphicFormGroup.get('dateOfBirth').value,
      birthPlace: new Place(
        this.anagraphicFormGroup.get('birthRegion').value,
        this.anagraphicFormGroup.get('birthProvince').value,
        this.anagraphicFormGroup.get('birthMunicipality').value,
        null
      ),
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
        region: this.residenceDomicileFormGroup.get('domicileRegion').value,
        province: this.residenceDomicileFormGroup.get('domicileProvince').value,
        municipality: this.residenceDomicileFormGroup.get('domicileMunicipality').value,
        address: this.residenceDomicileFormGroup.get('domicileAddress').value
      };
    }

    const work = this.initialMovementsFormGroup.get('work').value;
    const school = this.initialMovementsFormGroup.get('school').value;
    const foodMarket = this.initialMovementsFormGroup.get('foodMarket').value;
    const relative = this.initialMovementsFormGroup.get('relative').value;
    const familyDoctor = this.initialMovementsFormGroup.get('familyDoctor').value;

    if (work || school || foodMarket || relative || familyDoctor) {

      if (work) {
        const workMovement = new Movement('Lavoro', MovementReason.WORK, `${userData.domicile.address}, ${userData.domicile.municipality}`, work);
        this.storageService.set(workMovement.name, workMovement);
      }

      if (school) {
        const schoolMovement = new Movement('Scuola', MovementReason.STUDY, `${userData.domicile.address}, ${userData.domicile.municipality}`, school);
        this.storageService.set(schoolMovement.name, schoolMovement);
      }

      if (foodMarket) {
        const foodMarketMovement =
          new Movement('Spesa', MovementReason.SHOP, `${userData.domicile.address}, ${userData.domicile.municipality}`, foodMarket);
        this.storageService.set(foodMarketMovement.name, foodMarketMovement);
      }

      if (relative) {
        const relativeMovement = new Movement('Visita a Parente', MovementReason.VISIT_RELATIVE, `${userData.domicile.address}, ${userData.domicile.municipality}`, relative);
        this.storageService.set(relativeMovement.name, relativeMovement);
      }

      if (familyDoctor) {
        const relativeMovement = new Movement('Medico di Famiglia', MovementReason.HEALTH, `${userData.domicile.address}, ${userData.domicile.municipality}`, familyDoctor);
        this.storageService.set(relativeMovement.name, relativeMovement);
      }

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
    this.router.navigate(['/new-user']);
  }

}
