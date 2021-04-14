import { DatePipe } from '@angular/common';
import { NotificationsService } from './../services/notifications.service';
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Plugins } from '@capacitor/core';
import { AlertController, ToastController } from '@ionic/angular';

import { PdfGeneratorService } from '../services/pdf-generator.service';
import { StorageService } from './../services/storage.service';
import { Movement } from './../../domain-model/Movement';

import { User } from '../../domain-model/User';
import { Platform } from '@ionic/angular';

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
    private datePipe: DatePipe,
    public notificationsService: NotificationsService,
    private platform: Platform,
    private pdfGeneratorService: PdfGeneratorService,
    private router: Router,
    private storageService: StorageService,
    private toastController: ToastController
  ) {
    this.activatedRoute.params.subscribe(val => {
      this.ngOnInit();
    });
  }

  async ngOnInit() {
    this.notificationsService.requestNotificationPermission();
    // Check if the storage contains user information
    this.user = await this.storageService.get('user');

    if (!this.user) {
      // There is no user information...redirect to the user registration form
      this.router.navigate(['./new-user']);
    }

    // Get movements from storage using the service
    this.movements = await this.storageService.getMovements();
    this.showNoMovementsMsg = this.movements.length === 0;

    const todayMovements = this.getTodayMovements(this.movements);
    const firstMovementOfToday = todayMovements[0];

    if (firstMovementOfToday && firstMovementOfToday.repeat) {
      if (this.platform.is('desktop')) {
        this.notificationsService.sendLocalNotification(
          firstMovementOfToday.name,
          `Hai uno spostamento ${firstMovementOfToday.name} alle ${this.datePipe.transform(firstMovementOfToday.generationOptions.time, 'HH:mm')}. `,
          15000
        );

      } else if (this.platform.is('android')) {
        this.notificationsService.sendNotificationThroughSW(
          firstMovementOfToday.name,
          `Hai uno spostamento ${firstMovementOfToday.name} alle ${this.datePipe.transform(firstMovementOfToday.generationOptions.time, 'HH:mm')}. `,
          15000
        );
      }
    }
  }

  private getTodayMovements(movements: Movement[]) {
    const today = new Date().getDay();

    let todayMovements = movements.filter(movement => {
      const daysAsStringList: string[] = [];
      if (movement.repeat) {
        for (const day of movement.generationOptions.days) {
          daysAsStringList.push(day.toString());
        }
      }
      return movement.repeat && movement.generationOptions && daysAsStringList.includes(today.toString());
    });
    return todayMovements.sort((a,b) => a.generationOptions.time <= b.generationOptions.time ? 1 : -1 ) ;
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
            this.generatePDF(this.movements[index], false);
          }
        },
        {
          text: 'PER OGGI',
          handler: () => {
            this.generatePDF(this.movements[index], true);
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
