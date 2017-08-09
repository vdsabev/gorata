import '../assets/default.png';

import { a, div, img, h4 } from 'compote/html';
import { flex } from 'compote/components/flex';
import * as m from 'mithril';
import { FactoryComponent, route } from 'mithril';

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
          class: 'request-list-item pa-md flex-row justify-content-center align-items-start fade-in-animation',
          oncreate: route.link, href: `/requests/${request.id}`
        }, [
          img({ class: 'width-md mr-sm br-md', src: request.imageUrls && request.imageUrls[0] || 'default.png' }),
          div({ style: flex(1) }, [
            h4(request.title),
            request.text
          ]),
          m(RequestStatus, { status: request.status })
        ])
      );
    }
  };
};
