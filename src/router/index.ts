import * as m from 'mithril';

import { NotFound } from '../404-not-found';
import { Login } from '../login';
import { Register } from '../register';
import { RequestDetails } from '../request-details';
import { RequestForm } from '../request-form';
import { RequestList } from '../request-list';
import { Settings } from '../settings';

import { pipeline, loadWith, ifLoggedInRedirectTo, authorize, getRequest } from './pipelines';

export type RouteParams = Record<string, string>;

export type Component<A = any, S = any> = m.FactoryComponent<A> | m.Component<A, S>;

export function initializeRouter() {
  m.route.prefix('');

  const content = document.querySelector('#content');
  const loading = loadWith(content);

  m.route(content, '/', {
    '/': RequestList,
    '/register': {
      onmatch: pipeline([loading, ifLoggedInRedirectTo('/')], load(Register))
    },
    '/login': {
      onmatch: pipeline([loading, ifLoggedInRedirectTo('/')], load(Login))
    },
    '/requests/new': {
      onmatch: pipeline([loading, authorize], load(RequestForm))
    },
    '/requests/:requestId': {
      onmatch: pipeline([loading, getRequest], load(RequestDetails, 'request'))
    },
    '/settings': {
      onmatch: pipeline([loading, authorize], load(Settings))
    },
    '/:url': NotFound
  });
}

export const reloadRoute = () => {
  m.route.set(window.location.href, undefined, { replace: true });
};

const load = <T>(component: Component, key?: keyof T) => (result?: T) => ({
  view: render(component, key != null && result != null ? { [key]: result[key] } : null)
});

const render = (component: Component, ...args: any[]) => () => m(component, ...args);
