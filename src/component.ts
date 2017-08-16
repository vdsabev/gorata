import { Vnode, Lifecycle, Children } from 'mithril';

type EitherPromise<S> = S | Promise<S>;

interface Actions<S> {
  [key: string]: (state?: S, actions?: this, ...args: any[]) => EitherPromise<void | Partial<S>>;
}

interface ComponentOptions<S extends {}, A extends Actions<S>> {
  state?: S;
  actions?: A;
  events?: Lifecycle<any, null>;
  view: (v: Vnode<any, null>, s: S, a: A) => Children;
}

export const component = <S extends {}, A extends Actions<S>>(options: ComponentOptions<S, A>) => (vnode: Vnode<any, null>) => {
  let state: S = { ...<any>options.state, ...vnode.attrs };
  const setState = (newState: void | Partial<S>) => {
    if (newState) {
      state = { ...<any>state, ...<any>newState };
    }
    return state;
  };

  const actions = <A>{};
  Object.keys(options.actions).map((key) => {
    actions[key] = (...args: any[]) => {
      const stateOrPromise = options.actions[key](state, actions, ...args);
      if (isPromise(stateOrPromise)) {
        stateOrPromise.catch(setState).then(setState);
        return stateOrPromise;
      }
      return setState(stateOrPromise);
    };
  });

  return {
    ...options.events,
    view: () => options.view(vnode, state, actions)
  };
};

const isPromise = <S>(promise: EitherPromise<S>): promise is Promise<S> =>
  promise != null && (<Promise<S>>promise).catch != null && (<Promise<S>>promise).then != null;
