import { div, form, fieldset, h2, input, br, button } from 'compote/html';
import { Keyboard } from 'compote/components/keyboard';
import { constant, get, set, when, equal } from 'compote/components/utils';
import { redraw, withAttr, FactoryComponent } from 'mithril';

import * as notify from '../notify';
import { Actions, store } from '../store';
import { UserProfile, UserServices } from '../user';

interface State {
  profile: Partial<UserProfile>;
  loading?: boolean;
}

// TODO: Use form data
// TODO: Add validation
export const Settings: FactoryComponent<State> = () => {
  const state: State = { profile: {} };

  const setName = withAttr('value', set<Partial<UserProfile>>('name')(state.profile));
  const save = createSaveFunction(state);
  const saveOnEnter = when(equal(get<KeyboardEvent>('keyCode'), Keyboard.ENTER), save);

  return {
    view() {
      const { currentUser } = store.getState();
      const { profile } = state;

      // Initialize with current user profile
      if (!profile.name && currentUser.profile) {
        profile.name = currentUser.profile.name;
      }

      return (
        div({ class: 'container fade-in-animation' }, [
          form({ class: 'form', onsubmit: returnFalse },
            fieldset({ class: 'form-panel', disabled: state.loading === true }, [
              h2('Настройки'),
              input({
                class: 'form-input',
                type: 'text', name: 'name', placeholder: 'Име', autofocus: true, required: true,
                onkeyup: saveOnEnter, oninput: setName,
                value: profile.name
              }),
              br(),
              button({ class: 'form-button', type: 'submit', onclick: save }, 'Запазване')
            ])
          )
        ])
      );
    }
  };
};

const returnFalse = constant(false);

const createSaveFunction = (state: State) => async () => {
  try {
    state.loading = true;
    const { currentUser } = store.getState();
    await UserServices.setName({ userId: currentUser.auth.uid }, state.profile.name);
    store.dispatch({ type: Actions.USER_PROFILE_LOADED, profile: { ...currentUser.profile, ...state.profile } });
  }
  catch (error) {
    notify.error(error);
  }

  state.loading = false;
  redraw();
};
