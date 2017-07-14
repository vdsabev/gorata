import { div, h2 } from 'compote/html';

export const UnauthorizedView = {
  view: () => (
    div({ class: 'container fade-in-animation' }, [
      h2('Грешка 401 - трябва да влезете с акаунта си, за да достъпите тази страница')
    ])
  )
};
