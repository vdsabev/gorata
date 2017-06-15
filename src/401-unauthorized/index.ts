import { div, h2, CustomProperties } from 'compote/html';

export const Unauthorized = (props?: CustomProperties) => (
  div({ className: 'container', ...props }, [
    div({ className: 'form' }, [
      h2('Грешка 401 - трябва да влезете с акаунта си, за да достъпите тази страница')
    ])
  ])
);
