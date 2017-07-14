import { div, h2 } from 'compote/html';

export const NotFound = {
  view: () => (
    div({ class: 'container fade-in-animation' }, [
      h2('Грешка 404 - страницата не беше намерена')
    ])
  )
};
