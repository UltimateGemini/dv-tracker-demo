import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { UserLocation } from '../models/UserLocation';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  public location$: Observable<UserLocation[]>;
  public locationCollectionRef: AngularFirestoreCollection<UserLocation>;

  constructor(public afAuth: AngularFireAuth, public afStore: AngularFirestore) {
    this.afAuth.signInAnonymously();
    this.locationCollectionRef = this.afStore.collection('locations');
    this.location$ = this.locationCollectionRef.valueChanges();
  }
}
