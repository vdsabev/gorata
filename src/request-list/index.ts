import '../assets/default.png';
import './style.scss';

import { div } from 'compote/html';
import { redraw } from 'mithril';

import { Component } from '../component';
import { Request, requestStatuses } from '../request';
import { store, RequestsFilter } from '../store';

import { RequestListStatusFilterItem } from './status-filter-item';
import { RequestListItem } from './item';

export class RequestList implements Component {
  requestsFilter: RequestsFilter;
  requestBeingEdited: Request;

  view() {
    const { currentUser, requests } = store.getState();
    return [
      // Status Filter
      div({ class: 'flex-row justify-content-space-around align-items-center ma-sm mt-md' },
        [null, ...requestStatuses].map((status) => RequestListStatusFilterItem.render({ key: status, parent: this, status }))
      ),
      // List Items
      ...requests.map((request) => RequestListItem.render({
        key: request.id,
        parent: this,
        request
      }))
    ];
  }
}
