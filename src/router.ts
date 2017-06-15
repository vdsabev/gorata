import { redraw, route, Vnode } from 'mithril';

import { Unauthorized } from './401-unauthorized';
import { NotFound } from './404-not-found';
import { LoginForm } from './login';
import { RequestForm } from './request-form';
import { RequestList } from './request-list';

import { store } from './store';
import { isLoggedIn } from './user';

// HACK: We need a more solid solution for re-initializing components on route change
let key = Date.now();
const updateKey = () => {
  key = Date.now();
  redraw();
};

export function initializeRouter() {
  route.prefix('');

  const content = document.querySelector('#content');
  route(content, '/', {
    '/': render(RequestListPage),
    '/login': render(LoginPage),
    '/requests/new': render(RequestCreatePage),
    '/:url': render(NotFound)
  });
}

const render = (component: () => Vnode<any, any>) => ({ onmatch: updateKey, render: component });

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
