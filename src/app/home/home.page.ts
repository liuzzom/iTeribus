import { Router, ActivatedRoute } from '@angular/router';
import { Movement } from './../../domain-model/Movement';
import { StorageService } from './../services/storage.service';
import { Component, Input, OnInit } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {

  @Input() movements: Movement[];

  constructor(
    private activatedRoute: ActivatedRoute,
    private alertController: AlertController,
    private router: Router,
    private storageService: StorageService,
    private toastController: ToastController
  ) {
    this.activatedRoute.params.subscribe(val => {
      this.ngOnInit();
    });
  }

  async ngOnInit() {
    const user = await this.storageService.get('user');

    if (!user) {
      this.router.navigate(['./user-info-form']);

    }

    this.movements = await this.storageService.getMovements();
  }


  // ----- Feedback Section ----- \\

  async showAlert(index: number) {
    const alert = await this.alertController.create({
      header: 'Elimina Spostamento',
      message: `Eliminare definitivamente <strong>${this.movements[index].name}</strong>?`,
      buttons: [
        {
          text: 'NO',
          role: 'cancel'
        }, {
          text: 'SÌ',
          cssClass: 'danger',
          handler: () => {
            this.storageService.remove(this.movements[index].name)
            .then(() => this.successDeletionToast()
            .catch(() => this.unsuccessDeletionToast())
            );
            this.ngOnInit();
          }
        }
      ]
    });

    await alert.present();
  }

  async successDeletionToast() {
    const toast = await this.toastController.create({
      message: 'Spostamento eliminato con successo.',
      color: 'success',
      duration: 2000
    });
    toast.present();

    this.router.navigate(['/home']);
  }

  async unsuccessDeletionToast() {
    const toast = await this.toastController.create({
      color: 'danger',
      message: `Errore durante l'eliminazione dell'elemento.`,
      duration: 2000
    });
    toast.present();
    this.router.navigate(['/user-info-form']);
  }

}
