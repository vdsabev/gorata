import { div, h4, select, option } from 'compote/html';
import { Timeago } from 'compote/components/timeago';
import { flex } from 'compote/components/flex';
import * as m from 'mithril';
import { redraw } from 'mithril';

import { component } from '../component';
import { Image } from '../image';
import * as notify from '../notify';
import { Request, RequestStatus as RequestStatusType, requestStatuses, setRequestStatus, getStatusText } from '../request';
import { RequestStatus } from '../request-status';
import { store } from '../store';
import { canModerate } from '../user';

export const RequestDetails = component({
  state: {
    request: <Request>null,
    isRequestStatusBeingEdited: false
  },

  actions: {
    startEditingStatus: () => ({ isRequestStatusBeingEdited: true }),
    stopEditingStatus: () => ({ isRequestStatusBeingEdited: false }),
    setStatus: (state, actions, status: RequestStatusType) => ({ request: { ...state.request, status } }),
    setStatusAsync: async ({ request }, actions, e: Event) => {
      const previousStatus = request.status;
      try {
        // Optimistically set the status
        const newStatus = <RequestStatusType>(<HTMLSelectElement>e.currentTarget).value;
        actions.stopEditingStatus();
        actions.setStatus(<any>newStatus);
        redraw();

        await setRequestStatus(request.id, newStatus);
      }
      catch (error) {
        // Restore the old status
        actions.startEditingStatus();
        actions.setStatus(<any>previousStatus);
        redraw();

        notify.error(error);
      }
    }
  },

  view(vnode, { request, isRequestStatusBeingEdited }, actions) {
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
                  select({ class: 'br-md pa-sm', onchange: actions.setStatusAsync, value: request.status },
                    requestStatuses.map(RequestStatusOption)
                  ),
                  div({ class: 'pointer mr-n-md pa-md unselectable', onclick: actions.stopEditingStatus }, '✖️')
                ]
                :
                [
                  m(RequestStatus, { status: request.status }),
                  div({ class: 'pointer mr-n-md pa-md unselectable', onclick: actions.startEditingStatus }, '✏️')
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
