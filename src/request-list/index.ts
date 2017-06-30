import '../assets/default.png';
import './style.scss';

import { div, img, h4, h5, select, option } from 'compote/html';
import { flex } from 'compote/components/flex';
import * as firebase from 'firebase/app';
import { redraw } from 'mithril';

import { Request, RequestStatus, getStatusClass, getStatusText } from '../request';
import { store, Actions, RequestsFilter } from '../store';
import { User, canModerate } from '../user';

const data: Data = {};
interface Data {
  requestsFilter?: RequestsFilter;
  editingRequest?: Request;
}

export const RequestListView = {
  oninit() {
    data.editingRequest = null;
  },
  view() {
    const { currentUser, requests } = store.getState();
    return [
      RequestListStatusFilter(),
      ...requests.map(RequestListItem(currentUser))
    ];
  }
};

const RequestListStatusFilter = () => (
  div({ class: 'flex-row justify-content-space-around align-items-center ma-sm mt-md' }, [
    RequestListStatusFilterItem(null),
    RequestListStatusFilterItem('new'),
    RequestListStatusFilterItem('approved'),
    RequestListStatusFilterItem('declined')
  ])
);

const RequestListStatusFilterItem = (status: RequestStatus) => (
  h5({
    class: `
      request-list-status-filter-item br-md pv-sm ph-md pointer capitalize fade-animation
      ${getFilterItemActiveClass(status)}
    `,
    onclick: setStatusFilter(status)
  }, getStatusText(status, 'many') || 'всички')
);

const getFilterItemActiveClass = (status: RequestStatus) => {
  if (data.requestsFilter == null && status == null) return 'active';
  return data.requestsFilter && data.requestsFilter.key === 'status' && data.requestsFilter.value === status ? 'active' : '';
};

const setStatusFilter = (status: RequestStatus) => () => {
  data.requestsFilter = { key: 'status', value: status };
  store.dispatch({ type: Actions.GET_REQUESTS, filter: data.requestsFilter });
};

const RequestListItem = (currentUser: User) => (request: Request) => (
  div({ class: 'request-list-item pa-md flex-row justify-content-center align-items-center fade-in-animation', key: request.id }, [
    img({ class: 'width-md mr-sm br-md', src: request.imageUrls && request.imageUrls[0] || 'default.png' }),
    div({ style: flex(1) }, [
      h4(request.title),
      request.text
    ]),
    canModerate(currentUser) ?
      isEditingRequestStatus(request) ?
        select({ class: 'br-md pa-sm', onchange: setRequestStatus(request), value: request.status }, (<RequestStatus[]>['new', 'approved', 'declined']).map((status) => (
          option({ value: status }, getStatusText(status))
        )))
        :
        div({ class: `br-md pa-sm pointer ${getStatusClass(request.status)}`, onclick: startEditingRequest(request) }, getStatusText(request.status))
      :
      div({ class: `br-md pa-sm ${getStatusClass(request.status)}` }, getStatusText(request.status))
  ])
);

const isEditingRequestStatus = (request: Request) => data.editingRequest != null && data.editingRequest.id === request.id;

const setRequestStatus = (request: Request) => async (e: Event) => {
  const previousStatus = request.status;
  request.status = <RequestStatus>(<HTMLSelectElement>e.currentTarget).value;
  stopEditingRequest();

  try {
    await firebase.database().ref(`requests/${request.id}/status`).set(request.status);
  }
  catch (error) {
    request.status = previousStatus;
    data.editingRequest = request;
    redraw();

    window.alert(error.message);
  }
};

const startEditingRequest = (request: Request) => () => {
  data.editingRequest = request;
  redraw();
};

const stopEditingRequest = () => {
  data.editingRequest = null;
  redraw();
};
