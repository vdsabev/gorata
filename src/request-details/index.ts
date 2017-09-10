import { div, h4, select, option, Properties } from 'compote/html';
import { Timeago } from 'compote/components/timeago';
import { flex } from 'compote/components/flex';
import * as m from 'mithril';
import { FactoryComponent, redraw, withAttr } from 'mithril';

import { Image } from '../image';
import * as notify from '../notify';
import { Request, RequestStatus as RequestStatusType, requestStatuses, RequestServices, getStatusText } from '../request';
import { RequestStatus } from '../request-status';
import { store } from '../store';
import { UserProfile, canModerate, UserServices } from '../user';
import { UserProfileImage } from '../user-profile-image';

interface State extends Properties<HTMLDivElement> {
  request: Request;
  createdBy?: UserProfile;
  isRequestStatusBeingEdited?: boolean;
}

export const RequestDetails: FactoryComponent<State> = ({ attrs }) => {
  const state: State = {
    request: attrs.request
  };

  loadCreatedBy(state, state.request.createdBy);

  const setRequestStatusToValue = withAttr('value', setRequestStatus(state));
  const startEditingRequestStatus = () => { state.isRequestStatusBeingEdited = true; };
  const stopEditingRequestStatus = () => { state.isRequestStatusBeingEdited = false; };

  return {
    view() {
      const { currentUser } = store.getState();
      const { request, createdBy, isRequestStatusBeingEdited } = state;

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
                div({ class: 'flex-row justify-content-center align-items-center' }, isRequestStatusBeingEdited ?
                  [
                    select({ class: 'br-md pa-sm', onchange: setRequestStatusToValue, value: request.status },
                      requestStatuses.map(RequestStatusOption)
                    ),
                    div({ class: 'pointer mr-n-md pa-md unselectable', onclick: stopEditingRequestStatus }, '✖️')
                  ]
                  :
                  [
                    m(RequestStatus, { status: request.status }),
                    div({ class: 'pointer mr-n-md pa-md unselectable', onclick: startEditingRequestStatus }, '✏️')
                  ]
                )
                :
                m(RequestStatus, { status: request.status })
            ]),
            div({ class: 'mb-md' }, request.text),
            createdBy ? Created(request, createdBy) : null
          ])
        ])
      );
    }
  };
};

const loadCreatedBy = async (state: State, id: string) => {
  try {
    state.createdBy = await UserServices.getProfile(id);
    redraw();
  }
  catch (error) {
    notify.error(error);
  }
};

const setRequestStatus = (state: State) => async (status: RequestStatusType) => {
  const { request } = state;
  const previousStatus = request.status;
  request.status = status;
  state.isRequestStatusBeingEdited = false;

  try {
    await RequestServices.setStatus(request.id, request.status);
  }
  catch (error) {
    request.status = previousStatus;
    state.isRequestStatusBeingEdited = true;
    redraw();

    notify.error(error);
  }
};

const RequestStatusOption = (status: RequestStatusType) => option({ value: status }, getStatusText(status));

const Created = (request: Request, createdBy: UserProfile) => (
  div({ class: 'flex-row align-items-center' }, [
    UserProfileImage({ class: 'width-xxs height-xxs mr-sm', profile: createdBy }),
    createdBy.name,
    div({ style: flex(1) }),
    Timeago(new Date(<number>request.created))
  ])
);
