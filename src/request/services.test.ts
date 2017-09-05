import 'jest';

import * as RequestServices from './services';
import { initializeFirebaseApp } from '../firebase';

const env = require('var');

initializeFirebaseApp({
  apiKey: env.GOOGLE_API_KEY,
  authDomain: env.FIREBASE_AUTH_DOMAIN,
  databaseURL: env.FIREBASE_DATABASE_URL,
  projectId: env.FIREBASE_PROJECT_ID,
  storageBucket: env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.FIREBASE_MESSAGING_SENDER_ID
});

const permissionDeniedError = 'PERMISSION_DENIED: Permission denied';

// TODO: Simulate database requests instead of changing real data
// TODO: Test authenticated requests that require moderator / admin permissions
describe(`RequestServices`, () => {
  describe(`get`, () => {
    it(`should return request`, async () => {
      expect.assertions(1);
      const a = await RequestServices.get('a');
      expect(a).toHaveProperty('id', 'a');
    });
  });

  describe(`create`, () => {
    it(`should deny creating without credentials`, async () => {
      expect.assertions(1);
      try {
        await RequestServices.create(<any>{});
      }
      catch (error) {
        expect(error.message).toBe(permissionDeniedError);
      }
    });
  });

  describe(`update`, () => {
    it(`should deny updating without credentials`, async () => {
      expect.assertions(1);
      try {
        await RequestServices.update('a', <any>{});
      }
      catch (error) {
        expect(error.message).toBe(permissionDeniedError);
      }
    });
  });

  describe(`setStatus`, () => {
    it(`should deny updating without credentials`, async () => {
      expect.assertions(1);
      try {
        await RequestServices.setStatus('a', 'new');
      }
      catch (error) {
        expect(error.message).toBe(permissionDeniedError);
      }
    });
  });
});
