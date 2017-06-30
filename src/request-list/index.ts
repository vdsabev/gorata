import '../assets/default.png';
import './style.scss';

import { div, img, h4, h5, CustomProperties } from 'compote/html';
import { flex } from 'compote/components/flex';

import { Request, RequestStatus, getStatusClass, getStatusText } from '../request';
import { store, Actions, RequestsFilter } from '../store';

export const RequestListView = {
  view() {
    const { requests, requestsFilter } = store.getState();
    return [
      RequestListStatusFilter(requestsFilter),
      ...requests.map(RequestListItem)
    ];
  }
};

const RequestListStatusFilter = (requestsFilter: RequestsFilter) => (
  div({ class: 'flex-row justify-content-space-around align-items-center ma-sm mt-md' }, [
    RequestListStatusFilterItem(requestsFilter, null),
    RequestListStatusFilterItem(requestsFilter, 'new'),
    RequestListStatusFilterItem(requestsFilter, 'approved'),
    RequestListStatusFilterItem(requestsFilter, 'declined')
  ])
);

const RequestListStatusFilterItem = (requestsFilter: RequestsFilter, status: RequestStatus) => (
  h5({
    class: `
      request-list-status-filter-item br-md pv-sm ph-md pointer capitalize fade-animation
      ${getFilterItemActiveClass(requestsFilter, status)}
    `,
    onclick: setStatusFilter(status)
  }, getStatusText(status, 'many') || 'всички')
);

const getFilterItemActiveClass = (requestsFilter: RequestsFilter, status: RequestStatus) => {
  if (requestsFilter == null && status == null) return 'active';
  return requestsFilter && requestsFilter.key === 'status' && requestsFilter.value === status ? 'active' : '';
};

const setStatusFilter = (status: RequestStatus) => () => {
  store.dispatch({ type: Actions.GET_REQUESTS, filter: { key: 'status', value: status } });
};

const RequestListItem = (request: Request) => (
  div({ class: 'request-list-item pv-md ph-sm flex-row justify-content-center align-items-center fade-in-animation', key: request.id }, [
    img({ class: 'width-md mr-sm br-md', src: request.imageUrls && request.imageUrls[0] || 'default.png' }),
    div({ style: flex(1) }, [
      h4(request.title),
      request.text
    ]),
    div({ class: `br-md pa-sm ${getStatusClass(request.status)}` }, getStatusText(request.status))
  ])
);
