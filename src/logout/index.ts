import * as firebase from 'firebase/app';
import { redraw } from 'mithril';

import * as notify from '../notify';

export const logout = () => firebase.auth().signOut().catch(notify.error).then(redraw);
