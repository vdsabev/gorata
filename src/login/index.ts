import { div, form, fieldset, input, br, button, CustomProperties } from 'compote/html';
import { Keyboard } from 'compote/components/keyboard';
import { constant, get, when, equal } from 'compote/components/utils';
import * as firebase from 'firebase/app';
import { redraw, route, withAttr } from 'mithril';

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
    div({ className: 'container fade-in-animation' }, [
      form({ className: 'form', onsubmit: returnFalse },
        fieldset({ className: 'form-panel', disabled: data.loading }, [
          input({
            className: 'form-input',
            type: 'email', name: 'email', placeholder: 'Имейл', autofocus: true, required: true,
            onkeyup: loginOnEnter, oninput: setEmail
          }),
          br(),
          input({
            className: 'form-input',
            type: 'password', name: 'password', placeholder: 'Парола', required: true,
            onkeyup: loginOnEnter, oninput: setPassword
          }),
          br(),
          button({ className: 'form-button', type: 'submit', onclick: login }, 'Вход')
        ])
      )
    ])
  )
};

const returnFalse = constant(false);

const setData = (propertyName: keyof typeof data) => (value: any) => data[propertyName] = value;
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
