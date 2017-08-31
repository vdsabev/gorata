import { a, div, h4 } from 'compote/html';
import * as m from 'mithril';
import { FactoryComponent, route } from 'mithril';

import { Image } from '../image';
import { Request } from '../request';
import { RequestStatus } from '../request-status';

interface State {
  request: Request;
}

export const RequestListItem: FactoryComponent<State> = ({ attrs }) => {
  const state: State = {
    request: attrs.request
  };

  return {
    view() {
      const { request } = state;
      return (
        a({
          class: 'request-list-item pa-md align-items-start fade-in-animation',
          oncreate: route.link, href: `/requests/${request.id}`
        }, [
          m(Image, { class: 'br-md', src: request.imageUrls && request.imageUrls[0] || 'default.png' }),
          div([
            h4(request.title),
            request.text
          ]),
          m(RequestStatus, { status: request.status })
        ])
      );
    }
  };
};
