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

  public sendNotificationThroughSW(title: string, body: string, timeout: number) {
    if (this.swNotificationsGranted) {
      setTimeout(() => {
        navigator.serviceWorker.ready.then(registration => {
          registration.showNotification(title, {
            body: body,
            icon: '../assets/icons/icon-192x192.png',
            vibrate: [200, 100, 200],
            tag: 'movement'
          });
        });
      }, timeout);
    }

  }

  public async sendLocalNotification(title: string, body: string, timeout: number) {
    const notifs = await LocalNotifications.schedule({
      notifications: [
        {
          title: title,
          body: body,
          id: Math.random() * 1000000,
          schedule: { at: new Date(Date.now() + timeout) },
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
