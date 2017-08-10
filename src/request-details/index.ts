import { div, h4, select, option } from 'compote/html';
import { Timeago } from 'compote/components/timeago';
import { flex } from 'compote/components/flex';
import * as m from 'mithril';
import { ClassComponent, Vnode, redraw, withAttr } from 'mithril';

import { Image } from '../image';
import * as notify from '../notify';
import { Request, RequestStatus as RequestStatusType, requestStatuses, setRequestStatus, getStatusText } from '../request';
import { RequestStatus } from '../request-status';
import { store } from '../store';
import { canModerate } from '../user';

export class RequestDetails implements ClassComponent<HTMLDivElement> {
  request: Request;
  isRequestStatusBeingEdited: boolean;

  oninit({ attrs }: Vnode<HTMLDivElement & this, this>) {
    this.request = attrs.request;
  }

  view() {
    const { currentUser } = store.getState();
    const { request } = this;

    return (
      div([
        request.imageUrls && request.imageUrls.length > 0 ?
          request.imageUrls.map((imageUrl) => m(Image, { src: imageUrl }))
          :
          m(Image, { src: 'default.png' }),
        div({ class: 'pa-md' }, [
          div({ class: 'flex-row justify-content-center align-items-start' }, [
            h4({ style: flex(1) }, request.title),
            canModerate(currentUser) ?
              div({ class: 'flex-row justify-content-center align-items-center' }, this.isRequestStatusBeingEdited ?
                [
                  select({ class: 'br-md pa-sm', onchange: this.setStatusToValue, value: request.status },
                    requestStatuses.map(RequestStatusOption)
                  ),
                  div({ class: 'pointer mr-n-md pa-md unselectable', onclick: this.stopEditingRequestStatus }, '✖️')
                ]
                :
                [
                  m(RequestStatus, { status: request.status }),
                  div({ class: 'pointer mr-n-md pa-md unselectable', onclick: this.startEditingRequestStatus }, '✏️')
                ]
              )
              :
              m(RequestStatus, { status: request.status })
          ]),
          request.text,
          Timeago(new Date(<number>request.created))
        ])
      ])
    );
  }

  startEditingRequestStatus = () => {
    this.isRequestStatusBeingEdited = true;
  }

  stopEditingRequestStatus = () => {
    this.isRequestStatusBeingEdited = false;
  }

  setStatus = async (status: RequestStatusType) => {
    const { request } = this;
    const previousStatus = request.status;

    try {
      request.status = status;
      this.stopEditingRequestStatus();

      await setRequestStatus(request.id, request.status);
    }
    catch (error) {
      request.status = previousStatus;
      this.startEditingRequestStatus();
      redraw();

      notify.error(error);
    }
  }

  setStatusToValue = withAttr('value', this.setStatus);
}

const RequestStatusOption = (status: RequestStatusType) => option({ value: status }, getStatusText(status));
