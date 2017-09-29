import { a, div, h4 } from 'compote/html';
import { Timeago } from 'compote/components/timeago';
import * as m from 'mithril';
import { Component } from 'mithril';

import { Image } from '../image';
import { Request } from '../request';
import { RequestStatusItem } from '../request-status-item';
import { route, Routes } from '../router';

interface Attrs {
  request: Request;
}

export const RequestListItem: Component<Attrs, null> = {
  view: ({ attrs: { request } }) => (
    a({
      class: 'request-list-item pa-md align-items-start fade-in-animation',
      oncreate: route.link, href: Routes.REQUEST_DETAILS(request.id)
    }, [
      m(Image, { class: 'br-md', src: request.imageUrls && request.imageUrls[0] || 'default.png' }),
      div([
        h4(request.title),
        div({ class: 'mb-xs' }, request.text),
        Timeago(new Date(<number>request.created))
      ]),
      m(RequestStatusItem, { status: request.status })
    ])
  )
};
