import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { UserInfoFormPageRoutingModule } from './user-info-form-routing.module';

import { UserInfoFormPage } from './user-info-form.page';

import {MatStepperModule} from '@angular/material/stepper';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    MatStepperModule,
    UserInfoFormPageRoutingModule
  ],
  declarations: [UserInfoFormPage]
})
export class UserInfoFormPageModule {}
