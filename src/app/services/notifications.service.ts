import { Plugins } from '@capacitor/core';
import { Injectable } from '@angular/core';

const { LocalNotifications } = Plugins;

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {

  private _swNotificationsGranted: boolean;

  constructor() {
    this.requestNotificationPermission();
  }

  public async requestNotificationPermission() {
    await LocalNotifications.requestPermissions();

    Notification.requestPermission(result => {
      if (result === 'granted') {
        this._swNotificationsGranted = true;
        navigator.serviceWorker.register('ngsw-worker.js');
      } else {
        this._swNotificationsGranted = false;
      }
    });
  }

  public sendNotificationThroughSW() {
    if (this.swNotificationsGranted) {
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

  }

  public async sendLocalNotification() {
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

  public get swNotificationsGranted() {
    return this._swNotificationsGranted;
  }
}
