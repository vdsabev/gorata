import '../assets/map_marker_new.svg';
import './style.scss';

import { div, form, fieldset, img, h1, input, a, small, br, textarea, button } from 'compote/html';
import { AspectRatioContainer } from 'compote/components/aspect-ratio-container';
import { flex } from 'compote/components/flex';
import { constant } from 'compote/components/utils';
import * as firebase from 'firebase/app';
import { redraw, route, withAttr, Children } from 'mithril';

import { mapLoaded } from '../map';
import { Request } from '../request';
import { store } from '../store';
import { guid, toArray } from '../utils';

let data: Data;
interface Data {
  request?: Partial<Request>;
  mapEventListeners?: google.maps.MapsEventListener[];
  requestMarker?: google.maps.Marker;
  addressSuggestion?: string;
  uploading?: boolean;
  loading?: boolean;
}

// TODO: Use form data
// TODO: Add validation
export const RequestFormView = {
  oninit() {
    data = { request: { imageUrls: [] }, mapEventListeners: [] };
  },
  onremove() {
    if (data.mapEventListeners) {
      data.mapEventListeners.map((listener) => listener.remove());
    }

    destroyMarker(data.requestMarker);
  },
  view: () => (
    div({ class: 'flex-row justify-content-stretch align-items-stretch container fade-in-animation' }, [
      form({ class: 'form', style: flex(1), onsubmit: returnFalse },
        fieldset({ class: 'form-panel lg', disabled: data.loading }, [
          Images(),
          AddressInput(),
          br(), br(),
          TextInput(),
          br(), br(),
          SubmitButton()
        ])
      )
    ])
  )
};

const returnFalse = constant(false);

const setRequestData = (propertyName: keyof typeof data.request) => (value: any) => data.request[propertyName] = value;

const Images = () => (
  div({ class: 'request-form-images-container' }, [
    data.request.imageUrls.map(UploadedImage),
    UploadNewImage()
  ])
);

const ImageContainer = (content: Children) => (
  AspectRatioContainer({
    class: 'request-form-image-container mb-md br-md bg-neutral-light fade-animation',
    aspectRatio: { x: 4, y: 3 }
  }, content)
);

const UploadedImage = (imageUrl: string) => (
  ImageContainer([
    img({ class: 'absolute stretch', src: imageUrl }),
    div({ class: 'request-form-remove br-50p pointer', onclick: removeImage(imageUrl) }, '✖')
  ])
);

const removeImage = (imageUrl: string) => async (e: MouseEvent) => {
  const indexOfImageUrl = data.request.imageUrls.indexOf(imageUrl);
  if (indexOfImageUrl === -1) return;

  data.request.imageUrls.splice(indexOfImageUrl, 1);

  try {
    await firebase.storage().refFromURL(imageUrl).delete();
  }
  catch (error) {
    data.request.imageUrls.splice(indexOfImageUrl, 0, imageUrl);
    redraw();
    window.alert(error.message);
  }
};

const UploadNewImage = () => (
  ImageContainer([
    div({ class: 'absolute stretch flex-row justify-content-center align-items-center fade-in-animation' }, [
      data.uploading ?
        div({ class: 'request-form-uploading br-50p spin-right-animation' })
        :
        h1({ class: 'request-form-upload-text color-neutral-lighter' }, '+')
    ]),
    input({
      class: 'request-form-upload-input absolute stretch pointer',
      type: 'file', name: 'imageUrls[]', accept: 'image/*', onchange: uploadImages,
      multiple: true,
      title: 'Качете снимка'
    })
  ])
);

const uploadImages = async (e: Event) => {
  const files = toArray<File>((<HTMLInputElement>e.currentTarget).files);
  if (!files.length) return;

  data.uploading = true;

  try {
    await Promise.all(files.map(uploadImage));
    data.uploading = false;
    redraw();
  }
  catch (error) {
    data.uploading = false;
    redraw();
    window.alert(error.message);
  }
};

const uploadImage = (file: File) => new Promise(async (resolve, reject) => {
  try {
    const uploadTaskSnapshot = await firebase.storage().ref().child(`tmp/${guid()}`).put(file);

    // Only redraw after the image is loaded
    const image = document.createElement('img');
    image.src = uploadTaskSnapshot.downloadURL;
    image.onload = () => {
      data.request.imageUrls.push(uploadTaskSnapshot.downloadURL);
      redraw();
      resolve();
    };
  }
  catch (error) {
    reject(error);
  }
});

// Address
const AddressInput = () => [
  input({
    class: 'form-input',
    type: 'text', name: 'title', placeholder: 'Къде искате да озелените?', autofocus: true, required: true,
    value: data.request.title, oninput: setTitle,
    oncreate: createSearchBox
  }),
  data.addressSuggestion ? a({ onclick: setAddress }, small(`Може би имахте предвид ${data.addressSuggestion}?`)) : null
];

const setTitle = withAttr('value', setRequestData('title'));

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
  data.requestMarker = new google.maps.Marker({ map, position, icon: 'map_marker_new.svg' });

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

const setAddress = () => {
  data.request.title = data.addressSuggestion;
  data.addressSuggestion = null;
};

// Text
const TextInput = () => (
  textarea({
    class: 'form-input',
    name: 'text', placeholder: 'От какво имате нужда?', rows: 15,
    value: data.request.text, oninput: setText
  })
);

const setText = withAttr('value', setRequestData('text'));

// Submit
const SubmitButton = () => button({ class: 'form-button', type: 'submit', onclick: createRequest }, 'Създаване');

const createRequest = async () => {
  try {
    data.loading = true;

    if (!data.requestMarker) throw 'Моля, маркирайте мястото върху картата!';
    if (data.request.imageUrls.length === 0) throw 'Моля, качете поне една снимка!';

    const { currentUser } = store.getState();
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
    data.loading = false;
    redraw();
    window.alert(error.message);
  }
};
