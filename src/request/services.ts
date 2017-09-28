import { Request, RequestStatus } from './index';

import { FirebaseServices } from '../firebase';

export const RequestServices = {
  get: FirebaseServices.get<Request>(
    ({ requestId }) => `requests/${requestId}`,
    (id, value) => ({ ...value, id })
  ),

  create: FirebaseServices.push<Request>(() => `requests`),

  update: FirebaseServices.set<Request>(({ requestId }) => `requests/${requestId}`),

  setStatus: FirebaseServices.set<RequestStatus>(({ requestId }) => `requests/${requestId}/status`)
};
