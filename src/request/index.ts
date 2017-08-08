import * as firebase from 'firebase/app';

export interface Request {
  id: string;

  imageUrls: string[];
  title: string;
  text: string;
  geo: google.maps.LatLngLiteral;
  created: number | Object;
  createdBy: string;
  status: RequestStatus;
}

export type RequestStatus = 'new' | 'approved' | 'declined';
export const requestStatuses: RequestStatus[] = ['new', 'approved', 'declined'];

export const getRequest: (id: string) => Promise<Request> = async (id: string) => {
  const request = await firebase.database().ref(`requests/${id}`).once('value');
  if (!(request && request.exists())) return null;

  return { id: request.key, ...request.val() };
};

export const setRequestStatus = (id: string, status: RequestStatus) => firebase.database().ref(`requests/${id}/status`).set(status);

export const getStatusClass = (status: RequestStatus) => statusClass[status] || '';

const statusClass: Record<RequestStatus, string> = {
  new: 'color-foreground bg-neutral',
  approved: 'color-neutral-lighter bg-success',
  declined: 'color-neutral-lighter bg-danger'
};

export const getStatusText = (status: RequestStatus, count: string | number = 1) => {
  const text = statusText[status];
  if (typeof text === 'string') return text;
  if (!text) return '';

  const valueText = text[count] || text.else;
  if (valueText) return valueText;

  return '';
};

const statusText: Record<RequestStatus, I18nValue> = {
  new: { 1: 'нова', else: 'нови' },
  approved: { 1: 'одобрена', else: 'одобрени' },
  declined: { 1: 'отказана', else: 'отказани' }
};

type I18nValue = string | {
  [key: string]: string;
  else?: string;
};
