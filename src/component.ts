import { Vnode, Lifecycle, Children } from 'mithril';

interface Actions<S> {
  [key: string]: (state?: S, actions?: this, ...args: any[]) => S | Promise<S>;
}

interface ComponentOptions<S extends {}, A extends Actions<S>> {
  state?: S;
  actions?: A;
  events?: Lifecycle<any, null>;
  view: (s: S, a: A, v: Vnode<any, null>) => Children;
}

export const component = <S extends {}, A extends Actions<S>>(options: ComponentOptions<S, A>) => (vnode: Vnode<any, null>) => {
  let state: S = { ...<any>options.state, ...vnode.attrs };
  const setState = (newState: S) => state = newState;

  const actions = <A>{};
  Object.keys(options.actions).map(createActionProxy);

  return {
    ...options.events,
    view: () => options.view(state, actions, vnode)
  };

  function createActionProxy(key: string) {
    actions[key] = (...args: any[]) => {
      const stateOrPromise = options.actions[key](state, actions, ...args);

      if (isPromise(stateOrPromise)) {
        stateOrPromise.catch(setState).then(setState);
        return stateOrPromise;
      }

      return setState(stateOrPromise);
    };
  }
};

const isPromise = <T>(promise: T | Promise<T>): promise is Promise<T> =>
  promise != null && (<Promise<T>>promise).catch != null && (<Promise<T>>promise).then != null;
