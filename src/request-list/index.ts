import '../assets/default.png';
import './style.scss';

import { div, img, h4, CustomProperties } from 'compote/html';
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
  div({ class: 'request-list-item pv-md ph-sm flex-row justify-content-center align-items-center fade-in-animation', key: request.id }, [
    img({ class: 'width-md border-radius mr-sm', src: request.imageUrls && request.imageUrls[0] || 'default.png' }),
    div({ style: flex(1) }, [
      h4(request.title),
      request.text
    ]),
    div({ class: `pa-sm border-radius ${getStatusClass(request.status)}` }, getStatusText(request.status))
  ])
);
