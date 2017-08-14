import { div, h4, select, option } from 'compote/html';
import { Timeago } from 'compote/components/timeago';
import { flex } from 'compote/components/flex';
import * as m from 'mithril';

import { component } from '../component';
import { Image } from '../image';
import * as notify from '../notify';
import { Request, RequestStatus as RequestStatusType, requestStatuses, setRequestStatus, getStatusText } from '../request';
import { RequestStatus } from '../request-status';
import { store } from '../store';
import { canModerate } from '../user';

interface State {
  request: Request;
  isRequestStatusBeingEdited: boolean;
}

export const RequestDetails = component({
  reducers: {
    request(request: Request = null, action = {}, state: State, actions): Request {
      switch (action.type) {
        case 'SAVE_STATUS':
          const previousStatus = request.status;
          setRequestStatus(request.id, action.status).catch((error) => {
            actions.revertStatus(previousStatus);
            notify.error(error);
          });
          return { ...request, status: action.status };
        case 'REVERT_STATUS': return { ...request, status: action.status };
        default: return request;
      }
    },
    isRequestStatusBeingEdited(isRequestStatusBeingEdited = false, action = {}): boolean {
      switch (action.type) {
        case 'START_EDITING_STATUS': return true;
        case 'STOP_EDITING_STATUS': return false;
        case 'SAVE_STATUS': return false;
        case 'REVERT_STATUS': return true;
        default: return isRequestStatusBeingEdited;
      }
    }
  },

  actions: {
    startEditingStatus: (): any => ({ type: 'START_EDITING_STATUS' }),
    stopEditingStatus: (): any => ({ type: 'STOP_EDITING_STATUS' }),
    saveStatus: (e: Event): any => ({ type: 'SAVE_STATUS', status: <RequestStatusType>(<HTMLSelectElement>e.currentTarget).value }),
    revertStatus: (status: RequestStatusType): any => ({ type: 'REVERT_STATUS', status })
  },

  view(vnode, { request, ...state }: State, actions) {
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
              div({ class: 'flex-row justify-content-center align-items-center' }, state.isRequestStatusBeingEdited ?
                [
                  select({ class: 'br-md pa-sm', onchange: actions.saveStatus, value: request.status },
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
