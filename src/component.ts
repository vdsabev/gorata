import { Lifecycle, Vnode, Children } from 'mithril';

import { store, ComponentActions } from './store';
import { uniqueId } from './utils';

interface ComponentOptions<Attrs, State, Actions> {
  reducers?: Record<string, (...args: any[]) => any>;
  actions?: Actions;
  events?: Lifecycle<Attrs, State>;
  view?(vnode: Vnode<Attrs, State>, state: State, actions: Actions): Children;
}

export const component = <Actions>(options: ComponentOptions<any, any, Actions> = {}) => {
  const reducer = <T>(state = <T>{}, action: any = {}): T => {
    const newState = <T>{};
    Object.keys(options.reducers).map((key) => {
      (<any>newState)[key] = (<any>options.reducers)[key]((<any>state)[key], action);
    });

    return newState;
  };

  return (vnode: Vnode<any, any>) => {
    const componentId = uniqueId('component-');
    store.dispatch({ type: ComponentActions.ADD, componentId, reducer, attrs: vnode.attrs });

    const actions = <Actions>{};
    Object.keys(options.actions).map((key) => {
      (<any>actions)[key] = (...args: any[]) => {
        const action = (<any>options.actions)[key](...args);
        store.dispatch({ ...action, componentId });
      };
    });

    return {
      ...options.events,
      onremove() {
        if (options.events && options.events.onremove) {
          options.events.onremove.call(this, vnode);
        }
        store.dispatch({ type: ComponentActions.REMOVE, componentId });
      },
      view() {
        let storeComponent: any;
        const storeComponents = store.getState().components;
        for (let index = 0; index < storeComponents.length; index++) {
          storeComponent = storeComponents[index];
          if (storeComponents[index].componentId === componentId) break;
        }
        if (!storeComponent) return null;

        return options.view(vnode, storeComponent.state, actions);
      }
    };
  };
};
