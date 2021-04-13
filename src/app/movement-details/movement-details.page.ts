import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { StorageService } from '../services/storage.service';
import { Platform, ToastController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { MovementReason } from '../../domain-model/MovementReason';
import { Movement } from '../../domain-model/Movement';
import { User } from '../../domain-model/User';

@Component({
  selector: 'app-movement-details',
  templateUrl: './movement-details.page.html',
  styleUrls: ['./movement-details.page.scss'],
})
export class MovementDetailsPage implements OnInit {
  user: User;
  movement: Movement;

  movementFormGroup: FormGroup;
  other: boolean = false;
  editMode: boolean;
  repeatChecked: boolean;

  constructor(
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    public platform: Platform,
    private router: Router,
    private storageService: StorageService,
    public toastController: ToastController,
  ) {
  }

  // ----- Initialization Section ----- \\

  async ngOnInit() {
    // Initialize the form
    this.initForm();

    // Get User data from Storage
    this.user = await this.storageService.get('user');

    if (!this.user) {
      // There is no user data. redirect to registration form
      this.router.navigate(['./new-user']);
    }

    // Set the mode
    this.editMode = this.activatedRoute.snapshot.paramMap.get('mode') === 'edit';

    // Fill the form
    await this.fillForm();
  }

  private initForm() {
    this.movementFormGroup = this.formBuilder.group({
      name: new FormControl('', [Validators.required]),
      reason: new FormControl('', [Validators.required]),
      otherReasonMessage: new FormControl('', []),
      departure: new FormControl('', [Validators.required]),
      destination: new FormControl('', [Validators.required]),
      notes: new FormControl('', []),
      days: new FormControl('', []),
      time: new FormControl('', [])
    });
  }

  private async fillForm() {
    // Get movement info
    let movementName = this.activatedRoute.snapshot.paramMap.get('name');
    this.movement = await this.storageService.get(movementName);

    this.repeatChecked = false;

    if (this.movement.repeat) {

      document.getElementById('repeatCheckbox').setAttribute('checked', 'true');

      this.movementFormGroup.get('days').setValue(this.movement.generationOptions.days);
      this.movementFormGroup.get('time').setValue(this.movement.generationOptions.time);
    }

    // Fill the form
    this.movementFormGroup.get('name').setValue(this.movement.name);
    this.movementFormGroup.get('reason').setValue(`MovementReason.${MovementReason[this.movement.reason]}`);
    this.movementFormGroup.get('otherReasonMessage').setValue(this.movement.otherReasonMessage);
    this.movementFormGroup.get('departure').setValue(this.movement.departure);
    this.movementFormGroup.get('destination').setValue(this.movement.destination);
    this.movementFormGroup.get('notes').setValue(this.movement.notes);
  }

  // ----- Handler Section ----- \\

  toggleEditMode() {
    this.editMode = !this.editMode;
  }

  toggleRepeatCheckbox() {
    this.repeatChecked = !this.repeatChecked;
  }

  // Check if the selected reason is "Altro"
  checkReason(reason) {
    this.other = reason.value === 'MovementReason.OTHER';

    if (this.other) {
      this.movementFormGroup.setControl('otherReasonMessage', new FormControl('', [Validators.required]));
    } else {
      this.movementFormGroup.setControl('otherReasonMessage', new FormControl('', []));
    }
  }

  // Go to home page when back button is clicked ()
  goHome() {
    this.router.navigate(['/home']);
  }

  undo() {
    if (this.activatedRoute.snapshot.paramMap.get('mode') === 'edit') {
      this.router.navigate(['/home']);
    }
    this.fillForm();
    this.toggleEditMode();
  }

  // ----- Storage Section ----- \\
  getReasonEnum(enumAsString: string): MovementReason {
    return MovementReason[enumAsString.split('.')[1]];
  }

  async editMovement() {
    // Check if the form is valid
    if (!this.movementFormGroup.valid) {
      await this.unsuccessToast('Errore! Controlla i dati inseriti e riprova');
      return;
    }

    // Check if the name is already used
    const movements = await this.storageService.getMovements();
    const nameAlreadyUsed = movements.find((movement) => {
      if (movement.name === this.movementFormGroup.get('name').value) return true;
    });
    if (nameAlreadyUsed && this.movementFormGroup.get('name').value !== this.movement.name) {
      await this.unsuccessToast('Errore! Il nome inserito è già stato utilizzato');
      return;
    }

    // Create Movement object
    const newMovement = new Movement(
      this.movementFormGroup.get('name').value,
      this.getReasonEnum(this.movementFormGroup.get('reason').value),
      this.movementFormGroup.get('departure').value,
      this.movementFormGroup.get('destination').value,
      this.movementFormGroup.get('otherReasonMessage').value,
      this.movementFormGroup.get('notes').value,
      this.repeatChecked,
      { days: this.movementFormGroup.get('days').value, time: this.movementFormGroup.get('time').value }
    );

    if (!newMovement.repeat) {
      newMovement.generationOptions = null;
    }

    // Save new Movement in the storage
    console.log(newMovement);
    this.storageService.set(newMovement.name, newMovement).then(() => this.successToast()).catch(() => this.unsuccessToast('Errore durante il salvataggio'));
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

  async unsuccessToast(message) {
    const toast = await this.toastController.create({
      color: 'danger',
      message: message,
      duration: 2000
    });
    toast.present();
  }
}
