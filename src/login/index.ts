import './style.scss';

import { div, form, fieldset, input, br, button } from 'compote/html';
import { Keyboard } from 'compote/components/keyboard';
import { constant, get, when, equal } from 'compote/components/utils';
import * as firebase from 'firebase/app';
import { redraw, route, withAttr } from 'mithril';

import { FacebookLogo } from './facebook-logo';

let data: Data;
interface Data {
  email?: string;
  password?: string;
  loading?: boolean;
}

// TODO: Use form data
// TODO: Add validation
export const LoginView = {
  oninit() {
    data = {};
  },
  view: () => (
    div({ class: 'container fade-in-animation' }, [
      form({ class: 'form', onsubmit: returnFalse },
        fieldset({ class: 'form-panel', disabled: data.loading }, [
          button({
            class: 'facebook-button width-100p br-md mb-xl bg-facebook pa-md color-neutral-light',
            type: 'button',
            onclick: loginWithFacebook
          }, [
            FacebookLogo({ class: 'mr-sm mv-n-sm' }),
            'Вход с Facebook'
          ]),
          input({
            class: 'form-input',
            type: 'email', name: 'email', placeholder: 'Имейл', autofocus: true, required: true,
            onkeyup: loginOnEnter, oninput: setEmail
          }),
          br(),
          input({
            class: 'form-input',
            type: 'password', name: 'password', placeholder: 'Парола', required: true,
            onkeyup: loginOnEnter, oninput: setPassword
          }),
          br(),
          button({ class: 'form-button', type: 'submit', onclick: login }, 'Вход')
        ])
      )
    ])
  )
};

const returnFalse = constant(false);

const setData = (propertyName: keyof Data) => (value: any): any => data[propertyName] = value;
const setEmail = withAttr('value', setData('email'));
const setPassword = withAttr('value', setData('password'));

const login = async () => {
  try {
    data.loading = true;
    await firebase.auth().signInWithEmailAndPassword(data.email, data.password);
    route.set('/');
  }
  catch (error) {
    window.alert(error);
    data.loading = false;
    redraw();
  }
};

const loginOnEnter = when(equal(get<KeyboardEvent>('keyCode'), Keyboard.ENTER), login);

const loginWithFacebook = async () => {
  try {
    await firebase.auth().signInWithRedirect(new firebase.auth.FacebookAuthProvider());
  }
  catch (error) {
    window.alert(error.message);
  }
};
