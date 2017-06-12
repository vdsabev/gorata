import * as firebase from 'firebase/app';
import 'firebase/database';

import { div, ComponentNode } from 'compote/html';
import * as $script from 'scriptjs';

export const initializeMap = () => {
  $script(`https://maps.googleapis.com/maps/api/js?key=${process.env.GOOGLE_API_KEY}`, () => {
    const map = new google.maps.Map(document.querySelector('#map'), {
      zoom: 8,
      center: { lat: 42.765833, lng: 25.238611 }
    });

    const markers: Record<string, google.maps.Marker> = {};

    const requestsRef = firebase.database().ref('requests');
    requestsRef.off('child_added');

    requestsRef.on('child_added', (requestChildSnapshot: any) => {
      const request = { id: requestChildSnapshot.key, ...requestChildSnapshot.val() };
      markers[request.id] = new google.maps.Marker({
        position: request.geo,
        map,
        title: request.title
      });
    });

    requestsRef.on('child_removed', (requestChildSnapshot: any) => {
      const marker = markers[requestChildSnapshot.key];
      if (marker) {
        marker.setMap(null);
        delete markers[requestChildSnapshot.key];
      }
    });
  });
};
