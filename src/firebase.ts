import * as firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';
import 'firebase/storage';

import * as notify from './notify';
import { Actions, store } from './store';
import { getUserProfile, getUserRole  } from './user';

export interface DataSnapshot<T> extends firebase.database.DataSnapshot {
  val(): T;
}

export function initializeFirebaseApp() {
  firebase.initializeApp({
    apiKey: process.env.GOOGLE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.FIREBASE_DATABASE_URL,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID
  });

  firebase.auth().onAuthStateChanged(async (auth: firebase.User) => {
    const action = auth ? Actions.USER_LOGGED_IN : Actions.USER_LOGGED_OUT;
    store.dispatch({ type: action, auth });

    if (!auth) return;

    loadUserProfile(auth.uid);
    loadUserRole(auth.uid);
  });
}

const loadUserProfile = async (id: string) => {
  try {
    const profile = await getUserProfile(id);
    store.dispatch({ type: Actions.USER_PROFILE_LOADED, profile });
  }
  catch (error) {
    notify.error(error);
  }
};

const loadUserRole = async (id: string) => {
  try {
    const role = await getUserRole(id);
    store.dispatch({ type: Actions.USER_ROLE_LOADED, role });
  }
  catch (error) {
    notify.error(error);
  }
};
