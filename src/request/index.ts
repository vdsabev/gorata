export interface Request {
  id: string;

  title: string;
  text: string;
  geo: {
    lat: number,
    lng: number
  };
  created: number;
  createdBy: string;
}
