import { ToastController } from '@ionic/angular';
import { StorageService } from './../services/storage.service';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';

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
    public toastController: ToastController
  ) { }

  ngOnInit() {
    this.movementFormGroup = this.formBuilder.group({
      name: new FormControl('', [Validators.required]),
      reason: new FormControl('', [Validators.required]),
      otherReasonMessage: new FormControl('', []),
      departure: new FormControl('', [Validators.required]),
      destination: new FormControl('', [Validators.required]),
      notes: new FormControl('', [Validators.required])
    });
  }

  checkReason(reason){
    this.other = reason.value === 'MovementReason.OTHER';
    console.log(this.other);

    if(this.other) {
      this.movementFormGroup.setControl('otherReasonMessage', new FormControl('', [Validators.required]));
    } else {
      this.movementFormGroup.setControl('otherReasonMessage', new FormControl('', []));
    }
  }

}
