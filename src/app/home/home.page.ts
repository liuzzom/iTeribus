import { Router, ActivatedRoute } from '@angular/router';
import { Movement } from './../../domain-model/Movement';
import { StorageService } from './../services/storage.service';
import { Component, Input, OnInit } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';
import { PdfGeneratorService } from "../services/pdf-generator.service";
import { User } from "../../domain-model/User";

import { Plugins, FilesystemDirectory, FilesystemEncoding } from '@capacitor/core';

const { Filesystem, Share } = Plugins;

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  showNoMovementsMsg: boolean = false;

  movements: Movement[] = [];
  user: User

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

  /*----------------------------------------------------------------------------------*/

  public async shareButton() {
    const blob = await this.pdfGeneratorService.fillForm(this.user, this.movements[0], false);
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = () => {
      let base64data = reader.result;
      this.fileWrite('prova.pdf', base64data);
    };
  }

  async debugToast(text: string) {
    const toast = await this.toastController.create({
      message: text,
      duration: 2000
    });
    toast.present();
  }

  async shareTest(attachmentUri: string) {
    let shareRet = await Share.share({
      title: 'See cool stuff',
      text: 'Really awesome thing you need to see right meow',
      url: attachmentUri,
      dialogTitle: 'Share with buddies'
    });
  }

  async fileWrite(filename: string, pdfBase64) {
    try {
      const result = await Filesystem.writeFile({
        path: filename,
        data: pdfBase64,
        directory: FilesystemDirectory.Documents
      }).then(writeFileResult => {
        console.log('File written');
        Filesystem.getUri({
          directory: FilesystemDirectory.Documents,
          path: filename
        }).then(uriResult => {
          const path = uriResult.uri;
          this.shareTest(path);
        });
      });
      console.log('Wrote file', result);
    } catch (e) {
      console.error('Unable to write file', e);
    }
  }

  async fileRead() {
    let contents = await Filesystem.readFile({
      path: 'file://storage/emulated/0/Download/Scuola.pdf'
    });
    this.debugToast(contents.data);
    console.log(contents);
  }

}
