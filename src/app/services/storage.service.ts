import { Injectable } from '@angular/core';

import { Plugins } from '@capacitor/core';
const { Geolocation, Storage } = Plugins;

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  public savedData: any;
  
  constructor() { }

  async setObject(locationObj: Location) {
    await Storage.set({
      key: 'user-location',
      value: JSON.stringify(locationObj)
    });
  }

  async getItem() {
    const { value } = await Storage.get({ key: 'user-location' });
    console.log('Storage: ', value);
    this.savedData = JSON.stringify(JSON.parse(value), null, 10) ;
    console.log('retrievedObject: ', this.savedData);
  }
}
