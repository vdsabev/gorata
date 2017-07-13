import { Keyboard } from 'compote/components/keyboard';
import { constant, get, when, equal } from 'compote/components/utils';
import * as firebase from 'firebase/app';
import { redraw, route, withAttr } from 'mithril';

interface Data {
  email?: string;
  password?: string;
  loading?: boolean;
}

const init = () => {
  vm.data = {};
};

const setData = (propertyName: keyof Data) => (value: any): any => vm.data[propertyName] = value;

const login = async () => {
  try {
    vm.data.loading = true;
    await firebase.auth().signInWithEmailAndPassword(vm.data.email, vm.data.password);
    route.set('/');
  }
  catch (error) {
    window.alert(error);
    vm.data.loading = false;
    redraw();
  }
};

export const vm = {
  data: <Data>{},

  init,
  returnFalse: constant(false),
  setEmail: withAttr('value', setData('email')),
  setPassword: withAttr('value', setData('password')),

  login,
  loginOnEnter: when(equal(get<KeyboardEvent>('keyCode'), Keyboard.ENTER), login),
  loginWithFacebook: async () => {
    try {
      await firebase.auth().signInWithRedirect(new firebase.auth.FacebookAuthProvider());
    }
    catch (error) {
      window.alert(error.message);
    }
  }
};
