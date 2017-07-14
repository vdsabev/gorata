import { div, img, h4, h5, select, option } from 'compote/html';
import { flex } from 'compote/components/flex';
import * as firebase from 'firebase/app';
import { redraw } from 'mithril';

import { Component, VNode, render } from '../component';
import { Request, RequestStatus, requestStatuses, getStatusClass, getStatusText } from '../request';
import { store, Actions } from '../store';
import { canModerate } from '../user';

export class RequestListItem implements Component {
  static render = render(RequestListItem);

  parent: {
    requestBeingEdited: Request;
  };
  request: Request;

  oninit({ attrs }: VNode<RequestListItem>) {
    this.parent = attrs.parent;
    this.request = attrs.request;
  }

  view() {
    const { currentUser } = store.getState();
    return (
      div({ class: 'request-list-item pa-md flex-row justify-content-center align-items-center fade-in-animation' }, [
        img({ class: 'width-md mr-sm br-md', src: this.request.imageUrls && this.request.imageUrls[0] || 'default.png' }),
        div({ style: flex(1) }, [
          h4(this.request.title),
          this.request.text
        ]),
        canModerate(currentUser) ?
          this.isRequestBeingEdited(this.parent.requestBeingEdited, this.request) ?
            select({
              class: 'br-md pa-sm',
              onchange: this.setRequestStatus,
              value: this.request.status
            }, requestStatuses.map((status) => (
              option({ value: status }, getStatusText(status))
            )))
            :
            div({
              class: `br-md pa-sm pointer ${getStatusClass(this.request.status)}`,
              onclick: () => this.setRequestBeingEdited(this.request)
            }, getStatusText(this.request.status))
          :
          div({ class: `br-md pa-sm ${getStatusClass(this.request.status)}` }, getStatusText(this.request.status))
      ])
    );
  }

  isRequestBeingEdited(requestBeingEdited: Request, request: Request) {
    return requestBeingEdited != null && request != null && requestBeingEdited.id === request.id;
  }

  setRequestStatus = async (e: Event) => {
    const previousStatus = this.request.status;
    this.request.status = <RequestStatus>(<HTMLSelectElement>e.currentTarget).value;
    this.setRequestBeingEdited(null);

    try {
      await firebase.database().ref(`requests/${this.request.id}/status`).set(this.request.status);
    }
    catch (error) {
      this.request.status = previousStatus;
      this.setRequestBeingEdited(this.request);

      window.alert(error.message);
    }
  }

  setRequestBeingEdited = (request: Request) => {
    this.parent.requestBeingEdited = request;
    redraw();
  }
}
