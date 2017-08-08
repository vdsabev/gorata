import { a, div, img, h4, select, option } from 'compote/html';
import { flex } from 'compote/components/flex';
import { FactoryComponent, redraw, route, withAttr } from 'mithril';

import { Request, RequestStatus, setRequestStatus, requestStatuses, getStatusClass, getStatusText } from '../request';
import { store } from '../store';
import { canModerate } from '../user';

interface State {
  parent: {
    requestBeingEdited: Request;
  };
  request: Request;
}

export const RequestListItem: FactoryComponent<State> = ({ attrs }) => {
  const state: State = {
    parent: attrs.parent,
    request: attrs.request
  };

  const setStatusToValue = withAttr('value', setStatus(state));
  const setRequestBeingEditedToStateRequest = () => setRequestBeingEdited(state, state.request);

  return {
    view() {
      const { currentUser } = store.getState();
      const { request } = state;
      return (
        a({
          class: 'request-list-item pa-md flex-row justify-content-center align-items-center fade-in-animation',
          oncreate: route.link, href: `/requests/${request.id}`
        }, [
          img({ class: 'width-md mr-sm br-md', src: request.imageUrls && request.imageUrls[0] || 'default.png' }),
          div({ style: flex(1) }, [
            h4(request.title),
            request.text
          ]),
          canModerate(currentUser) ?
            isRequestBeingEdited(state.parent.requestBeingEdited, request) ?
              select({
                class: 'br-md pa-sm',
                onchange: setStatusToValue,
                value: request.status
              }, requestStatuses.map((status) => (
                option({ value: status }, getStatusText(status))
              )))
              :
              div({
                class: `br-md pa-sm pointer ${getStatusClass(request.status)}`,
                onclick: setRequestBeingEditedToStateRequest
              }, getStatusText(request.status))
            :
            div({ class: `br-md pa-sm ${getStatusClass(request.status)}` }, getStatusText(request.status))
        ])
      );
    }
  };
};

const isRequestBeingEdited = (requestBeingEdited: Request, request: Request) => (
  requestBeingEdited != null && request != null && requestBeingEdited.id === request.id
);

const setStatus = (state: State) => async (status: RequestStatus) => {
  const { request } = state;
  const previousStatus = request.status;
  request.status = status;
  setRequestBeingEdited(state, null);

  try {
    await setRequestStatus(request.id, request.status);
  }
  catch (error) {
    request.status = previousStatus;
    setRequestBeingEdited(state, request);

    window.alert(error.message);
  }
};

const setRequestBeingEdited = (state: State, request: Request) => {
  state.parent.requestBeingEdited = request;
  redraw();
};
