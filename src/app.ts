import './assets/default.png';
import './assets/error.png';
import './assets/favicon.png';
import './assets/logo_192x192.png';
import './assets/logo_512x512.png';
import './manifest.json';

import './style.scss';
import './content/style.scss';

import { setHyperscriptFunction } from 'compote';
import * as m from 'mithril';

import { initializeFirebaseApp } from './firebase';
import { Header } from './header';
import './map';
import { initializeRouter } from './router';
import { store } from './store';

setHyperscriptFunction(m);
initializeApp();

function initializeApp() {
  initializeFirebaseApp();
  subscribeToStore();
  initializeRouter();
}

function subscribeToStore() {
  store.subscribe(m.redraw);

  const unsubscribe = store.subscribe(() => {
    m.mount(document.querySelector('#header'), Header);
    unsubscribe();
  });
}
