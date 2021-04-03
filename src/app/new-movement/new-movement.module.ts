import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NewMovementPageRoutingModule } from './new-movement-routing.module';

import { NewMovementPage } from './new-movement.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    NewMovementPageRoutingModule
  ],
  declarations: [NewMovementPage]
})
export class NewMovementPageModule {}
