import { Properties } from 'compote/html';
import { AspectRatioContainer } from 'compote/components/aspect-ratio-container';
import * as m from 'mithril';

import { Image } from '../image';

interface Attrs extends Properties<HTMLDivElement> {
  src?: string;
}

export const UserProfileImage = ({ src, ...attrs }: Attrs) => (
  AspectRatioContainer({ aspectRatio: { x: 1, y: 1 }, ...attrs },
    m(Image, { class: 'absolute stretch bg-neutral-light br-md', src: src || 'default.png' })
  )
);
