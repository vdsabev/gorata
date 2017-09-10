import { Properties } from 'compote/html';
import { AspectRatioContainer } from 'compote/components/aspect-ratio-container';
import * as m from 'mithril';

import { Image } from '../image';
import { UserProfile } from '../user';

interface Attrs extends Properties<HTMLDivElement> {
  profile?: UserProfile;
}

export const UserProfileImage = ({ profile, ...attrs }: Attrs) => (
  AspectRatioContainer({ aspectRatio: { x: 1, y: 1 }, ...attrs },
    m(Image, {
      class: 'absolute stretch bg-neutral-light br-md',
      alt: profile && profile.name || '',
      src: profile && profile.imageUrl || 'default.png'
    })
  )
);
