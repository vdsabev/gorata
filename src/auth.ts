import * as firebase from 'firebase/app';
import 'firebase/auth';

import * as notify from './notify';
import { Actions, store } from './store';
import { UserServices } from './user';

export function initializeAuth() {
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
    const profile = await UserServices.getProfile(id);
    store.dispatch({ type: Actions.USER_PROFILE_LOADED, profile });
  }
  catch (error) {
    notify.error(error);
  }
};

const loadUserRole = async (id: string) => {
  try {
    const role = await UserServices.getRole(id);
    store.dispatch({ type: Actions.USER_ROLE_LOADED, role });
  }
  catch (error) {
    notify.error(error);
  }
};
