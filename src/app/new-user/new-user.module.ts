import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { UserInfoFormPageRoutingModule } from './new-user-routing.module';

import { NewUserPage } from './new-user.page';

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
  declarations: [NewUserPage]
})
export class NewUserPageModule {}
