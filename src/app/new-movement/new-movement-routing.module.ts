import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NewMovementPage } from './new-movement.page';

const routes: Routes = [
  {
    path: '',
    component: NewMovementPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NewMovementPageRoutingModule {}
