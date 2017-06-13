import { route } from 'mithril';
import { voidify } from 'compote/components/utils';

import { Forbidden } from '../403-forbidden';
import { Login } from '../login';
import { RequestForm } from '../request-form';
import { store } from '../store';
import { isLoggedIn } from '../user';

const toggleContainer = (visible: boolean) => () => {
  document.querySelector('#container').classList.toggle('hidden', !visible);
};

const requireAccess = (accessFn: Function, component: Function, ...args: any[]) => () => {
  const { currentUser } = store.getState();
  return accessFn(currentUser) ? component(...args) : Forbidden();
};

export function initializeRouter() {
  route.prefix('');

  const container = document.querySelector('#container');
  route(container, '/', {
    '/': { onmatch: toggleContainer(false), render: () => [] },
    '/login': { onmatch: toggleContainer(true), render: Login },
    '/requests/new': { onmatch: toggleContainer(true), render: RequestCreatePage }
  });
}

export const RequestCreatePage = requireAccess(isLoggedIn, RequestForm);
