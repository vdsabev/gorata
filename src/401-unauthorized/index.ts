import { div, h2 } from 'compote/html';
import { setAnimation } from 'compote/css';

export const Unauthorized = () => (
  div({
    className: 'container fade-in-animation',
    onbeforeremove: setAnimation('fade-out-animation')
  }, [
    div({ className: 'form' }, [
      h2('Грешка 401 - трябва да влезете с акаунта си, за да достъпите тази страница')
    ])
  ])
);
