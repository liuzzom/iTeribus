import { ToastController } from '@ionic/angular';
import { StorageService } from './../services/storage.service';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Movement } from '../../domain-model/Movement';
import { MovementReason } from '../../domain-model/MovementReason';
import { User } from '../../domain-model/User';

@Component({
  selector: 'app-new-movement',
  templateUrl: './new-movement.page.html',
  styleUrls: ['./new-movement.page.scss'],
})
export class NewMovementPage implements OnInit {
  movementFormGroup: FormGroup;
  other: boolean = false;
  user: User;

  constructor(
    private formBuilder: FormBuilder,
    private storageService: StorageService,
    public toastController: ToastController,
    private router: Router
  ) { }

  async ngOnInit() {
    // Initialize the form
    this.movementFormGroup = this.formBuilder.group({
      name: new FormControl('', [Validators.required]),
      reason: new FormControl('', [Validators.required]),
      otherReasonMessage: new FormControl('', []),
      departure: new FormControl('', [Validators.required]),
      destination: new FormControl('', [Validators.required]),
      notes: new FormControl('', [])
    });

    // Get User data from Storage
    this.user = await this.storageService.get('user');

    if (!this.user) {
      // There is no user data. redirect to registration form
      await this.router.navigate(['./new-user']);
    }
  }

  // ----- Handler Section ----- \\

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

  // ----- Storage Section ----- \\
  getReasonEnum(enumAsString: string): MovementReason {
    return MovementReason[enumAsString.split('.')[1]];
  }

  async addMovement() {
    // Check if the form is valid
    if (!this.movementFormGroup.valid) {
      this.unsuccessToast('Errore! Controlla i dati inseriti e riprova');
      return;
    }

    // Check if the name is already used
    const movements = await this.storageService.getMovements();
    const nameAlreadyUsed = movements.find((movement) => {
      if (movement.name === this.movementFormGroup.get('name').value) return true;
    });

    if (nameAlreadyUsed) {
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
      this.movementFormGroup.get('notes').value
    );

    // Save new Movement in the storage
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
