import { textarea } from 'compote/html';
import { set } from 'compote/components/utils';
import { withAttr, FactoryComponent } from 'mithril';

import { Request } from '../request';

export const TextInput: FactoryComponent<{ request: Request }> = ({ attrs: { request } }) => {
  const setText = withAttr('value', set<Request>('text')(request));

  return {
    view: () => (
      textarea({
        class: 'form-input',
        name: 'text', placeholder: 'От какво имате нужда?', rows: 15,
        value: request.text, oninput: setText
      })
    )
  };
};
