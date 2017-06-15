import { div, h2, CustomProperties } from 'compote/html';

export const NotFound = (props?: CustomProperties) => (
  div({ className: 'container', ...props }, [
    h2('Грешка 404 - страницата не беше намерена')
  ])
);
