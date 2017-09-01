import './style.scss';

import { div } from 'compote/html';
import * as m from 'mithril';
import { FactoryComponent } from 'mithril';

import { Request, requestStatuses } from '../request';
import { store, RequestsFilter } from '../store';

import { RequestListStatusFilterItem } from './status-filter-item';
import { RequestListItem } from './item';

interface State {
  requestsFilter: RequestsFilter;
  requestBeingEdited: Request;
}

const state: State = {
  requestsFilter: { key: 'status', value: 'new' },
  requestBeingEdited: null
};

export const RequestList: FactoryComponent<State> = () => {
  state.requestBeingEdited = null;

  return {
    view() {
      const { requests } = store.getState();
      return [
        // Status Filter
        div({ class: 'request-list-status-filter flex-row justify-content-space-around align-items-center ph-sm pv-md sticky top-0 bg-neutral-lighter' },
          [...requestStatuses, null].map((status) => m(RequestListStatusFilterItem, {
            key: status,
            parent: state,
            status
          }))
        ),
        // List Items
        requests.map((request) => m(RequestListItem, {
          key: request.id,
          request
        }))
      ];
    }
  };
};
