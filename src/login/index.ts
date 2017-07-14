import './style.scss';

import { div, form, fieldset, input, br, button } from 'compote/html';
import { Keyboard } from 'compote/components/keyboard';
import { constant, get, when, equal } from 'compote/components/utils';
import * as firebase from 'firebase/app';
import { redraw, route, withAttr, ClassComponent } from 'mithril';

import { FacebookLogo } from './facebook-logo';

interface Data {
  email?: string;
  password?: string;
  loading?: boolean;
}

// TODO: Use form data
// TODO: Add validation
export class LoginView implements ClassComponent<any> {
  data: Data;

  oninit() {
    this.data = {};
  }

  view() {
    return (
      div({ class: 'container fade-in-animation' }, [
        form({ class: 'form', onsubmit: this.returnFalse },
          fieldset({ class: 'form-panel', disabled: this.data.loading }, [
            button({
              class: 'facebook-button width-100p br-md mb-xl bg-facebook pa-md color-neutral-light',
              type: 'button',
              onclick: this.loginWithFacebook
            }, [
              FacebookLogo({ class: 'mr-sm mv-n-sm' }),
              'Вход с Facebook'
            ]),
            input({
              class: 'form-input',
              type: 'email', name: 'email', placeholder: 'Имейл', autofocus: true, required: true,
              onkeyup: this.loginOnEnter, oninput: this.setEmail
            }),
            br(),
            input({
              class: 'form-input',
              type: 'password', name: 'password', placeholder: 'Парола', required: true,
              onkeyup: this.loginOnEnter, oninput: this.setPassword
            }),
            br(),
            button({ class: 'form-button', type: 'submit', onclick: this.login }, 'Вход')
          ])
        )
      ])
    );
  }

  returnFalse = constant(false);

  setData = (propertyName: keyof Data) => (value: any): any => this.data[propertyName] = value;
  setEmail = withAttr('value', this.setData('email'));
  setPassword = withAttr('value', this.setData('password'));

  login = async () => {
    try {
      this.data.loading = true;
      await firebase.auth().signInWithEmailAndPassword(this.data.email, this.data.password);
      route.set('/');
    }
    catch (error) {
      window.alert(error);
      this.data.loading = false;
      redraw();
    }
  }

  loginOnEnter = when(equal(get<KeyboardEvent>('keyCode'), Keyboard.ENTER), this.login);

  loginWithFacebook = async () => {
    try {
      await firebase.auth().signInWithRedirect(new firebase.auth.FacebookAuthProvider());
    }
    catch (error) {
      window.alert(error.message);
    }
  }
}
