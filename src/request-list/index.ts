import './style.scss';

import { div, h4, CustomProperties } from 'compote/html';
import { Request } from '../request';

export const RequestList = (props: CustomProperties, requests: Request[]) => div(props, requests.map(RequestListItem));

const RequestListItem = (request: Request) => (
  div({ className: 'request-list-item fade-in-animation', key: request.id }, [
    h4(request.title),
    request.text
  ])
);
