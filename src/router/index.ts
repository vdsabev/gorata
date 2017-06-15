import { route } from 'mithril';
import { voidify } from 'compote/components/utils';

import { Unauthorized } from '../401-unauthorized';
import { Login } from '../login';
import { RequestForm } from '../request-form';
import { RequestList } from '../request-list';
import { store } from '../store';
import { isLoggedIn } from '../user';

const requireAccess = (accessFn: Function, success: Function, error: Function, ...args: any[]) => () => {
  const { currentUser } = store.getState();
  return accessFn(currentUser) ? success(...args) : error(...args);
};

export function initializeRouter() {
  route.prefix('');

  const container = document.querySelector('#container');
  route(container, '/', {
    '/': { render: RequestListPage },
    '/login': { render: LoginPage },
    '/requests/new': { render: RequestCreatePage }
  });
}

export const RequestListPage = () => {
  const { requests } = store.getState();
  return RequestList(requests);
};

export const LoginPage = () => {
  const { currentUser } = store.getState();
  if (isLoggedIn(currentUser)) {
    route.set('/');
    return null;
  }

  return Login();
};

export const RequestCreatePage = requireAccess(isLoggedIn, RequestForm, Unauthorized);
