import { Loading } from 'compote/components/loading';
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

export const route = m.route;

export const Routes = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',

  REQUEST_LIST: '/requests',
  REQUEST_CREATE: '/requests/new',
  REQUEST_DETAILS: (requestId: string) => `/requests/${requestId}`,

  SETTINGS: '/settings',
  OTHER: (url: string) => `/${url}`
};

export function initializeRouter() {
  route.prefix('');

  const content = document.querySelector('#content');
  const loading = loadWith(content);

  route(content, Routes.HOME, {
    // Home
    [Routes.HOME]: redirectTo(Routes.REQUEST_LIST),
    [Routes.LOGIN]: {
      onmatch: pipeline([loading, ifLoggedInRedirectTo(Routes.HOME)], load(Login))
    },
    [Routes.REGISTER]: {
      onmatch: pipeline([loading, ifLoggedInRedirectTo(Routes.HOME)], load(Register))
    },

    // Requests
    [Routes.REQUEST_LIST]: RequestList,
    [Routes.REQUEST_CREATE]: {
      onmatch: pipeline([loading, authorize], load(RequestForm))
    },
    [Routes.REQUEST_DETAILS(':requestId')]: {
      onmatch: pipeline([loading, getRequest], load(RequestDetails, 'request'))
    },

    // User
    [Routes.SETTINGS]: {
      onmatch: pipeline([loading, authorize], load(Settings))
    },

    // Misc
    [Routes.OTHER(':url')]: NotFound
  });
}

export const reloadRoute = () => {
  route.set(window.location.href, undefined, { replace: true });
};

const redirectTo = (url: string) => () => {
  route.set(url, undefined, { replace: true });
  return Loading;
};

const load = <T>(component: Component, key?: keyof T) => (result?: T) => ({
  view: () => m(component, key != null && result != null ? { [key]: result[key] } : null)
});
