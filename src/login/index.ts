import './style.scss';

import { div, form, fieldset, input, br, button } from 'compote/html';
import { Keyboard } from 'compote/components/keyboard';
import { constant } from 'compote/components/utils';
import * as firebase from 'firebase/app';
import { route } from 'mithril';

import { component } from '../component';
import * as notify from '../notify';

import { FacebookLogo } from './facebook-logo';

interface State {
  email: string;
  password: string;
  loading: boolean;
}

// TODO: Use form data
// TODO: Add validation
export const LoginForm = component({
  reducers: {
    loading(loading = false, action, state: State, actions) {
      switch (action.type) {
        case 'SET_LOADING': return action.loading;
      }
      return loading;
    },
    email(email = '', action = {}) {
      switch (action.type) {
        case 'SET_EMAIL': return action.email;
      }
      return email;
    },
    password(password = '', action = {}) {
      switch (action.type) {
        case 'SET_PASSWORD': return action.password;
      }
      return password;
    }
  },

  actions: {
    loginWithFacebook: (): any => async (state: State, actions: any) => { // TODO: Type
      actions.setLoading(true);
      try {
        await firebase.auth().signInWithRedirect(new firebase.auth.FacebookAuthProvider());
      }
      catch (error) {
        notify.error(error);
      }
      actions.setLoading(false);
    },
    login: (): any => async (state: State, actions: any) => { // TODO: Type
      actions.setLoading(true);
      try {
        await firebase.auth().signInWithEmailAndPassword(state.email, state.password);
        route.set('/');
      }
      catch (error) {
        notify.error(error);
      }
      actions.setLoading(false);
    },
    loginOnEnter: (e: KeyboardEvent): any => e.keyCode === Keyboard.ENTER ? { type: 'LOGIN' } : null,
    setLoading: (loading: boolean): any => ({ type: 'SET_LOADING', loading }),
    setEmail: (e: Event): any => ({ type: 'SET_EMAIL', email: (<HTMLInputElement>e.currentTarget).value }),
    setPassword: (e: Event): any => ({ type: 'SET_PASSWORD', password: (<HTMLInputElement>e.currentTarget).value })
  },

  view: (vnode, state: State, actions) => (
    div({ class: 'container fade-in-animation' }, [
      form({ class: 'form', onsubmit: returnFalse },
        fieldset({ class: 'form-panel', disabled: state.loading }, [
          button({
            class: 'facebook-button width-100p br-md mb-xl bg-facebook pa-md color-neutral-light',
            type: 'button',
            onclick: actions.loginWithFacebook
          }, [
            FacebookLogo({ class: 'mr-sm mv-n-sm' }),
            'Вход с Facebook'
          ]),
          input({
            class: 'form-input',
            type: 'email', name: 'email', placeholder: 'Имейл', autofocus: true, required: true,
            onkeyup: actions.loginOnEnter, oninput: actions.setEmail
          }),
          br(),
          input({
            class: 'form-input',
            type: 'password', name: 'password', placeholder: 'Парола', required: true,
            onkeyup: actions.loginOnEnter, oninput: actions.setPassword
          }),
          br(),
          button({ class: 'form-button', type: 'submit', onclick: actions.login }, 'Вход')
        ])
      )
    ])
  )
});

const returnFalse = constant(false);
