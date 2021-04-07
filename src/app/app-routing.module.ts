import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then(m => m.HomePageModule)
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'user-info-form',
    loadChildren: () => import('./user-info-form/user-info-form.module').then(m => m.UserInfoFormPageModule)
  },
  {
    path: 'user-info',
    loadChildren: () => import('./user-info/user-info.module').then( m => m.UserInfoPageModule)
  },
  {
    path: 'new-movement',
    loadChildren: () => import('./new-movement/new-movement.module').then( m => m.NewMovementPageModule)
  },
  {
    path: 'movement-details',
    loadChildren: () => import('./movement-details/movement-details.module').then( m => m.MovementDetailsPageModule)
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
