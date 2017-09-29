import { Loading } from 'compote/components/loading';
import * as m from 'mithril';

import { Unauthorized } from '../401-unauthorized';
import { NotFound } from '../404-not-found';

import { initialUserAuth } from '../auth';
import { Request, RequestServices } from '../request';
import { route } from '../router';
import { store } from '../store';
import { isLoggedIn } from '../user';

import { RouteParams, Component } from './index';

interface PipelineStep {
  getState: (state?: PipelineState, params?: RouteParams) => Promise<PipelineState | void>;
  onError?: PipelineStepHandler;
}

interface PipelineStepHandler {
  (state?: PipelineState, params?: RouteParams): Component;
}

type PipelineState = Record<string, any>;

export const loadWith = (el: Element): PipelineStep => ({
  async getState(): Promise<void> {
    m.render(el, m(Loading));
  }
});

export const ifLoggedInRedirectTo = (url: string): PipelineStep => ({
  async getState(): Promise<void> {
    await initialUserAuth;
    const { currentUser } = store.getState();
    if (isLoggedIn(currentUser)) route.set(url);
  }
});

export const authorize: PipelineStep = {
  async getState(): Promise<{ userId: string }> {
    await initialUserAuth;
    const { currentUser } = store.getState();
    if (!isLoggedIn(currentUser)) throw new Error('Unauthorized');
    return { userId: currentUser.auth.uid };
  },
  onError: () => Unauthorized
};

export const getRequest: PipelineStep = {
  async getState(state, { requestId }): Promise<{ request: Request }> {
    const request = await RequestServices.get({ requestId });
    return { request };
  },
  onError: () => NotFound // TODO: Handle other errors
};

export const pipeline = (steps: PipelineStep[], componentFn: PipelineStepHandler) => {
  if (steps.length === 0) throw new Error(`Pipeline must contain at least 1 element! ${JSON.stringify(steps, null, 2)}`);

  return async (params: RouteParams): Promise<Component> => {
    let state: PipelineState = {};
    for (const step of steps) {
      try {
        const newState = await step.getState(state, params);
        if (newState) {
          state = { ...state, ...newState };
        }
      }
      catch (error) {
        return step.onError(state, params);
      }
    }

    return componentFn(state, params);
  };
};
