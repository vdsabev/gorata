import { img, Properties } from 'compote/html';
import { FactoryComponent, redraw } from 'mithril';

let options: State = {
  defaultSrc: 'default.png',
  errorSrc: 'error.png',
  style: {
    filter: 'brightness(80%)',
    transition: 'filter 0.4s ease-in-out'
  }
};

export const setImageOptions = (state: State) => {
  options = {
    ...options, ...state,
    style: { ...options.style, ...state.style }
  };
};

interface State extends Properties<HTMLImageElement> {
  defaultSrc?: string;
  errorSrc?: string;
}

export const Image: FactoryComponent<State> = ({ attrs: { defaultSrc, errorSrc, ...attrs } }) => {
  let imageElement: HTMLImageElement;
  let src = defaultSrc || options.defaultSrc;
  let style = { ...options.style, ...attrs.style };

  const mockImageElement = new (<any>window).Image();

  mockImageElement.onload = () => {
    src = attrs.src;
    imageElement.src = src;
    const { filter, ...omitFilter } = options.style;
    style = { ...omitFilter, ...attrs.style };
    redraw();
  };

  mockImageElement.onerror = () => {
    src = errorSrc || options.errorSrc;
    imageElement.src = src;
    const { filter, ...omitFilter } = options.style;
    style = { ...omitFilter, ...attrs.style };
    redraw();
  };

  mockImageElement.src = attrs.src; // Start loading the image

  return {
    oncreate({ dom }) {
      imageElement = <HTMLImageElement>dom;
    },
    view: () => (
      img({ ...attrs, src, style })
    )
  };
};
