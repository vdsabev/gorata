import { button } from 'compote/html';
import * as firebase from 'firebase/app';
import { route, redraw, FactoryComponent } from 'mithril';

import { Request } from '../request';
import { store } from '../store';

import { State } from './index';

export const SubmitButton: FactoryComponent<{ state: State }> = ({ attrs: { state } }) => {
  return {
    view: () => button({ class: 'form-button', type: 'submit', onclick: createRequest }, 'Създаване')
  };

  async function createRequest() {
    try {
      state.loading = true;

      if (!state.requestMarker) throw 'Моля, маркирайте мястото върху картата!';
      if (state.request.imageUrls.length === 0) throw 'Моля, качете поне една снимка!';

      const { currentUser } = store.getState();
      const newRequest: Request = {
        ...state.request,
        geo: state.requestMarker.getPosition().toJSON(),
        created: firebase.database.ServerValue.TIMESTAMP,
        createdBy: currentUser.auth.uid,
        status: 'new'
      };
      await firebase.database().ref('requests').push(newRequest);

      route.set('/');
    }
    catch (error) {
      state.loading = false;
      redraw();
      window.alert(error.message);
    }
  }
};
