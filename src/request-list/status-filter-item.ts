import { h5 } from 'compote/html';

import { Component, VNode, render } from '../component';
import { RequestStatus, getStatusText } from '../request';
import { store, Actions, RequestsFilter } from '../store';

export class RequestListStatusFilterItem implements Component {
  static render = render(RequestListStatusFilterItem);

  parent: {
    requestsFilter: RequestsFilter;
  };
  status: RequestStatus;

  oninit({ attrs }: VNode<RequestListStatusFilterItem>) {
    this.parent = attrs.parent;
    this.status = attrs.status;
  }

  view() {
    return (
      h5({
          class: `
            request-list-status-filter-item br-md pv-sm ph-md pointer capitalize fade-animation
            ${this.getFilterItemActiveClass(this.status)}
          `,
          onclick: this.setStatusFilter(this.status)
        },
        getStatusText(this.status, 'many') || 'всички'
      )
    );
  }

  getFilterItemActiveClass = (status: RequestStatus) => {
    if (this.parent.requestsFilter == null && status == null) return 'active';
    return this.parent.requestsFilter && this.parent.requestsFilter.key === 'status' && this.parent.requestsFilter.value === status ? 'active' : '';
  }

  setStatusFilter = (status: RequestStatus) => () => {
    this.parent.requestsFilter = { key: 'status', value: status };
    store.dispatch({ type: Actions.GET_REQUESTS, filter: this.parent.requestsFilter });
  }
}
