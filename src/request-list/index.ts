import './style.scss';

import { div, h4 } from 'compote/html';
import { Request } from '../request';

export const RequestList = (requests: Request[]) => requests.map(RequestListItem);

const RequestListItem = (request: Request) => (
  div({ className: 'request-list-item fade-in-animation' }, [
    h4(request.title),
    request.text
  ])
);
