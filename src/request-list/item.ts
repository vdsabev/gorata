import { div, img, h4, h5, select, option } from 'compote/html';
import { flex } from 'compote/components/flex';
import * as firebase from 'firebase/app';
import { redraw } from 'mithril';

import { Request, RequestStatus, getStatusClass, getStatusText } from '../request';
import { store, Actions } from '../store';
import { User, canModerate } from '../user';

let requestBeingEdited: Request;

// TODO: Call on init: `requestBeingEdited = null`
export const RequestListItem = (currentUser: User) => (request: Request) => (
  div({ class: 'request-list-item pa-md flex-row justify-content-center align-items-center fade-in-animation', key: request.id }, [
    img({ class: 'width-md mr-sm br-md', src: request.imageUrls && request.imageUrls[0] || 'default.png' }),
    div({ style: flex(1) }, [
      h4(request.title),
      request.text
    ]),
    canModerate(currentUser) ?
      isRequestStatusBeingEdited(request) ?
        select({ class: 'br-md pa-sm', onchange: setRequestStatus(request), value: request.status }, (<RequestStatus[]>['new', 'approved', 'declined']).map((status) => (
          option({ value: status }, getStatusText(status))
        )))
        :
        div({ class: `br-md pa-sm pointer ${getStatusClass(request.status)}`, onclick: () => startEditingRequest(request) }, getStatusText(request.status))
      :
      div({ class: `br-md pa-sm ${getStatusClass(request.status)}` }, getStatusText(request.status))
  ])
);

const isRequestStatusBeingEdited = (request: Request) => requestBeingEdited != null && requestBeingEdited.id === request.id;

const setRequestStatus = (request: Request) => async (e: Event) => {
  const previousStatus = request.status;
  request.status = <RequestStatus>(<HTMLSelectElement>e.currentTarget).value;
  stopEditingRequest();

  try {
    await firebase.database().ref(`requests/${request.id}/status`).set(request.status);
  }
  catch (error) {
    request.status = previousStatus;
    startEditingRequest(request);

    window.alert(error.message);
  }
};

const startEditingRequest = (request: Request) => {
  requestBeingEdited = request;
  redraw();
};

const stopEditingRequest = () => {
  requestBeingEdited = null;
  redraw();
};
