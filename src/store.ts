import { logger } from 'compote/components/logger';
import { createStore, combineReducers, applyMiddleware } from 'redux';

import { Request } from './request';
import { User } from './user';

interface State {
  /** Current user */
  currentUser: User;
  markers: Record<string, google.maps.Marker>;
  requests: Request[];
}

export enum Actions {
  USER_DETAILS_LOADED = <any>'USER_DETAILS_LOADED',
  USER_LOGGED_IN = <any>'USER_LOGGED_IN',
  USER_LOGGED_OUT = <any>'USER_LOGGED_OUT',

  RESET_REQUESTS = <any>'RESET_REQUESTS',
  REQUEST_ADDED = <any>'REQUEST_ADDED',
  REQUEST_REMOVED = <any>'REQUEST_REMOVED'
}

export const store = createStore(
  combineReducers<State>({ currentUser, markers, requests }),
  process.env.NODE_ENV === 'production' ? undefined : applyMiddleware(logger)
);

export function currentUser(state: User = {}, action: Action<Actions> = {}): User {
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

export function markers(state: Record<string, google.maps.Marker> = {}, action: Action<Actions> = {}): Record<string, google.maps.Marker> {
  switch (action.type) {
  case Actions.RESET_REQUESTS:
    Object.keys(state).map((requestId) => state[requestId].setMap(null));
    return {};
  case Actions.REQUEST_ADDED:
    if (state[action.request.id]) {
      state[action.request.id].setMap(null);
    }

    return {
      ...state,
      [action.request.id]: new google.maps.Marker({
        map: action.map,
        position: action.request.geo,
        title: action.request.title
      })
    };
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

export function requests(state: Request[] = [], action: Action<Actions> = {}): Request[] {
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
