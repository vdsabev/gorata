import { logger } from 'compote/components/logger';
import { createStore, combineReducers, applyMiddleware } from 'redux';

import { User } from './user';

type State = {
  /** Current user */
  currentUser: User
};

export enum Actions {
  USER_DETAILS_LOADED = <any>'USER_DETAILS_LOADED',
  USER_LOGGED_IN = <any>'USER_LOGGED_IN',
  USER_LOGGED_OUT = <any>'USER_LOGGED_OUT'
}

export const store = createStore(
  combineReducers<State>({ currentUser }),
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
