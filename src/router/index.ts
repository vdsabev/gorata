import { route } from 'mithril';
import { voidify } from 'compote/components/utils';

import { Forbidden } from '../403-forbidden';
import { Login } from '../login';
import { store } from '../store';
import { canModerate } from '../user';

export function setRouteIfNew(newRoute: string) {
  if (newRoute !== route.get()) {
    route.set(newRoute);
  }
}

export const requireModeratorAccess = (component: Function, ...args: any[]) => () => {
  const { currentUser } = store.getState();
  return canModerate(currentUser) ? component(...args) : Forbidden();
};

export function initializeRouter() {
  route.prefix('');

  const container = document.querySelector('#container');
  route(container, '/', {
    '/': { onmatch: toggleContainer(false), render: () => [] },
    '/login': { onmatch: toggleContainer(true), render: Login }
  });
}

const toggleContainer = (visible: boolean) => () => {
  document.querySelector('#container').classList.toggle('hidden', !visible);
};
