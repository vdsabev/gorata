import './style.scss';
import '../assets/logo.png';

import { div, a, br, img, h1, svg, path } from 'compote/html';
import { flex } from 'compote/components/flex';
import * as firebase from 'firebase/app';
import { route } from 'mithril';

import { store } from '../store';
import { User, isLoggedIn, canModerate, canAdmin } from '../user';

export const HeaderView = {
  view() {
    const { currentUser } = store.getState();
    return Header(currentUser);
  }
};

// Don't show the logged out state until the user is known to be either logged in or logged out
const Header = (currentUser: User) => [
  div({ class: 'flex-row align-items-center', style: flex(1) }, [
    MenuIcon(),
    Logo(),
    a({ class: 'menu-link br-md pa-md', oncreate: route.link, href: '/' }, 'Заявки'),
    isLoggedIn(currentUser) ?
      a({ class: 'menu-link br-md pa-md', oncreate: route.link, href: '/requests/new' }, 'Нова Заявка')
      :
      null,
    canAdmin(currentUser) ?
      a({ class: 'menu-link br-md pa-md hidden-xxs hidden-xs', target: '_blank', rel: 'noopener', href: `https://console.firebase.google.com/project/${process.env.FIREBASE_PROJECT_ID}/database/data` }, 'База Данни')
      :
      null
  ]),
  currentUser != null ?
    div({ class: 'text-right' }, isLoggedIn(currentUser) ? UserMenu(currentUser) : LoginLink())
    :
    null
];

const MenuIcon = () => (
  svg(<any>{ // TODO: Type
    class: 'menu-icon mr-md br-md pa-md pointer hidden-sm hidden-md hidden-lg hidden-xl hidden-xxl',
    viewBox: '0 0 32 32',
    onclick: toggleContent
  }, [
    path({
      d: `
        M4,10h24c1.104,0,2-0.896,2-2s-0.896-2-2-2H4C2.896,6,2,6.896,2,8S2.896,10,4,10z M28,14H4c-1.104,0-2,0.896-2,2
        s0.896,2,2,2h24c1.104,0,2-0.896,2-2S29.104,14,28,14z M28,22H4c-1.104,0-2,0.896-2,2s0.896,2,2,2h24c1.104,0,2-0.896,2-2  S29.104,22,28,22z
      `
    })
  ])
);

const toggleContent = (e: MouseEvent) => {
  (<HTMLElement>e.currentTarget).classList.toggle('active');
  const content = document.querySelector('#content');
  content.classList.toggle('collapsed');
};

const Logo = () => (
  div({ id: 'logo', class: 'mr-md hidden-xxs hidden-xs flex-row align-items-center' }, [
    img({ class: 'pa-sm', src: 'logo.png', alt: 'Лого' }),
    h1({ class: 'hidden-sm' }, 'Гората')
  ])
);

const UserMenu = (currentUser: User) => [
  div({ class: 'hidden-xxs' }, currentUser.auth.email),
  a({ class: 'color-neutral-lighter', onclick: logout }, 'Изход')
];

const logout = () => firebase.auth().signOut().catch(window.alert).then(() => route.set('/'));

const LoginLink = () => a({ class: 'color-neutral-lighter', oncreate: route.link, href: '/login' }, 'Вход');
