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

type PathParams = Record<string, string>;

const getRef = (path?: string) => firebase.database().ref(path);

export const FirebaseServices = {
  query: <T, U extends (Record<string, T> | T[]) = Record<string, T>>(
    getPath: (params?: PathParams) => string,
    getValue?: (id: string, value: T) => T
  ) => async (params?: PathParams): Promise<U> => {
    const snapshot: DataSnapshot<Record<string, T> | T[]> = await getRef(getPath(params)).once('value');
    if (!(snapshot && snapshot.exists())) return null;

    const data = snapshot.val();
    return <U>(getValue ? Object.keys(data).map((id) => getValue(id, (<Record<string, T>>data)[id])) : data);
  },

  get: <T>(
    getPath: (params?: PathParams) => string,
    getValue?: (id: string, value: T) => T
  ) => async (params?: PathParams): Promise<T> => {
    const snapshot: DataSnapshot<T> = await getRef(getPath(params)).once('value');
    if (!(snapshot && snapshot.exists())) return null;
    return getValue ? getValue(snapshot.key, snapshot.val()) : snapshot.val();
  },

  push: <T>(getPath: (params: PathParams) => string) => (params: PathParams, value: T): Promise<T> => getRef(getPath(params)).push(value),
  set: <T>(getPath: (params: PathParams) => string) => (params: PathParams, value: T): Promise<T> => getRef(getPath(params)).set(value),
  update: <T>(getPath: (params: PathParams) => string) => (params: PathParams, value: T): Promise<T> => getRef(getPath(params)).update(value)
};
