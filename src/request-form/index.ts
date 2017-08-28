import '../assets/map_marker_new.svg';
import './style.scss';

import { div, form, fieldset, br } from 'compote/html';
import { flex } from 'compote/components/flex';
import { constant } from 'compote/components/utils';
import * as m from 'mithril';
import { FactoryComponent } from 'mithril';

import { Request } from '../request';

import { AddressInput } from './address-input';
import { Images } from './images';
import { TextInput } from './text-input';
import { SubmitButton } from './submit-button';

export interface State {
  request: Request;
  requestMarker: google.maps.Marker;
  addressSuggestion: string;
  loading: boolean;
}

// TODO: Use form data
// TODO: Add validation
export const RequestForm: FactoryComponent<State> = () => {
  const state = <State>{
    request: <Request>{ imageUrls: [] }
  };

  return {
    view: () => (
      div({ class: 'flex-row justify-content-stretch align-items-stretch container fade-in-animation' }, [
        form({ class: 'form', style: flex(1), onsubmit: returnFalse },
          fieldset({ class: 'form-panel lg', disabled: state.loading === true }, [
            Images(state.request.imageUrls),
            m(AddressInput, { state }),
            br(), br(),
            m(TextInput, { request: state.request}),
            br(), br(),
            m(SubmitButton, { state })
          ])
        )
      ])
    )
  };
};

const returnFalse = constant(false);
