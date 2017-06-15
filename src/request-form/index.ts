import { div, form, fieldset, input, br, textarea, button, CustomProperties } from 'compote/html';
import { flex } from 'compote/components/flex';
import { constant } from 'compote/components/utils';
import * as firebase from 'firebase/app';
import { redraw, route, withAttr } from 'mithril';

import { mapLoaded } from '../map';
import { Request } from '../request';
import { store } from '../store';
import { loadScript } from '../utils';

const initializeData = (): Data => data = { request: {}, mapEventListeners: [] };
let data: Data = initializeData();
interface Data {
  request?: Partial<Request>;
  mapEventListeners?: google.maps.MapsEventListener[];
  requestMarker?: google.maps.Marker;
  loading?: boolean;
}

// TODO: Use form data
// TODO: Add validation
export const RequestForm = (props?: CustomProperties) => (
  div({ className: 'flex-row justify-content-stretch align-items-stretch container', oninit: initializeData, ...props }, [
    form({ className: 'form', style: flex(1), onsubmit: returnFalse },
      fieldset({ className: 'form-panel lg', disabled: data.loading }, [
        input({
          className: 'form-input',
          type: 'text', name: 'title', placeholder: 'Къде искате да озелените?', autofocus: true, required: true,
          value: data.request.title, oninput: setTitle,
          oncreate: createSearchBox,
          onremove: destroySearchBox
        }),
        br(),
        br(),
        textarea({
          className: 'form-input',
          name: 'text', placeholder: 'От какво имате нужда?', rows: 15,
          value: data.request.text, oninput: setText
        }),
        br(),
        br(),
        button({ className: 'form-button', type: 'submit', onclick: createRequest }, 'Създаване')
      ])
    )
  ])
);

const returnFalse = constant(false);

const setRequestData = (propertyName: keyof typeof data.request) => (value: any) => data.request[propertyName] = value;
const setTitle = withAttr('value', setRequestData('title'));
const setText = withAttr('value', setRequestData('text'));

const createSearchBox = async ({ dom }: { dom: HTMLElement }) => {
  await mapLoaded;

  const { map } = store.getState();
  const searchBox = new google.maps.places.SearchBox(<HTMLInputElement>dom);
  data.mapEventListeners.push(
    map.addListener('bounds_changed', () => searchBox.setBounds(map.getBounds()))
  );

  searchBox.addListener('places_changed', () => {
    const places = searchBox.getPlaces();

    const [place] = places;
    if (!(place && place.geometry)) return;

    const { location } = place.geometry;

    map.panTo(location);

    const minZoom = 17;
    if (map.getZoom() < minZoom) {
      map.setZoom(minZoom);
    }

    createRequestMarker(map, location);
  });

  data.mapEventListeners.push(
    map.addListener('click', (e: google.maps.MouseEvent) => createRequestMarker(map, e.latLng))
  );
};

const destroySearchBox = () => {
  if (data.mapEventListeners) {
    data.mapEventListeners.map((listener) => listener.remove());
  }

  safelyDestroyMarker(data.requestMarker);
};

const createRequestMarker = (map: google.maps.Map, position: google.maps.LatLng) => {
  safelyDestroyMarker(data.requestMarker);
  data.requestMarker = new google.maps.Marker({ map, position });
};

const safelyDestroyMarker = (marker: google.maps.Marker) => {
  if (marker) {
    marker.setMap(null);
  }
};

const createRequest = async () => {
  try {
    data.loading = true;

    const { currentUser, map } = store.getState();
    const newRequest: Partial<Request> = {
      ...data.request,
      geo: map.getCenter().toJSON(),
      created: firebase.database.ServerValue.TIMESTAMP,
      createdBy: currentUser.auth.uid
    };
    await firebase.database().ref('requests').push(newRequest);

    route.set('/');
  }
  catch (error) {
    window.alert(error);
    data.loading = false;
    redraw();
  }
};
