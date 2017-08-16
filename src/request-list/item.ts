import { a, div, img, h4 } from 'compote/html';
import { flex } from 'compote/components/flex';
import * as m from 'mithril';
import { route } from 'mithril';

import { component } from '../component';
import { Request } from '../request';
import { RequestStatus } from '../request-status';

type Attrs = Partial<HTMLAnchorElement> & { request: Request };
type State = { isHovered: boolean };

export const RequestListItem = component({
  reducers: {
    isHovered(state = false, action: any = {}): boolean {
      switch (action.type) {
        case 'REQUEST_LIST_ITEM:MOUSEENTER': return true;
        case 'REQUEST_LIST_ITEM:MOUSELEAVE': return false;
      }
      return state;
    }
  },
  actions: {
    mouseenter: (e: MouseEvent): any => ({ type: 'REQUEST_LIST_ITEM:MOUSEENTER' }),
    mouseleave: (e: MouseEvent): any => ({ type: 'REQUEST_LIST_ITEM:MOUSELEAVE' })
  },
  view: ({ attrs: { request } }: { attrs: Attrs }, { isHovered }: State, actions) => (
    a({
      class: 'request-list-item pa-md flex-row justify-content-center align-items-start fade-in-animation',
      oncreate: route.link, href: `/requests/${request.id}`,
      onmouseenter: actions.mouseenter,
      onmouseleave: actions.mouseleave,
      style: { background: isHovered ? 'red' : 'transparent' }
    }, [
      img({ class: 'width-md mr-sm br-md', src: request.imageUrls && request.imageUrls[0] || 'default.png' }),
      div({ style: flex(1) }, [
        h4(request.title),
        request.text
      ]),
      m(RequestStatus, { status: request.status })
    ])
  )
});
