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
    startEditingStatus: (state) => ({ ...state, isRequestStatusBeingEdited: true }),
    stopEditingStatus: (state) => ({ ...state, isRequestStatusBeingEdited: false }),
    setStatus: ({ request, ...state }, actions, status: RequestStatusType) => ({ ...state, request: { ...request, status } }),
    // TODO: Types
    setStatusAsync: async ({ request }, { startEditingStatus, stopEditingStatus, setStatus }, e: Event) => {
      const previousStatus = request.status;
      const newStatus = <RequestStatusType>(<HTMLSelectElement>e.currentTarget).value;
      stopEditingStatus();
      setStatus(<any>newStatus);
      redraw();

      try {
        await setRequestStatus(request.id, newStatus);
      }
      catch (error) {
        notify.error(error);
        startEditingStatus();
        setStatus(<any>previousStatus);
        redraw();
      }

      return null;
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
