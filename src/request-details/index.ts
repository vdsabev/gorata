import { Timeago } from 'compote/components/timeago';
import { FactoryComponent } from 'mithril';

import { div, img, h4 } from 'compote/html';
import { Request } from '../request';

interface State {
  request: Request;
}

export const RequestDetails: FactoryComponent<State> = ({ attrs: { request } }) => {
  debugger;

  return {
    view: () => (
      div([
        img({ src: request.imageUrls && request.imageUrls[0] || 'default.png' }),
        div({ class: 'pa-md' }, [
          h4(request.title),
          request.text,
          Timeago(new Date(<number>request.created))
        ])
      ])
    )
  };
};
