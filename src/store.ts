import * as firebase from 'firebase/app';

import { logger } from 'compote/components/logger';
import { createStore, combineReducers, applyMiddleware } from 'redux';

import { Request } from './request';
import { User } from './user';

interface State {
  /** Current user */
  currentUser: User;
  markers: Record<string, google.maps.Marker>;
  requestPopup: RequestPopupState;
  requests: Request[];
}

export enum Actions {
  USER_DETAILS_LOADED = <any>'USER_DETAILS_LOADED',
  USER_LOGGED_IN = <any>'USER_LOGGED_IN',
  USER_LOGGED_OUT = <any>'USER_LOGGED_OUT',

  RESET_REQUESTS = <any>'RESET_REQUESTS',
  REQUEST_ADDED = <any>'REQUEST_ADDED',
  REQUEST_REMOVED = <any>'REQUEST_REMOVED',
  REQUEST_MARKER_CLICKED = <any>'REQUEST_MARKER_CLICKED'
}


export const store = createStore(
  combineReducers<State>({ currentUser, markers, requestPopup, requests }),
  process.env.NODE_ENV === 'production' ? undefined : applyMiddleware(logger)
);

// Current User
type CurrentUserAction = Action<Actions> & { auth?: firebase.User, user?: User };

export function currentUser(state: User = {}, action: CurrentUserAction = {}): User {
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

// Markers
type MarkerAction = RequestAction & { map?: google.maps.Map };

export function markers(state: Record<string, google.maps.Marker> = {}, action: MarkerAction = {}): Record<string, google.maps.Marker> {
  switch (action.type) {
  case Actions.RESET_REQUESTS:
    Object.keys(state).map((requestId) => state[requestId].setMap(null));
    return {};
  case Actions.REQUEST_ADDED:
    if (state[action.request.id]) {
      state[action.request.id].setMap(null);
    }

    const marker = new google.maps.Marker({
      map: action.map,
      position: action.request.geo,
      title: action.request.title
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

// RequestPopup
type RequestPopupAction = RequestAction & { marker?: google.maps.Marker };

interface RequestPopupState {
  request?: Request;
  popup?: google.maps.InfoWindow;
}

export function requestPopup(state: RequestPopupState = {}, action: RequestPopupAction = {}): RequestPopupState {
  switch (action.type) {
  case Actions.REQUEST_MARKER_CLICKED:
    safelyClosePopup(state.popup);

    const popup = new google.maps.InfoWindow({ content: `<h4>${action.request.title}</h4>${action.request.text}` });
    popup.open(action.marker.getMap(), action.marker);

    return { request: action.request, popup };
  case Actions.RESET_REQUESTS:
    safelyClosePopup(state.popup);
    return {};
  case Actions.REQUEST_REMOVED:
    if (state.request && state.request.id === action.request.id) {
      safelyClosePopup(state.popup);
    }
    return {};
  default:
    return state;
  }
}

const safelyClosePopup = (popup: google.maps.InfoWindow) => {
  if (popup) {
    popup.close();
  }
};

// Requests
type RequestAction = Action<Actions> & { request?: Request };

export function requests(state: Request[] = [], action: RequestAction = {}): Request[] {
  switch (action.type) {
  case Actions.RESET_REQUESTS:
    return [];
  case Actions.REQUEST_ADDED:
    return [action.request, ...state];
  case Actions.REQUEST_REMOVED:
    return state.filter((request) => request.id !== action.request.id);
  default:
    return state;
  }
}
