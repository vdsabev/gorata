import { div, h2 } from 'compote/html';

export const Forbidden = {
  view: () => (
    div({ class: 'container fade-in-animation' }, [
      h2('Грешка 403 - акаунтът Ви няма достъп до тази страница')
    ])
  )
};
