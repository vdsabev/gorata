import './style.scss';

import { div, h4, CustomProperties } from 'compote/html';
import { flex } from 'compote/components/flex';

import { Request, getStatusClass, getStatusText } from '../request';
import { store } from '../store';

export const RequestListView = {
  view() {
    const { requests } = store.getState();
    return requests.map(RequestListItem);
  }
};

const RequestListItem = (request: Request) => (
  div({ className: 'request-list-item pv-md ph-sm flex-row justify-content-center align-items-center fade-in-animation', key: request.id }, [
    div({ style: flex(1) }, [
      h4(request.title),
      request.text
    ]),
    div({ className: `pa-sm border-radius ${getStatusClass(request.status)}` }, getStatusText(request.status))
  ])
);
