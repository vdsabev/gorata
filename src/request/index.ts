export interface Request {
  id: string;

  title: string;
  text: string;
  geo: google.maps.LatLngLiteral;
  created: number | Object;
  createdBy: string;
}
