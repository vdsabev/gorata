import * as m from 'mithril';

import { UnauthorizedView } from './401-unauthorized';
import { NotFoundView } from './404-not-found';
import { LoginView } from './login';
import { RequestFormView } from './request-form';
import { RequestListView } from './request-list';

import { store } from './store';
import { isLoggedIn } from './user';

export function initializeRouter() {
  m.route.prefix('');

  const content = document.querySelector('#content');
  m.route(content, '/', {
    '/': RequestListView,
    '/login': { render: requireAccess(isLoggedIn, redirect('/'), render(LoginView)) },
    '/requests/new': { render: requireAccess(isLoggedIn, render(RequestFormView), render(UnauthorizedView)) },
    '/:url': NotFoundView
  });
}

const requireAccess = (accessFn: Function, whenTruthy: Function, whenFalsy: Function) => () => {
  const { currentUser } = store.getState();

  // Don't show the logged out state until the user is known to be either logged in or logged out
  if (!currentUser) return null;

  return accessFn(currentUser) ? whenTruthy() : whenFalsy();
};

const redirect = (url: string) => (): null => {
  m.route.set(url);
  return null;
};

const render = (view: m.Component<any, any>) => () => m(view);
