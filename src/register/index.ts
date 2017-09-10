import { div, form, fieldset, input, br, button } from 'compote/html';
import { Keyboard } from 'compote/components/keyboard';
import { constant, get, set, when, equal } from 'compote/components/utils';
import * as firebase from 'firebase/app';
import { redraw, route, withAttr, FactoryComponent } from 'mithril';

import * as notify from '../notify';

interface State {
  email?: string;
  password?: string;
  passwordConfirmation?: string;
  loading?: boolean;
}

// TODO: Use form data
// TODO: Add validation
export const Register: FactoryComponent<State> = () => {
  const state: State = {};

  const setEmail = withAttr('value', set<State>('email')(state));
  const setPassword = withAttr('value', set<State>('password')(state));
  const setPasswordConfirmation = withAttr('value', set<State>('passwordConfirmation')(state));

  const register = async () => {
    if (state.password !== state.passwordConfirmation) {
      notify.error(`Паролата не съвпада с потвърждението! Моля, опитайте отново!`);
      return;
    }

    try {
      state.loading = true;
      await firebase.auth().createUserWithEmailAndPassword(state.email, state.password);
      route.set('/');
    }
    catch (error) {
      notify.error(error);
      state.loading = false;
      redraw();
    }
  };

  const registerOnEnter = when(equal(get<KeyboardEvent>('keyCode'), Keyboard.ENTER), register);

  return {
    view: () => (
      div({ class: 'container fade-in-animation' }, [
        form({ class: 'form', onsubmit: returnFalse },
          fieldset({ class: 'form-panel', disabled: state.loading === true }, [
            input({
              class: 'form-input',
              type: 'email', name: 'email', placeholder: 'Имейл', autofocus: true, required: true,
              onkeyup: registerOnEnter, oninput: setEmail
            }),
            br(),
            input({
              class: 'form-input',
              type: 'password', name: 'password', placeholder: 'Парола', required: true,
              onkeyup: registerOnEnter, oninput: setPassword
            }),
            input({
              class: 'form-input',
              type: 'password', name: 'password_confirmation', placeholder: 'Потвърдете паролата', required: true,
              onkeyup: registerOnEnter, oninput: setPasswordConfirmation
            }),
            br(),
            button({ class: 'form-button', type: 'submit', onclick: register }, 'Регистрация')
          ])
        )
      ])
    )
  };
};

const returnFalse = constant(false);
