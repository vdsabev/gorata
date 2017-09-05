import * as firebase from 'firebase/app';

import { RequestsFilter } from '../store';
import { Request, RequestStatus } from './index';

export const queryRef = (filter?: RequestsFilter) => {
  const requestsRef = filter && filter.value != null ?
    firebase.database().ref('requests').orderByChild(filter.key).equalTo(filter.value)
    :
    firebase.database().ref('requests')
  ;
  return requestsRef;
};

export const get: (id: string) => Promise<Request> = async (id: string) => {
  const request = await firebase.database().ref(`requests/${id}`).once('value');
  if (!(request && request.exists())) return null;

  return { id: request.key, ...request.val() };
};

export const create = (request: Request) => firebase.database().ref('requests').push(request);

export const update = (id: string, request: Request) => firebase.database().ref(`requests/${id}`).set(request);

export const setStatus = (id: string, status: RequestStatus) => firebase.database().ref(`requests/${id}/status`).set(status);
