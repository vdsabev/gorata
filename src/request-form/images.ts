import { div, img, h1, input } from 'compote/html';
import { AspectRatioContainer } from 'compote/components/aspect-ratio-container';
import * as m from 'mithril';
import { redraw, Children, FactoryComponent } from 'mithril';
import * as firebase from 'firebase/app';

import * as notify from '../notify';
import { guid, toArray } from '../utils';

export const Images = (imageUrls: string[]) => (
  div({ class: 'request-form-images-container' }, [
    imageUrls.map((imageUrl) => m(UploadedImage, { imageUrls, imageUrl })),
    m(UploadNewImage, { imageUrls })
  ])
);

const ImageContainer = (content: Children) => (
  AspectRatioContainer({
    class: 'request-form-image-container mb-md br-md bg-neutral-light fade-animation',
    aspectRatio: { x: 4, y: 3 }
  }, content)
);

const UploadedImage: FactoryComponent<{ imageUrls: string[], imageUrl: string }> = ({ attrs: { imageUrls, imageUrl } }) => {
  const removeImage = async (e: MouseEvent) => {
    const indexOfImageUrl = imageUrls.indexOf(imageUrl);
    if (indexOfImageUrl === -1) return;

    imageUrls.splice(indexOfImageUrl, 1);

    try {
      await firebase.storage().refFromURL(imageUrl).delete();
    }
    catch (error) {
      imageUrls.splice(indexOfImageUrl, 0, imageUrl);
      redraw();
      notify.error(error);
    }
  };

  return {
    view: () => (
      ImageContainer([
        img({ class: 'absolute stretch', src: imageUrl }),
        div({ class: 'request-form-remove br-50p pointer', onclick: removeImage }, '✖')
      ])
    )
  };
};

const UploadNewImage: FactoryComponent<{ imageUrls: string[] }> = ({ attrs: { imageUrls } }) => {
  let uploading: boolean;

  const uploadImages = async (e: Event) => {
    const files = toArray<File>((<HTMLInputElement>e.currentTarget).files);
    if (!files.length) return;

    uploading = true;

    try {
      await Promise.all(files.map(uploadImage));
      uploading = false;
      redraw();
    }
    catch (error) {
      uploading = false;
      redraw();
      notify.error(error);
    }
  };

  const uploadImage = (file: File) => new Promise(async (resolve, reject) => {
    try {
      const uploadTaskSnapshot = await firebase.storage().ref().child(`tmp/${guid()}`).put(file);

      // Only redraw after the image is loaded
      const image = document.createElement('img');
      image.src = uploadTaskSnapshot.downloadURL;
      image.onload = () => {
        imageUrls.push(uploadTaskSnapshot.downloadURL);
        redraw();
        resolve();
      };
    }
    catch (error) {
      reject(error);
    }
  });

  return {
    view: () => (
      ImageContainer([
        div({ class: 'absolute stretch flex-row justify-content-center align-items-center fade-in-animation' }, [
          uploading ?
            div({ class: 'request-form-uploading br-50p spin-right-animation' })
            :
            h1({ class: 'request-form-upload-text color-neutral-lighter' }, '+')
        ]),
        input({
          class: 'request-form-upload-input absolute stretch pointer',
          type: 'file', name: 'imageUrls[]', accept: 'image/*', onchange: uploadImages,
          multiple: true,
          title: 'Качете снимка'
        })
      ])
    )
  };
};
