import { Component } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Plugins } from '@capacitor/core';
const { Share } = Plugins;

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(public platform: Platform) { }

  public async share() {
    await Share.share({
      title: 'ITeribus',
      text: 'Una App per semplificare la creazione di autocertificazioni per gli spostamenti.',
      url: 'https://itineribus-832f3.web.app/',
      dialogTitle: 'Condividi con un Amico'
    });
  }

  public isMobile(): boolean {
    return this.platform.is('android') || this.platform.is('ios');
  }
}
