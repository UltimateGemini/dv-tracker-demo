import { Component, ElementRef, ViewChild } from '@angular/core';
import {
  NativeGeocoder,
  NativeGeocoderResult,
  NativeGeocoderOptions,
} from '@ionic-native/native-geocoder/ngx';

import { Plugins } from '@capacitor/core';
const { Geolocation, Storage } = Plugins;

interface ULocation {
  id: number;
  accuracy: number;
  altitude?: number;
  altitudeAccuracy?: number;
  latitude: number;
  longitude: number;
  heading?: number;
  speed?: number;
  timestamp: number;
  fullAddress: string;
  shortAddress: string;
  locality: string;

}

@Component({
  selector: 'app-folder',
  templateUrl: './folder.page.html',
  styleUrls: ['./folder.page.scss'],
})
export class FolderPage {
  latitude: number;
  longitude: number;
  address: string;
  locationObj: ULocation = <ULocation>{};
  savedData: any;

  constructor(private nativeGeocoder: NativeGeocoder) {
    this.getLocation();
  }

  async getLocation() {
    const position = await Geolocation.getCurrentPosition();
    //console.log('Current Position: ', position);

    this.latitude = position.coords.latitude;
    this.longitude = position.coords.longitude;

    this.locationObj.id = Math.floor(Math.random() * 100);
    this.locationObj.accuracy = position.coords.accuracy;
    this.locationObj.altitude = position.coords.altitude
    this.locationObj.altitudeAccuracy = position.coords.altitudeAccuracy;
    this.locationObj.latitude = position.coords.latitude;
    this.locationObj.longitude = position.coords.longitude;
    this.locationObj.heading = position.coords.heading;
    this.locationObj.speed = position.coords.speed;
    this.locationObj.timestamp = position.timestamp;
    // console.log('locationObj', this.locationObj);

    // Sets obj in localstorage
    // this.setObject(this.locationObj);
    // this.getItem();
    
    this.reverseGeocodeLocation(this.latitude, this.longitude);
  }

  reverseGeocodeLocation(lat: number, long: number) {
    let options: NativeGeocoderOptions = {
      useLocale: true,
      maxResults: 5,
    };
    this.nativeGeocoder
      .reverseGeocode(lat, long, options)
      .then((result: NativeGeocoderResult[]) => {
        let loc = result[0];
        //console.log('Reversed Location: ', loc);
        this.address = loc.subThoroughfare
          .concat(' ', loc.thoroughfare)
          .concat(' ', loc.locality)
          .concat(', ', loc.administrativeArea)
          .concat(' ', loc.postalCode);

        this.locationObj.fullAddress = this.address;
        this.locationObj.shortAddress = loc.subThoroughfare.concat(' ', loc.thoroughfare);
        this.locationObj.locality = loc.locality.concat(', ', loc.administrativeArea).concat(' ', loc.postalCode);
        // console.log('locationObj: ', this.locationObj);
        // Sets obj in localstorage
        this.setObject(this.locationObj);
        // Gets obj in localstorage
        this.getItem();
      })
      .catch((error: any) => console.log(error));
  }

  async setObject(locationObj: ULocation) {
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
