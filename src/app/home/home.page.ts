import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Plugins } from '@capacitor/core';
import { AlertController, ToastController } from '@ionic/angular';

import { PdfGeneratorService } from '../services/pdf-generator.service';
import { StorageService } from './../services/storage.service';
import { Movement } from './../../domain-model/Movement';

import { User } from '../../domain-model/User';

const { App, BackgroundTask, LocalNotifications } = Plugins;

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  showNoMovementsMsg: boolean = false;

  movements: Movement[] = [];
  user: User;

  constructor(
    private activatedRoute: ActivatedRoute,
    private alertController: AlertController,
    private router: Router,
    private storageService: StorageService,
    private pdfGeneratorService: PdfGeneratorService,
    private toastController: ToastController
  ) {
    this.activatedRoute.params.subscribe(val => {
      this.ngOnInit();
    });
  }

  async ngOnInit() {
    // Check if the storage contains user information
    this.user = await this.storageService.get('user');

    if (!this.user) {
      // There is no user information...redirect to the user registration form
      this.router.navigate(['./new-user']);
    }

    // Get movements from storage using the service
    this.movements = await this.storageService.getMovements();
    this.showNoMovementsMsg = this.movements.length === 0;

    //await LocalNotifications.requestPermission();

    App.addListener('appStateChange', (state) => {

      if (!state.isActive) {
        // The app has become inactive. We should check if we have some work left to do, and, if so,
        // execute a background task that will allow us to finish that work before the OS
        // suspends or terminates our app:
        let taskId = BackgroundTask.beforeExit(async () => {
          // In this function We might finish an upload, let a network request
          // finish, persist some data, or perform some other task

          this.notifyWithServiceWorker();

          // Must call in order to end our task otherwise
          // we risk our app being terminated, and possibly
          // being labeled as impacting battery life
          BackgroundTask.finish({
            taskId
          });
        });
      }
    })

  }

  public notifyWithServiceWorker() {
    navigator.serviceWorker.register('ngsw-worker.js');

    Notification.requestPermission(result => {
      if (result === 'granted') {
        setTimeout(() => {
          navigator.serviceWorker.ready.then(registration => {
            registration.showNotification('Vibration Sample', {
              body: 'Buzz! Buzz!',
              icon: '../images/touch/chrome-touch-icon-192x192.png',
              vibrate: [200, 100, 200, 100, 200, 100, 200],
              tag: 'vibration-sample'
            });
          });
        }, 3000);
      }
    });
  }

  public notifyWithServiceWorkerInBackground() {
    navigator.serviceWorker.register('ngsw-worker.js');

    Notification.requestPermission(result => {
      if (result === 'granted') {
        navigator.serviceWorker.ready.then(registration => {
          registration.showNotification('Vibration Sample', {
            body: 'Buzz! Buzz!',
            icon: '../images/touch/chrome-touch-icon-192x192.png',
            vibrate: [200, 100, 200, 100, 200, 100, 200],
            tag: 'vibration-sample'
          });
        });
      }
    });
  }

  public async notify() {
    const notifs = await LocalNotifications.schedule({
      notifications: [
        {
          title: "Title",
          body: "Body",
          id: 1,
          schedule: { at: new Date(Date.now() + 1000 * 5) },
          sound: null,
          attachments: null,
          actionTypeId: "",
          extra: null
        }
      ]
    });
    console.log('scheduled notifications', notifs);
  }


  // ----- Feedback Section ----- \\
  async showGenerateAlert(index: number) {
    const alert = await this.alertController.create({
      header: 'Generare Modulo',
      message: `Generare Modulo per <strong>${this.movements[index].name}</strong>?`,
      buttons: [
        {
          text: 'SENZA DATA',
          cssClass: 'secondary',
          handler: () => {
            this.generatePDF(this.movements[index], false)
          }
        },
        {
          text: 'PER OGGI',
          handler: () => {
            this.generatePDF(this.movements[index], true)
          }
        },
        {
          text: 'ANNULLA',
          cssClass: 'danger',
          role: 'cancel'
        }
      ]
    });

    await alert.present();
  }

  async showDeleteAlert(index: number) {
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
    this.router.navigate(['/new-user']);
  }

  generatePDF(movement, date: boolean) {
    console.log('generation....')
    this.pdfGeneratorService.fillForm(this.user, movement, date).then(() => console.log('Form generated'));
  }
}
