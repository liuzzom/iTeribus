import { Injectable } from '@angular/core';

import { Storage } from '@ionic/storage';

@Injectable({
  providedIn: 'root'
})
export class StorageService {


  constructor(private storage: Storage) {
    this.init();
  }

  async init() {
    await this.storage.create();
  }

  public async get(key: string) {
    const data = await this.storage.get(key);
    return data;
  }

  public async remove(key: string){
    return await this.storage.remove(key);
  }

  // Create and expose methods that users of this service can
  // call, for example:
  public async set(key: string, value: any) {
    await this.storage.set(key, value);
  }

  public async getMovements() {
    let data = [];
    await this.storage.forEach((value, key, index) => {
      if (key !== 'user') {
        data.push(value);
      }
    });
    return data;
  }

}
