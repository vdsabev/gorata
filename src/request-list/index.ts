import '../assets/default.png';
import './style.scss';

import * as m from 'mithril';

import { RequestListStatusFilter } from './status-filter';
import { RequestListItem } from './item';

import { store } from '../store';
import { partial } from '../utils';

export const RequestList = partial(m, {
  view() {
    const { currentUser, requests } = store.getState();
    return [
      RequestListStatusFilter(),
      ...requests.map(RequestListItem(currentUser))
    ];
  }
});
