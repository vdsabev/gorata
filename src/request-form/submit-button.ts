import { button } from 'compote/html';
import * as firebase from 'firebase/app';
import { route, redraw, FactoryComponent } from 'mithril';

import * as notify from '../notify';
import { Request, RequestServices } from '../request';
import { store } from '../store';

import { State } from './index';

export const SubmitButton: FactoryComponent<{ state: State }> = ({ attrs: { state } }) => {
  const createRequest = async () => {
    try {
      state.loading = true;

      if (!state.requestMarker) throw 'Моля, маркирайте мястото върху картата!';
      if (state.request.imageUrls.length === 0) throw 'Моля, качете поне една снимка!';
      if (!state.request.text) throw 'Моля, въведете описание на заявката!';

      const { currentUser } = store.getState();
      const newRequest: Request = {
        ...state.request,
        geo: state.requestMarker.getPosition().toJSON(),
        created: firebase.database.ServerValue.TIMESTAMP,
        createdBy: currentUser.auth.uid,
        status: 'new'
      };
      await RequestServices.create({}, newRequest);

      route.set('/');
    }
    catch (error) {
      state.loading = false;
      redraw();
      notify.error(error);
    }
  };

  return {
    view: () => button({ class: 'form-button', type: 'submit', onclick: createRequest }, 'Създаване')
  };
};
