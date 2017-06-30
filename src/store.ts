import './assets/map_marker.svg';

import * as firebase from 'firebase/app';

import { logger } from 'compote/components/logger';
import { createStore, combineReducers, applyMiddleware } from 'redux';

import { DataSnapshot } from './firebase';
import { Request } from './request';
import { User } from './user';

interface State {
  currentUser: User;
  map: google.maps.Map;
  markers: Record<string, google.maps.Marker>;
  requestPopup: RequestPopupState;
  requests: Request[];
}

export enum Actions {
  USER_DETAILS_LOADED = 'USER_DETAILS_LOADED',
  USER_LOGGED_IN = 'USER_LOGGED_IN',
  USER_LOGGED_OUT = 'USER_LOGGED_OUT',

  MAP_LOADED = 'MAP_LOADED',

  REQUEST_ADDED = 'REQUEST_ADDED',
  REQUEST_REMOVED = 'REQUEST_REMOVED',
  REQUEST_MARKER_CLICKED = 'REQUEST_MARKER_CLICKED',

  GET_REQUESTS = 'GET_REQUESTS'
}

export const store = createStore(
  combineReducers<State>({ currentUser, map, markers, requestPopup, requests }),
  process.env.NODE_ENV === 'production' ? undefined : applyMiddleware(logger)
);

// Current User
type CurrentUserAction = Action<Actions> & { auth?: firebase.User, user?: User };

export function currentUser(state: Partial<User> = null, action: CurrentUserAction = {}): Partial<User> {
  switch (action.type) {
  case Actions.USER_DETAILS_LOADED:
    return { ...state, ...action.user };
  case Actions.USER_LOGGED_IN:
    return { auth: action.auth };
  case Actions.USER_LOGGED_OUT:
    return {};
  default:
    return state;
  }
}

// Map
type MapAction = Action<Actions> & { element?: Element };

export function map(state: google.maps.Map = null, action: MapAction = {}): google.maps.Map {
  switch (action.type) {
  case Actions.MAP_LOADED:
    const bounds = new google.maps.LatLngBounds();
    bounds.extend({ lat: 43.541944, lng: 28.609722 }); // East
    bounds.extend({ lat: 43.80948, lng: 22.357125 }); // West
    bounds.extend({ lat: 44.2125, lng: 22.665833 }); // North
    bounds.extend({ lat: 41.234722, lng: 25.288333 }); // South

    const map = new google.maps.Map(action.element, { center: bounds.getCenter() });
    map.fitBounds(bounds);

    return map;
  default:
    return state;
  }
}

// Markers
type MarkerAction = RequestsAction & { map?: google.maps.Map };

export function markers(state: Record<string, google.maps.Marker> = {}, action: MarkerAction = {}): Record<string, google.maps.Marker> {
  switch (action.type) {
  case Actions.MAP_LOADED:
    Object.keys(state).map((requestId) => state[requestId].setMap(null));
    return {};
  case Actions.REQUEST_ADDED:
    if (state[action.request.id]) {
      state[action.request.id].setMap(null);
    }

    const marker = new google.maps.Marker({
      map: action.map,
      position: action.request.geo,
      title: action.request.title,
      icon: 'map_marker.svg'
    });
    marker.addListener('click', () => store.dispatch({ type: Actions.REQUEST_MARKER_CLICKED, marker, request: action.request }));

    return { ...state, [action.request.id]: marker };
  case Actions.REQUEST_REMOVED:
    const result: Record<string, google.maps.Marker> = {};
    Object.keys(state)
      .filter((requestId) => {
        if (requestId === action.request.id) {
          state[requestId].setMap(null);
          return false;
        }
        return true;
      })
      .map((requestId) => {
        result[requestId] = state[requestId];
      });
    return result;
  default:
    return state;
  }
}

// Request Popup
type RequestPopupAction = RequestsAction & { marker?: google.maps.Marker };

interface RequestPopupState {
  request?: Request;
  popup?: google.maps.InfoWindow;
  removeMapClickListener?: google.maps.MapsEventListener;
}

export function requestPopup(state: RequestPopupState = {}, action: RequestPopupAction = {}): RequestPopupState {
  switch (action.type) {
  case Actions.REQUEST_MARKER_CLICKED:
    closePopup(state.popup, state.removeMapClickListener);

    const popup = new google.maps.InfoWindow({
      content: `
        ${action.request.imageUrls ? action.request.imageUrls.map((imageUrl) => `
          <img class="width-xl mr-sm" src="${imageUrl}" />
        `).join('') : ''}
        <h4>${action.request.title}</h4>${action.request.text}
      `
    });

    const map = <google.maps.Map>action.marker.getMap();
    const removeMapClickListener = map.addListener('click', (e: google.maps.MouseEvent) => closePopup(popup, removeMapClickListener));
    popup.addListener('closeclick', () => removeMapClickListener.remove());
    popup.open(map, action.marker);

    return { request: action.request, popup, removeMapClickListener };
  case Actions.MAP_LOADED:
    closePopup(state.popup, state.removeMapClickListener);
    return {};
  case Actions.REQUEST_REMOVED:
    if (state.request && state.request.id === action.request.id) {
      closePopup(state.popup, state.removeMapClickListener);
      return {};
    }
    /* falls through */
  default:
    return state;
  }
}

const closePopup = (popup: google.maps.InfoWindow, removeMapClickListener: google.maps.MapsEventListener) => {
  if (popup) {
    popup.close();
  }

  if (removeMapClickListener) {
    removeMapClickListener.remove();
  }
};

// Requests
type RequestsAction = Action<Actions> & { request?: Request, filter?: RequestsFilter };

export function requests(state: Request[] = [], action: RequestsAction = {}): Request[] {
  switch (action.type) {
  case Actions.GET_REQUESTS:
    setTimeout(() => {
      removeAllRequests(state);
      getRequests(action.filter);
    }, 0);
    return state;
  case Actions.REQUEST_ADDED:
    return [action.request, ...state];
  case Actions.REQUEST_REMOVED:
    return state.filter((request) => request.id !== action.request.id);
  default:
    return state;
  }
}

const removeAllRequests = (requests: Request[]) => {
  requests.map((request) => store.dispatch({ type: Actions.REQUEST_REMOVED, request }));
};

const getRequests = (filter: RequestsFilter) => {
  const requestsRef = filter && filter.value != null ?
    firebase.database().ref('requests').orderByChild(filter.key).equalTo(filter.value)
    :
    firebase.database().ref('requests')
  ;

  requestsRef.off('child_added', addRequest);
  requestsRef.on('child_added', addRequest);

  requestsRef.off('child_removed', removeRequest);
  requestsRef.on('child_removed', removeRequest);
};

const addRequest = (requestChildSnapshot: DataSnapshot<Request>) => {
  const { map } = store.getState(); // TODO: Handle case where `map` is null
  const request: Request = { id: requestChildSnapshot.key, ...requestChildSnapshot.val() };
  store.dispatch({ type: Actions.REQUEST_ADDED, request, map });
};

const removeRequest = (requestChildSnapshot: DataSnapshot<Request>) => {
  const request: Partial<Request> = { id: requestChildSnapshot.key };
  store.dispatch({ type: Actions.REQUEST_REMOVED, request });
};

// Requests Filter
type RequestsFilterAction = Action<Actions> & { filter?: RequestsFilter };

export type RequestsFilter = { key: string, value: any };
