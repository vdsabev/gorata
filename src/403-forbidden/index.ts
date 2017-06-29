import { div, h2, CustomProperties } from 'compote/html';

export const ForbiddenView = {
  view: () => (
    div({ class: 'container fade-in-animation' }, [
      h2('Грешка 403 - акаунтът Ви няма достъп до тази страница')
    ])
  )
};
