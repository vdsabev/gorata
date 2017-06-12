import { div, ComponentNode } from 'compote/html';
import * as $script from 'scriptjs';

let map: google.maps.Map;

export const initializeMap = () => {
  $script(`https://maps.googleapis.com/maps/api/js?key=${process.env.GOOGLE_API_KEY}`, () => {
    map = new google.maps.Map(document.querySelector('#map'), {
      zoom: 8,
      center: { lat: 42.765833, lng: 25.238611 }
    });
  });
};
