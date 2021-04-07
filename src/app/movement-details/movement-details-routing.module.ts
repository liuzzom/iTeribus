import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MovementDetailsPage } from './movement-details.page';

const routes: Routes = [
  {
    path: ':name/:mode',
    component: MovementDetailsPage
  },
  {
    path: ':name',
    redirectTo: ':name/view',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MovementDetailsPageRoutingModule {}
