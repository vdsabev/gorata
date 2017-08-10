import { div, h4, select, option } from 'compote/html';
import { Timeago } from 'compote/components/timeago';
import { flex } from 'compote/components/flex';
import * as m from 'mithril';
import { /*ClassComponent,*/ Vnode, redraw } from 'mithril';

import { Image } from '../image';
import * as notify from '../notify';
import { Request, RequestStatus as RequestStatusType, requestStatuses, setRequestStatus, getStatusText } from '../request';
import { RequestStatus } from '../request-status';
import { store } from '../store';
import { canModerate } from '../user';

interface Actions<State> {
  [key: string]: (state?: State, actions?: Actions<State>, ...args: any[]) => State | Promise<State>;
}

const component = <S extends {}, A extends Actions<S>>(options: { state: S, actions: A, render: (s: S, a: A) => any }) => (vnode: Vnode<any, S>) => {
  let state: S = { ...<any>options.state, ...vnode.attrs };

  const actions = <A>{};
  Object.keys(options.actions).map((key) => {
    actions[key] = (...args: any[]) => {
      const stateOrPromise = options.actions[key](<any>state, actions, ...args);
      if (stateOrPromise && (<Promise<S>>stateOrPromise).then && (<Promise<S>>stateOrPromise).catch) {
        (<Promise<S>>stateOrPromise).catch(redraw).then((promisedState: S) => {
          state = promisedState;
          redraw();
          return state;
        });
        return stateOrPromise;
      }
      return state = <S>stateOrPromise;
    };
  });

  return {
    // TODO: Lifecycle methods
    view: () => options.render(state, actions)
  };
};

export const RequestDetails = component({
  state: {
    request: <Request>null,
    isRequestStatusBeingEdited: false
  },

  actions: {
    startEditingStatus: (state) => ({ ...state, isRequestStatusBeingEdited: true }),
    stopEditingStatus: (state) => ({ ...state, isRequestStatusBeingEdited: false }),
    setStatus: (state, actions, status: RequestStatusType) => ({ ...state, request: { ...state.request, status } }),
    setStatusAsync: async (state, { startEditingStatus, stopEditingStatus, setStatus }, e: Event) => {
      const previousStatus = state.request.status;
      const newStatus = <RequestStatusType>(<HTMLSelectElement>e.currentTarget).value;
      stopEditingStatus();
      setStatus(<any>newStatus);
      redraw();

      try {
        await setRequestStatus(state.request.id, newStatus);
        return setStatus(<any>newStatus);
      }
      catch (error) {
        notify.error(error);
        startEditingStatus();
        return setStatus(<any>previousStatus);
      }
    }
  },

  render({ request, isRequestStatusBeingEdited }, { startEditingStatus, stopEditingStatus, setStatusAsync }) {
    const { currentUser } = store.getState();

    return (
      div([
        request.imageUrls && request.imageUrls.length > 0 ?
          request.imageUrls.map((imageUrl) => m(Image, { src: imageUrl }))
          :
          m(Image, { src: 'default.png' }),
        div({ class: 'pa-md' }, [
          div({ class: 'flex-row justify-content-center align-items-start' }, [
            h4({ style: flex(1) }, request.title),
            canModerate(currentUser) ?
              div({ class: 'flex-row justify-content-center align-items-center' }, isRequestStatusBeingEdited ?
                [
                  select({ class: 'br-md pa-sm', onchange: setStatusAsync, value: request.status },
                    requestStatuses.map(RequestStatusOption)
                  ),
                  div({ class: 'pointer mr-n-md pa-md unselectable', onclick: stopEditingStatus }, '✖️')
                ]
                :
                [
                  m(RequestStatus, { status: request.status }),
                  div({ class: 'pointer mr-n-md pa-md unselectable', onclick: startEditingStatus }, '✏️')
                ]
              )
              :
              m(RequestStatus, { status: request.status })
          ]),
          request.text,
          Timeago(new Date(<number>request.created))
        ])
      ])
    );
  }
});

const RequestStatusOption = (status: RequestStatusType) => option({ value: status }, getStatusText(status));
