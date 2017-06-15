import { div, h2, CustomProperties } from 'compote/html';

export const Forbidden = (props?: CustomProperties) => (
  div({ className: 'container', ...props }, [
    div({ className: 'form' }, [
      h2('Грешка 403 - акаунтът Ви няма достъп до тази страница')
    ])
  ])
);
