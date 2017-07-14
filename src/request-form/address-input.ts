import { input, a, small } from 'compote/html';
import { set } from 'compote/components/utils';
import { redraw, withAttr, FactoryComponent } from 'mithril';

import { mapLoaded } from '../map';
import { Request } from '../request';
import { store } from '../store';

import { State } from './index';

export const AddressInput: FactoryComponent<{ state: State }> = ({ attrs: { state } }) => {
  const mapEventListeners: google.maps.MapsEventListener[] = [];
  const setTitle = withAttr('value', set<Request>('title')(state.request));

  return {
    onremove() {
      mapEventListeners.map((listener) => listener.remove());
      destroyMarker(state.requestMarker);
    },

    view: () => [
      input({
        class: 'form-input',
        type: 'text', name: 'title', placeholder: 'Къде искате да озелените?', autofocus: true, required: true,
        value: state.request.title, oninput: setTitle,
        oncreate: createSearchBox
      }),
      state.addressSuggestion ?
        a({ onclick: setAddress }, small(`Може би имахте предвид ${state.addressSuggestion}?`))
        :
        null
    ]
  };

  async function createSearchBox({ dom }: { dom: HTMLElement }) {
    await mapLoaded;

    const { map } = store.getState();
    const searchBox = new google.maps.places.SearchBox(<HTMLInputElement>dom);

    mapEventListeners.push(
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
      state.request.title = (<HTMLInputElement>dom).value;
      createRequestMarker(map, location, place.formatted_address);
    });

    mapEventListeners.push(
      map.addListener('click', (e: google.maps.MouseEvent) => createRequestMarker(map, e.latLng))
    );
  }

  async function createRequestMarker(map: google.maps.Map, position: google.maps.LatLng, address?: string) {
    destroyMarker(state.requestMarker);
    state.requestMarker = new google.maps.Marker({ map, position, icon: 'map_marker_new.svg' });

    if (!address) {
      try {
        address = await getAddressByLocation(position);
      }
      catch (error) {
        return;
      }
    }

    if (address !== state.request.title) {
      state.addressSuggestion = address;
      redraw();
    }
  }

  function setAddress() {
    state.request.title = state.addressSuggestion;
    state.addressSuggestion = null;
  }
};

const destroyMarker = (marker: google.maps.Marker) => {
  if (marker) {
    marker.setMap(null);
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
