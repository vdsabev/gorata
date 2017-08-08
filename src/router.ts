import * as m from 'mithril';

import { Unauthorized } from './401-unauthorized';
import { NotFound } from './404-not-found';
import { LoginForm } from './login';
import { getRequest } from './request';
import { RequestDetails } from './request-details';
import { RequestForm } from './request-form';
import { RequestList } from './request-list';

import { store } from './store';
import { isLoggedIn } from './user';

type RouteParams = Record<string, string>;

export function initializeRouter() {
  m.route.prefix('');

  const content = document.querySelector('#content');
  m.route(content, '/', {
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
    '/:url': NotFound
  });
}

const load = <T>(view: m.FactoryComponent<any> | m.Component<any, any>, key = 'result') => (result: T) => (
  result ?
    { view: render(RequestDetails, { [key]: result }) }
    :
    NotFound
);

const notify = {
  error(error: Error): null {
    window.alert(error.message);
    return null;
  }
};

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

const render = (view: m.FactoryComponent<any> | m.Component<any, any>, ...args: any[]) => () => m(view, ...args);
