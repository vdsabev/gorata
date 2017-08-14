import { Vnode, Lifecycle, Children, redraw } from 'mithril';
import { createStore } from 'redux';

interface ComponentOptions<Actions> {
  reducers?: Record<string, (value: any, action: any, state: any, actions: Actions) => any>;
  actions?: Actions;
  events?: Lifecycle<any, null>;
  view: (vnode: Vnode<any, null>, state: any, actions: Actions) => Children;
}

export const component = <Actions extends {}>({ actions, reducers, events, view }: ComponentOptions<Actions>) => (vnode: Vnode<any, null>) => {
  const actionProxies = <Actions>{};
  Object.keys(actions).map((key) => {
    (<any>actionProxies)[key] = (...args: any[]) => {
      const actionResult = (<any>actions)[key](...args);
      if (actionResult) {
        if (typeof actionResult === 'function') {
          actionResult(store.getState(), actionProxies);
        }
        else {
          store.dispatch(actionResult);
        }
      }
    };
  });

  const reducerProxy = (state = {}, action: any) => {
    const newState = {};
    Object.keys(reducers).map((key) => {
      (<any>newState)[key] = reducers[key]((<any>state)[key], action, state, actionProxies);
    });

    return newState;
  };
  const store = createStore(reducerProxy, vnode.attrs);
  store.subscribe(redraw);

  return {
    ...events,
    view: () => view(vnode, store.getState(), actionProxies)
  };
};
