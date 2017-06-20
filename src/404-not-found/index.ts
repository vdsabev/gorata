import { div, h2, CustomProperties } from 'compote/html';

export const NotFoundView = {
  view: () => (
    div({ className: 'container' }, [
      h2('Грешка 404 - страницата не беше намерена')
    ])
  )
};
