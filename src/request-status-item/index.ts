import { div, Properties } from 'compote/html';
import { Component } from 'mithril';

import { RequestStatus as RequestStatusType, getStatusClass, getStatusText } from '../request';

interface Attrs extends Properties<HTMLDivElement> {
  status: RequestStatusType;
}

export const RequestStatusItem: Component<Attrs, null> = {
  view: ({ attrs: { status, ...attrs } }) => (
    div({ ...attrs, class: `br-md pa-sm ${attrs.class || ''} ${getStatusClass(status)}` }, getStatusText(status))
  )
};
