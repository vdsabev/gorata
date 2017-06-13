import './assets/favicon.png';
import './assets/logo_192x192.png';
import './assets/logo_512x512.png';
import './manifest.json';
import './style.scss';

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
    applicationLoaded();
    unsubscribeContainers();
  });
}

function applicationLoaded() {
  // Header
  const header = document.querySelector('#header');
  header.classList.add('loaded');

  mount(header, { view: Header });

  // Map
  const map = document.querySelector('#map');
  map.classList.add('loaded');

  // Container
  // HACK: Magic number, `getAnimationDuration` returns `0s` here
  const container = document.querySelector('#container');
  setTimeout(() => container.classList.add('loaded'), 330);
}
