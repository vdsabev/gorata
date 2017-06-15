import { redraw, route } from 'mithril';

import { Unauthorized } from './401-unauthorized';
import { NotFound } from './404-not-found';
import { LoginForm } from './login';
import { RequestForm } from './request-form';
import { RequestList } from './request-list';

import { store } from './store';
import { isLoggedIn } from './user';

let key = Date.now();
const setKey = () => {
  key = Date.now();
  redraw();
};

export function initializeRouter() {
  route.prefix('');

  const content = document.querySelector('#content');
  route(content, '/', {
    '/': { onmatch: setKey, render: RequestListPage },
    '/login': { onmatch: setKey, render: LoginPage },
    '/requests/new': { onmatch: setKey, render: RequestCreatePage },
    '/:url': { onmatch: setKey, render: NotFound }
  });
}

const requireAccess = (accessFn: Function, success: Function, error: Function, ...args: any[]) => () => {
  const { currentUser } = store.getState();
  return accessFn(currentUser) ? success(...args) : error(...args);
};

export const RequestListPage = () => {
  const { requests } = store.getState();
  return RequestList({ key }, requests);
};

export const LoginPage = () => {
  const { currentUser } = store.getState();
  if (isLoggedIn(currentUser)) {
    route.set('/');
    return null;
  }

  return LoginForm({ key });
};

export const RequestCreatePage = requireAccess(isLoggedIn, () => RequestForm({ key }), () => Unauthorized({ key }));
