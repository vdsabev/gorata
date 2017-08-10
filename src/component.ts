import { Vnode } from 'mithril';

interface Actions<State> {
  [key: string]: (state?: State, actions?: Actions<State>, ...args: any[]) => State | Promise<State>;
}

export const component = <S extends {}, A extends Actions<S>>(options: { state: S, actions: A, render: (s: S, a: A) => any }) => (vnode: Vnode<any, S>) => {
  let state: S = { ...<any>options.state, ...vnode.attrs };

  const actions = <A>{};
  Object.keys(options.actions).map(createActionProxy);

  return {
    // TODO: Attach lifecycle methods, perhaps from `options.events`
    view: () => options.render(state, actions)
  };

  function createActionProxy(key: string) {
    actions[key] = (...args: any[]) => {
      const stateOrPromise = options.actions[key](<any>state, actions, ...args);

      if (!stateOrPromise) return state;

      if ((<Promise<S>>stateOrPromise).then && (<Promise<S>>stateOrPromise).catch) {
        (<Promise<S>>stateOrPromise).catch(setState).then(setState);
        return stateOrPromise;
      }

      return setState(<S>stateOrPromise);
    };
  }

  function setState(newState: S) {
    // The state object MUST be an object, so ignore falsy values
    if (newState) {
      state = newState;
    }
    return state;
  }
};
