import * as firebase from 'firebase/app';
import 'firebase/database';

import { div, ComponentNode } from 'compote/html';
import * as $script from 'scriptjs';

import { DataSnapshot } from '../firebase';
import { Request } from '../request';
import { store, Actions } from '../store';

export const initializeMap = () => {
  $script(`https://maps.googleapis.com/maps/api/js?key=${process.env.GOOGLE_API_KEY}`, () => {
    const bounds = new google.maps.LatLngBounds();
    bounds.extend({ lat: 43.541944, lng: 28.609722 }); // East
    bounds.extend({ lat: 43.80948, lng: 22.357125 }); // West
    bounds.extend({ lat: 44.2125, lng: 22.665833 }); // North
    bounds.extend({ lat: 41.234722, lng: 25.288333 }); // South
    const map = new google.maps.Map(document.querySelector('#map'), { center: bounds.getCenter() });
    map.fitBounds(bounds);

    store.dispatch({ type: Actions.RESET_REQUESTS, map });

    const requestsRef = firebase.database().ref('requests');
    requestsRef.off('child_added');
    requestsRef.on('child_added', (requestChildSnapshot: DataSnapshot<Request>) => {
      const request: Request = { id: requestChildSnapshot.key, ...requestChildSnapshot.val() };
      store.dispatch({ type: Actions.REQUEST_ADDED, request, map });
    });

    requestsRef.on('child_removed', (requestChildSnapshot: DataSnapshot<Request>) => {
      const request: Partial<Request> = { id: requestChildSnapshot.key };
      store.dispatch({ type: Actions.REQUEST_REMOVED, request, map });
    });
  });
};
