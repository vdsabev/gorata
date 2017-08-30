import './style.scss';
import '../assets/logo.png';

import { div, a, img, h1, svg, path, br } from 'compote/html';
import { AspectRatioContainer } from 'compote/components/aspect-ratio-container';
import { flex } from 'compote/components/flex';
import * as m from 'mithril';
import { route } from 'mithril';

import { Image } from '../image';
import { logout } from '../logout';
import { store } from '../store';
import { UserProfile, isLoggedIn, canAdmin } from '../user';

export const Header = {
  view() {
    const { currentUser } = store.getState();

    // Don't show the logged out state until the user is known to be either logged in or logged out
    return [
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
        isLoggedIn(currentUser) ? UserMenu(currentUser.profile) : LoginLink()
        :
        null
    ];
  }
};

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

const UserMenu = (profile: UserProfile) => profile != null ? (
  div({ class: 'flex-row align-items-center' }, [
    div({ class: 'text-right' }, [
      a({ class: 'color-neutral-lighter', oncreate: route.link, href: '/settings' }, profile.name),
      br(),
      a({ class: 'color-neutral-lighter', onclick: logout }, 'Изход')
    ]),
    AspectRatioContainer({ class: 'ml-md width-sm height-sm bg-neutral br-md', aspectRatio: { x: 1, y: 1 } },
      m(Image, { class: 'absolute stretch br-md', src: profile.imageUrl || 'default.png' })
    )
  ])
) : null;

const LoginLink = () => a({ class: 'color-neutral-lighter', oncreate: route.link, href: '/login' }, 'Вход');
