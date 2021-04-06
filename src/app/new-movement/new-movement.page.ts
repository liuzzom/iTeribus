import { ToastController } from '@ionic/angular';
import { StorageService } from './../services/storage.service';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import {Router} from "@angular/router";
import {Movement} from "../../domain-model/Movement";
import {MovementReason} from "../../domain-model/MovementReason";

@Component({
  selector: 'app-new-movement',
  templateUrl: './new-movement.page.html',
  styleUrls: ['./new-movement.page.scss'],
})
export class NewMovementPage implements OnInit {
  movementFormGroup: FormGroup;
  other: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private storageService: StorageService,
    public toastController: ToastController,
    private router: Router
  ) { }

  ngOnInit() {
    this.movementFormGroup = this.formBuilder.group({
      name: new FormControl('Lavoro', [Validators.required]),
      reason: new FormControl('MovementReason.WORK', [Validators.required]),
      otherReasonMessage: new FormControl('', []),
      departure: new FormControl('Via Carducci 21, Campofranco (CL)', [Validators.required]),
      destination: new FormControl('Via del Mezzetta 9/G, Firenze (FI)', [Validators.required]),
      notes: new FormControl('', [])
    });
  }

  // ----- Handler Section ----- \\

  // Check if the selected reason is "Altro"
  checkReason(reason){
    this.other = reason.value === 'MovementReason.OTHER';

    if(this.other) {
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
  getReasonEnum(enumAsString: string): MovementReason{
    return MovementReason[enumAsString.split('.')[1]];
  }

  async addMovement(){
    // Check if the form is valid
    if(! this.movementFormGroup.valid){
      this.unsuccessToast('Errore! Controlla i dati inseriti e riprova');
      return;
    }

    // Check if the name is already used
    const movements = await this.storageService.getMovements();
    const nameAlreadyUsed = movements.find((movement) => {
      if(movement.name === this.movementFormGroup.get('name').value) return true;
    });

    if(nameAlreadyUsed){
      this.unsuccessToast('Errore! Il nome inserito è stato utilizzato');
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
