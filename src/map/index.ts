import * as firebase from 'firebase/app';

import { div, ComponentNode } from 'compote/html';

import { DataSnapshot } from '../firebase';
import { Request } from '../request';
import { store, Actions } from '../store';
import { loadScript } from '../utils';

export const initializeMap = async () => {
  await loadScript(`https://maps.googleapis.com/maps/api/js?key=${process.env.GOOGLE_API_KEY}`);

  const map = document.querySelector('#map');
  map.classList.add('loaded');

  store.dispatch({ type: Actions.MAP_INITIALIZED, element: map });

  const requestsRef = firebase.database().ref('requests');

  requestsRef.off('child_added', requestAdded);
  requestsRef.on('child_added', requestAdded);

  requestsRef.off('child_removed', requestRemoved);
  requestsRef.on('child_removed', requestRemoved);
};

const requestAdded = (requestChildSnapshot: DataSnapshot<Request>) => {
  const { map } = store.getState(); // TODO: Handle case where `map` is null
  const request: Request = { id: requestChildSnapshot.key, ...requestChildSnapshot.val() };
  store.dispatch({ type: Actions.REQUEST_ADDED, request, map });
};

const requestRemoved = (requestChildSnapshot: DataSnapshot<Request>) => {
  const { map } = store.getState(); // TODO: Handle case where `map` is null
  const request: Partial<Request> = { id: requestChildSnapshot.key };
  store.dispatch({ type: Actions.REQUEST_REMOVED, request, map });
};
