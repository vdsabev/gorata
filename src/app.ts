import './assets/favicon.png';
import './assets/logo_192x192.png';
import './assets/logo_512x512.png';
import './manifest.json';

import './style.scss';
import './content/style.scss';

import { mount, redraw } from 'mithril';

import { initializeFirebaseApp } from './firebase';
import { Header } from './header';
import { mapLoaded } from './map';
import { initializeRouter } from './router';
import { store } from './store';

initialize();

function initialize() {
  initializeFirebaseApp();
  registerServiceWorker();
  subscribeToStore();
  initializeRouter();
}

function registerServiceWorker() {
  if (navigator.serviceWorker) {
    navigator.serviceWorker.register('service-worker.js', { scope: './' });
  }
}

function subscribeToStore() {
  store.subscribe(redraw);

  const unsubscribe = store.subscribe(() => {
    mount(document.querySelector('#header'), Header);
    unsubscribe();
  });
}
