import * as m from 'mithril';

import { Unauthorized } from './401-unauthorized';
import { NotFound } from './404-not-found';
import { LoginForm } from './login';
import { getRequest } from './request';
import { RequestDetails } from './request-details';
import { RequestForm } from './request-form';
import { RequestList } from './request-list';
import { SettingsForm } from './settings';

import * as notify from './notify';
import { store } from './store';
import { isLoggedIn } from './user';

type RouteParams = Record<string, string>;

export function initializeRouter() {
  m.route.prefix('');

  const content = document.querySelector('#content');
  m.route(content, '/', {
    '/index.html': redirect('/'), // Handles 404 when opening app installed from service worker
    '/': RequestList,
    '/login': {
      render: requireAccess(isLoggedIn, redirect('/'), render(LoginForm))
    },
    '/requests/new': {
      render: requireAccess(isLoggedIn, render(RequestForm), render(Unauthorized))
    },
    '/requests/:requestId': {
      onmatch: ({ requestId }: RouteParams) => getRequest(requestId).then(load(RequestDetails, 'request')).catch(notify.error)
    },
    '/settings': {
      render: requireAccess(isLoggedIn, render(SettingsForm), redirect('/'))
    },
    '/:url': NotFound
  });
}

const load = <T>(component: m.FactoryComponent<any> | m.Component<any, any>, key = 'result') => (result: T) => (
  result ?
    { view: render(component, { [key]: result }) }
    :
    NotFound
);

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

const render = (component: m.FactoryComponent<any> | m.Component<any, any>, ...args: any[]) => () => m(component, ...args);
