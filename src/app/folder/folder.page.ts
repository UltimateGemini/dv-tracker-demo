import { Component } from '@angular/core';
import {
  NativeGeocoder,
  NativeGeocoderResult,
  NativeGeocoderOptions,
} from '@ionic-native/native-geocoder/ngx';
import { StorageService } from '../services/storage.service';
import { UserLocation } from '../models/UserLocation';

import { Plugins } from '@capacitor/core';
const { Geolocation } = Plugins;

@Component({
  selector: 'app-folder',
  templateUrl: './folder.page.html',
  styleUrls: ['./folder.page.scss'],
})
export class FolderPage {
  latitude: number;
  longitude: number;
  address: string;
  locationObj: UserLocation = <UserLocation>{};

  constructor(
    private nativeGeocoder: NativeGeocoder,
    private storage: StorageService
  ) {
    this.getLocation();
  }

  async getLocation() {
    const position = await Geolocation.getCurrentPosition();
    console.log('Current Position: ', position);

    this.latitude = position.coords.latitude;
    this.longitude = position.coords.longitude;

    this.locationObj.id = Math.floor(Math.random() * 100);
    this.locationObj.accuracy = position.coords.accuracy;
    this.locationObj.altitude = position.coords.altitude;
    this.locationObj.altitudeAccuracy = position.coords.altitudeAccuracy;
    this.locationObj.latitude = position.coords.latitude;
    this.locationObj.longitude = position.coords.longitude;
    this.locationObj.heading = position.coords.heading;
    this.locationObj.speed = position.coords.speed;
    this.locationObj.timestamp = position.timestamp;

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

        this.address = loc.subThoroughfare
          .concat(' ', loc.thoroughfare)
          .concat(' ', loc.locality)
          .concat(', ', loc.administrativeArea)
          .concat(' ', loc.postalCode);

        this.locationObj.fullAddress = this.address;
        this.locationObj.shortAddress = loc.subThoroughfare.concat(
          ' ',
          loc.thoroughfare
        );
        this.locationObj.locality = loc.locality
          .concat(', ', loc.administrativeArea)
          .concat(' ', loc.postalCode);

        // Sets obj in localstorage
        this.storage.setObject(this.locationObj);

        // Gets obj in localstorage
        this.storage.getItem();
      })
      .catch((error: any) => console.log(error));
  }
}
