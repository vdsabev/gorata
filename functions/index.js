const firebase = require('firebase-admin');
const functions = require('firebase-functions');
const path = require('path');
const gcs = require('@google-cloud/storage');
const url = require('url');
const uuidv4 = require('uuid/v4');
const env = require('var');

firebase.initializeApp(functions.config().firebase);

const storage = gcs({ projectId: env.FIREBASE_PROJECT_ID });
const bucket = storage.bucket(env.FIREBASE_STORAGE_BUCKET);

exports.moveImages = functions.database.ref('/requests/{requestId}/createdBy').onWrite((event) => {
  const userId = event.data.val();

  return new Promise((resolve, reject) => {
    event.data.ref.parent.child('imageUrls').once('value').catch(reject).then((imageUrlsSnapshot) => {
      const imageUrls = imageUrlsSnapshot.val();
      if (!imageUrls) resolve();

      Promise.all(
        imageUrls.map((imageUrl, index) => new Promise((resolve, reject) => {
          const imageUuid = url.parse(imageUrl).pathname.match(/.+tmp%2F([\w-]+)/)[1];
          const imagePath = `tmp/${imageUuid}`;
          const newImagePath = `users/${userId}/${uuidv4()}`;

          // https://stackoverflow.com/questions/42956250/get-download-url-from-file-uploaded-with-cloud-functions-for-firebase
          bucket.file(imagePath).move(newImagePath).catch(reject).then(() => {
            // https://cloud.google.com/storage/docs/collaboration#browser
            const newImageUrl = `${env.FIREBASE_STORAGE_URL}/${env.FIREBASE_STORAGE_BUCKET}/o/${encodeURIComponent(newImagePath)}?alt=media`;
            event.data.ref.parent.child(`imageUrls/${index}`).set(newImageUrl).catch(reject).then(resolve);
          });
        }))
      ).catch(reject).then(resolve);
    });
  });
});
