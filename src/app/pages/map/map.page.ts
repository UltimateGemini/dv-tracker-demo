import { Component, ElementRef, ViewChild } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import {
  AngularFirestore,
  AngularFirestoreCollection,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Plugins } from '@capacitor/core';
const { Geolocation } = Plugins;

declare var google: any;

@Component({
  selector: 'app-map',
  templateUrl: './map.page.html',
  styleUrls: ['./map.page.scss'],
})
export class MapPage {
  @ViewChild('map') mapElement: ElementRef;
  public location$: Observable<any>;
  public locationsCollection: AngularFirestoreCollection<any>;
  public map: any;
  public markers = [];
  public isTracking = false;
  public watch: string;
  public user = null;

  constructor(
    private afAuth: AngularFireAuth,
    private afs: AngularFirestore
  ) {
    this.anonLogin();
  }

  ionViewWillEnter() {
    this.loadMap();
  }

  // Perform an anonymous login and load data
  anonLogin() {
    this.afAuth.signInAnonymously().then(res => {
      this.user = res.user;
      // console.log('UserData: ', res);
 
      this.locationsCollection = this.afs.collection(
        `locations/${this.user.uid}/track`,
        ref => ref.orderBy('timestamp')
      );
 
      // Make sure we also get the Firebase item ID!
      this.location$ = this.locationsCollection.snapshotChanges().pipe(
        map(actions =>
          actions.map(a => {
            const data = a.payload.doc.data();
            const id = a.payload.doc.id;
            return { id, ...data };
          })
        )
      );
 
      // Update Map marker on every change
      this.location$.subscribe(locations => {
        this.updateMap(locations);
      });
    });
  }

  // Initialize a blank map
  loadMap() {
    let latLng = new google.maps.LatLng(27.994402, -81.760254);
 
    let mapOptions = {
      center: latLng,
      zoom: 6,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
 
    this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
  }

  // Use Capacitor to track our geolocation
  startTracking() {
    this.isTracking = true;
    this.watch = Geolocation.watchPosition({}, (position, err) => {
      if (position) {
        this.addNewLocation(
          position.coords.latitude,
          position.coords.longitude,
          position.timestamp
        );
      }
    });
  }
   
  // Unsubscribe from the geolocation watch using the initial ID
  stopTracking() {
    Geolocation.clearWatch({ id: this.watch }).then(() => {
      this.isTracking = false;
    });
  }
   
  // Save a new location to Firebase and center the map
  addNewLocation(lat: number, lng: number, timestamp: number) {
    this.locationsCollection.add({
      lat,
      lng,
      timestamp
    });
   
    let position = new google.maps.LatLng(lat, lng);
    this.map.setCenter(position);
    this.map.setZoom(15);
  }
   
  // Delete a location from Firebase
  deleteLocation(pos: { id: string; }) {
    this.locationsCollection.doc(pos.id).delete();
  }
   
  // Redraw all markers on the map
  updateMap(locations: any) {
    // Remove all current marker
    this.markers.map(marker => marker.setMap(null));
    this.markers = [];
   
    for (let loc of locations) {
      let latLng = new google.maps.LatLng(loc.lat, loc.lng);
   
      let marker = new google.maps.Marker({
        map: this.map,
        animation: google.maps.Animation.DROP,
        position: latLng
      });
      this.markers.push(marker);
    }
  }
}
