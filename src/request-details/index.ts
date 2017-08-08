import { div, img, h4, select, option } from 'compote/html';
import { Timeago } from 'compote/components/timeago';
import { flex } from 'compote/components/flex';
import * as m from 'mithril';
import { FactoryComponent, redraw, withAttr } from 'mithril';

import * as notify from '../notify';
import { Request, RequestStatus as RequestStatusType, requestStatuses, setRequestStatus, getStatusText } from '../request';
import { RequestStatus } from '../request-status';
import { store } from '../store';
import { canModerate } from '../user';

interface State {
  request: Request;
  isRequestStatusBeingEdited?: boolean;
}

export const RequestDetails: FactoryComponent<State> = ({ attrs }) => {
  const state: State = {
    request: attrs.request
  };

  const setStatusToValue = withAttr('value', setStatus(state));
  const startEditingRequestStatus = () => {
    state.isRequestStatusBeingEdited = true;
    redraw();
  };

  return {
    view() {
      const { currentUser } = store.getState();
      const { request, isRequestStatusBeingEdited } = state;

      return (
        div([
          img({ src: request.imageUrls && request.imageUrls[0] || 'default.png' }),
          div({ class: 'pa-md' }, [
            div({ class: 'flex-row justify-content-center align-items-start' }, [
              h4({ style: flex(1) }, request.title),
              canModerate(currentUser) ?
                isRequestStatusBeingEdited ?
                  select({ class: 'br-md pa-sm', onchange: setStatusToValue, value: request.status },
                    requestStatuses.map((status) =>
                      option({ value: status }, getStatusText(status))
                    )
                  )
                  :
                  m(RequestStatus, { class: 'pointer', onclick: startEditingRequestStatus, status: request.status })
                :
                m(RequestStatus, { status: request.status })
            ]),
            request.text,
            Timeago(new Date(<number>request.created))
          ])
        ])
      );
    }
  };
};

const setStatus = (state: State) => async (status: RequestStatusType) => {
  const { request } = state;
  const previousStatus = request.status;
  request.status = status;
  state.isRequestStatusBeingEdited = false;
  redraw();

  try {
    await setRequestStatus(request.id, request.status);
  }
  catch (error) {
    request.status = previousStatus;
    state.isRequestStatusBeingEdited = true;
    redraw();

    notify.error(error);
  }
};
