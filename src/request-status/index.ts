import { div } from 'compote/html';
import { FactoryComponent } from 'mithril';

import { RequestStatus as RequestStatusType, getStatusClass, getStatusText } from '../request';

interface State {
  class?: string;
  onclick?: Function;
  status: RequestStatusType;
}

export const RequestStatus: FactoryComponent<State> = ({ attrs: { status, ...attrs } }) => ({
  view: () => (
    div({ ...attrs, class: `br-md pa-sm ${getStatusClass(status)} ${attrs.class || ''}` }, getStatusText(status))
  )
});
