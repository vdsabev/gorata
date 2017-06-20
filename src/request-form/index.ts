import { div, form, fieldset, input, a, small, br, textarea, button, CustomProperties } from 'compote/html';
import { flex } from 'compote/components/flex';
import { constant } from 'compote/components/utils';
import * as firebase from 'firebase/app';
import { redraw, route, withAttr } from 'mithril';

import { mapLoaded } from '../map';
import { Request } from '../request';
import { store } from '../store';
import { loadScript } from '../utils';

let data: Data;
interface Data {
  request?: Partial<Request>;
  mapEventListeners?: google.maps.MapsEventListener[];
  requestMarker?: google.maps.Marker;
  addressSuggestion?: string;
  loading?: boolean;
}

// TODO: Use form data
// TODO: Add validation
export const RequestFormView = {
  oninit() {
    data = { request: {}, mapEventListeners: [] };
  },
  onremove() {
    if (data.mapEventListeners) {
      data.mapEventListeners.map((listener) => listener.remove());
    }

    destroyMarker(data.requestMarker);
  },
  view: () => (
    div({ className: 'flex-row justify-content-stretch align-items-stretch container' }, [
      form({ className: 'form', style: flex(1), onsubmit: returnFalse },
        fieldset({ className: 'form-panel lg', disabled: data.loading }, [
          input({
            className: 'form-input',
            type: 'text', name: 'title', placeholder: 'Къде искате да озелените?', autofocus: true, required: true,
            value: data.request.title, oninput: setTitle,
            oncreate: createSearchBox
          }),
          data.addressSuggestion ? a({ onclick: setAddress }, small(`Може би имахте предвид ${data.addressSuggestion}?`)) : null,
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
  )
};

const returnFalse = constant(false);

const setRequestData = (propertyName: keyof typeof data.request) => (value: any) => data.request[propertyName] = value;
const setTitle = withAttr('value', setRequestData('title'));
const setText = withAttr('value', setRequestData('text'));
const setAddress = () => {
  data.request.title = data.addressSuggestion;
  data.addressSuggestion = null;
};

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

    // NOTE: Because this is not a Mithril event, we have to set the input's value manually
    data.request.title = (<HTMLInputElement>dom).value;
    createRequestMarker(map, location, place.formatted_address);
  });

  data.mapEventListeners.push(
    map.addListener('click', (e: google.maps.MouseEvent) => createRequestMarker(map, e.latLng))
  );
};

const createRequestMarker = async (map: google.maps.Map, position: google.maps.LatLng, address?: string) => {
  destroyMarker(data.requestMarker);
  data.requestMarker = new google.maps.Marker({ map, position });

  if (!address) {
    try {
      address = await getAddressByLocation(position);
    }
    catch (error) {
      return;
    }
  }

  if (address !== data.request.title) {
    data.addressSuggestion = address;
    redraw();
  }
};

const getAddressByLocation = (location: google.maps.LatLng) => new Promise<string>((resolve, reject) => {
  const service = new google.maps.Geocoder();
  service.geocode({ location }, (results, status) => {
    const [result] = results;
    if (!result || (status !== google.maps.GeocoderStatus.OK && status !== google.maps.GeocoderStatus.ZERO_RESULTS)) {
      reject('Няма резултати!');
      return;
    }

    resolve(result.formatted_address);
  });
});

const destroyMarker = (marker: google.maps.Marker) => {
  if (marker) {
    marker.setMap(null);
  }
};

const createRequest = async () => {
  try {
    data.loading = true;

    if (!data.requestMarker) throw 'Моля, маркирайте мястото върху картата!';

    const { currentUser, map } = store.getState();
    const newRequest: Partial<Request> = {
      ...data.request,
      geo: data.requestMarker.getPosition().toJSON(),
      created: firebase.database.ServerValue.TIMESTAMP,
      createdBy: currentUser.auth.uid,
      status: 'new'
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
