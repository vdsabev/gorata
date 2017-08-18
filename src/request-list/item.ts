import { a, div, img, h4 } from 'compote/html';
import { flex } from 'compote/components/flex';
import * as m from 'mithril';
import { FactoryComponent, route } from 'mithril';

import { createComponent } from '../component';
import { Request } from '../request';
import { RequestStatus } from '../request-status';
import { store, ComponentActions } from '../store';

interface Attrs extends Partial<HTMLAnchorElement> {
  request: Request;
}

interface State {
  isHovered?: boolean;
}

export const RequestListItem: FactoryComponent<Attrs> = ({ attrs: { request } }) => {
  const component = createComponent({
    state: <State>{},
    reducers: {
      isHovered(isHovered = false, action: any = {}): boolean {
        switch (action.type) {
          case 'REQUEST_LIST_ITEM:MOUSEENTER': return true;
          case 'REQUEST_LIST_ITEM:MOUSELEAVE': return false;
        }
        return isHovered;
      }
    },
    actions: {
      mouseenter: (e: MouseEvent): any => ({ type: 'REQUEST_LIST_ITEM:MOUSEENTER' }),
      mouseleave: (e: MouseEvent): any => ({ type: 'REQUEST_LIST_ITEM:MOUSELEAVE' })
    }
  });

  return {
    onremove() {
      store.dispatch({ type: ComponentActions.REMOVE, componentId: component.id });
    },
    view() {
      const { isHovered } = component.getState();
      return (
        a({
          class: 'request-list-item pa-md flex-row justify-content-center align-items-start fade-in-animation',
          oncreate: route.link, href: `/requests/${request.id}`,
          onmouseenter: component.actions.mouseenter,
          onmouseleave: component.actions.mouseleave,
          style: { background: isHovered ? 'red' : 'transparent' }
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
