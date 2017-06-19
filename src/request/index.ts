export interface Request {
  id: string;

  title: string;
  text: string;
  geo: google.maps.LatLngLiteral;
  created: number | Object;
  createdBy: string;
  status: RequestStatus;
}

type RequestStatus = 'new' | 'approved' | 'declined';

export const getStatusClass = (status: RequestStatus) => statusClass[status] || '';

const statusClass = {
  new: 'color-foreground bg-neutral',
  approved: 'color-neutral-lighter bg-success',
  declined: 'color-neutral-lighter bg-danger'
};

export const getStatusText = (status: RequestStatus) => statusText[status] || '';

const statusText = {
  new: 'нова',
  approved: 'одобрена',
  declined: 'отказана'
};
