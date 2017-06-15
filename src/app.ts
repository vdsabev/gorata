import './assets/favicon.png';
import './assets/logo_192x192.png';
import './assets/logo_512x512.png';
import './manifest.json';

import './style.scss';
import './container/style.scss';

import { mount, redraw } from 'mithril';

import { initializeFirebaseApp } from './firebase';
import { Header } from './header';
import { initializeMap } from './map';
import { initializeRouter } from './router';
import { store } from './store';

initialize();

function initialize() {
  initializeMap();
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

  const unsubscribeContainers = store.subscribe(() => {
    mount(document.querySelector('#header'), {
      view() {
        const { currentUser } = store.getState();
        return Header(currentUser);
      }
    });
    unsubscribeContainers();
  });
}
