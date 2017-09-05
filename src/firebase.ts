import * as firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';
import 'firebase/storage';

export interface DataSnapshot<T> extends firebase.database.DataSnapshot {
  val(): T;
}

export function initializeFirebaseApp(options = {
  apiKey: process.env.GOOGLE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.FIREBASE_DATABASE_URL,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID
}) {
  firebase.initializeApp(options);
}
