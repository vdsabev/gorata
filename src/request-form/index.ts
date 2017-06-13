import { div, form, fieldset, input, br, textarea, button } from 'compote/html';
import { flex } from 'compote/components/flex';
import { constant } from 'compote/components/utils';
import * as firebase from 'firebase/app';
import { redraw, route, withAttr } from 'mithril';

import { Request } from '../request';
import { store } from '../store';

let data: Data = { request: {} };
interface Data {
  request?: Partial<Request>;
  loading?: boolean;
}

const initializeData = () => data = { request: {} };
const returnFalse = constant(false);

const setRequestData = (propertyName: keyof typeof data.request) => (value: any) => data.request[propertyName] = value;
const setTitle = withAttr('value', setRequestData('title'));
const setText = withAttr('value', setRequestData('text'));

const createRequest = async () => {
  try {
    data.loading = true;

    const { currentUser, map } = store.getState();
    const newRequest: Partial<Request> = {
      ...data.request,
      geo: map.getCenter().toJSON(),
      created: firebase.database.ServerValue.TIMESTAMP,
      createdBy: currentUser.auth.uid
    };
    await firebase.database().ref('requests').push(newRequest);

    route.set('/');
  }
  catch (error) {
    window.alert(error);
    data.loading = false;
    redraw();
  }
};

// TODO: Use form data
// TODO: Add validation
export const RequestForm = () => (
  div({ className: 'flex-row justify-content-stretch align-items-stretch', oninit: initializeData }, [
    form({ className: 'form', style: flex(1), onsubmit: returnFalse },
      fieldset({ className: 'form-panel lg', disabled: data.loading }, [
        input({
          className: 'form-input',
          type: 'text', name: 'title', placeholder: 'Къде се намира мястото?', required: true,
          value: data.request.title, oninput: setTitle
        }),
        br(),
        br(),
        textarea({
          className: 'form-input',
          name: 'text', placeholder: 'От какво имате нужда?', rows: 15,
          value: data.request.text, oninput: setText
        }),
        br(),
        br(),
        button({ className: 'form-button', type: 'submit', onclick: createRequest }, 'Create')
      ])
    )
  ])
);
