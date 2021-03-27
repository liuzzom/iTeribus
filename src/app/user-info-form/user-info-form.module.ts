import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { UserInfoFormPageRoutingModule } from './user-info-form-routing.module';

import { UserInfoFormPage } from './user-info-form.page';

import {MatStepperModule} from '@angular/material/stepper';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MatStepperModule,
    UserInfoFormPageRoutingModule
  ],
  declarations: [UserInfoFormPage]
})
export class UserInfoFormPageModule {}
