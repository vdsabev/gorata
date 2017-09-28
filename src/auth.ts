import * as firebase from 'firebase/app';
import 'firebase/auth';

import * as notify from './notify';
import { Actions, store } from './store';
import { UserServices } from './user';

let initialUserAuthResolver: { resolve: Function, done?: boolean };
export const initialUserAuth = new Promise<firebase.User>((resolve) => initialUserAuthResolver = { resolve });

export function initializeAuth() {
  firebase.auth().onAuthStateChanged(async (auth: firebase.User) => {
    const action = auth ? Actions.USER_LOGGED_IN : Actions.USER_LOGGED_OUT;
    store.dispatch({ type: action, auth });

    if (!initialUserAuthResolver.done) {
      initialUserAuthResolver.resolve(auth);
      initialUserAuthResolver.done = true;
    }

    if (!auth) return;

    loadUserProfile(auth.uid);
    loadUserRole(auth.uid);
  });
}

const loadUserProfile = async (userId: string) => {
  try {
    const profile = await UserServices.getProfile({ userId });
    store.dispatch({ type: Actions.USER_PROFILE_LOADED, profile });
  }
  catch (error) {
    notify.error(error);
  }
};

const loadUserRole = async (userId: string) => {
  try {
    const role = await UserServices.getRole({ userId });
    store.dispatch({ type: Actions.USER_ROLE_LOADED, role });
  }
  catch (error) {
    notify.error(error);
  }
};
