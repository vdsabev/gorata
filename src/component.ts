import { Vnode, Lifecycle, Children, redraw } from 'mithril';
import { createStore } from 'redux';

interface ComponentOptions<Actions> {
  reducers?: Record<string, (state: any, action: any, actions: Actions) => any>;
  actions?: Actions;
  events?: Lifecycle<any, null>;
  view: (state: any, actions: Actions, vnode: Vnode<any, null>) => Children;
}

export const component = <Actions extends {}>(options: ComponentOptions<Actions>) => (vnode: Vnode<any, null>) => {
  const actions = <Actions>{};
  const createActionProxy = (key: string) => {
    (<any>actions)[key] = (...args: any[]) => store.dispatch((<any>options.actions)[key](...args));
  };
  Object.keys(options.actions).map(createActionProxy);

  const reducerProxy = (state = {}, action: any) => {
    const newState = {};
    Object.keys(options.reducers).map((key) => {
      (<any>newState)[key] = options.reducers[key]((<any>state)[key], action, actions);
    });

    return newState;
  };
  const store = createStore(reducerProxy, vnode.attrs);
  store.subscribe(redraw);

  return {
    ...options.events,
    view: () => options.view(store.getState(), actions, vnode)
  };
};
