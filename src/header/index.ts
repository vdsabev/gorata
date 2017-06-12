import './style.scss';

import { div, a, br, img, h1 } from 'compote/html';
import { flex } from 'compote/components/flex';
import * as firebase from 'firebase/app';
import { route } from 'mithril';

import { store } from '../store';
import { User, isLoggedIn, canModerate, canAdmin } from '../user';

// Header
export const Header = () => {
  const { currentUser } = store.getState();
  return [
    Logo(),
    isLoggedIn(currentUser) ?
      LoggedInHeader(currentUser)
      :
      LoggedOutHeader(currentUser)
  ];
};

// Logo
const Logo = () => (
  a({ oncreate: route.link, href: '/', id: 'logo', className: 'flex-row align-items-center' }, [
    img({ src: 'logo.png' }),
    h1('Гората')
  ])
);

// Logged in
const LoggedInHeader = (currentUser: User) => [
  canModerate(currentUser) ? div({ style: { 'margin-right': 'auto' } }, [
    a({ oncreate: route.link, href: '/requests/new' }, '+ Нова Заявка'),
    br(),
    canAdmin(currentUser) ?
      a({ target: '_blank', href: `https://console.firebase.google.com/project/${process.env.FIREBASE_PROJECT_ID}/database/data` }, '+ База Данни')
      :
      null
  ]) : null,
  div({ style: flex(1) }),
  div({ className: 'text-right' }, [
    div(currentUser.auth.email),
    a({ onclick: logout }, 'Logout')
  ])
];

export const logout = () => firebase.auth().signOut().catch(console.error).then(() => route.set('/'));

// Logged out
const LoggedOutHeader = (currentUser: User) => [
  div({ style: flex(1) }),
  a({ oncreate: route.link, href: '/login' }, 'Login')
];
