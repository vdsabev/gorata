import { div, h2, CustomProperties } from 'compote/html';

export const ForbiddenView = {
  view: () => (
    div({ className: 'container' }, [
      h2('Грешка 403 - акаунтът Ви няма достъп до тази страница')
    ])
  )
};
