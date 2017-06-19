import './style.scss';

import { div, h4, CustomProperties } from 'compote/html';
import { flex } from 'compote/components/flex';

import { Request, getStatusClass, getStatusText } from '../request';

export const RequestList = (props: CustomProperties, requests: Request[]) => div(props, requests.map(RequestListItem));

const RequestListItem = (request: Request) => (
  div({ className: 'request-list-item flex-row justify-content-center align-items-center fade-in-animation', key: request.id }, [
    div({ style: flex(1) }, [
      h4(request.title),
      request.text
    ]),
    div({ className: `request-list-item-status ${getStatusClass(request.status)}` }, getStatusText(request.status))
  ])
);
