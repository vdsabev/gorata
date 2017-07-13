import { div, h5 } from 'compote/html';
import * as m from 'mithril';

import { RequestStatus, getStatusText } from '../request';
import { store, Actions, RequestsFilter } from '../store';

let requestsFilter: RequestsFilter;

export const RequestListStatusFilter = () => (
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
  if (requestsFilter == null && status == null) return 'active';
  return requestsFilter && requestsFilter.key === 'status' && requestsFilter.value === status ? 'active' : '';
};

const setStatusFilter = (status: RequestStatus) => () => {
  requestsFilter = { key: 'status', value: status };
  store.dispatch({ type: Actions.GET_REQUESTS, filter: requestsFilter });
};
