import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MovementDetailsPageRoutingModule } from './movement-details-routing.module';

import { MovementDetailsPage } from './movement-details.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    MovementDetailsPageRoutingModule
  ],
  declarations: [MovementDetailsPage]
})
export class MovementDetailsPageModule {}
