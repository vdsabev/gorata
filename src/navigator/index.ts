import './style.scss';

import { div } from 'compote/html';
import { render } from 'mithril';

import * as notify from '../notify';

export const addNavigatorControl = (map: google.maps.Map) => {
  if (window.navigator && window.navigator.geolocation) {
    const container = document.createElement('div');
    render(container, Navigator(map));
    map.controls[google.maps.ControlPosition.RIGHT_TOP].push(container.firstElementChild);
  }
};

const Navigator = (map: google.maps.Map) => (
  div({
    class: 'navigator pointer br-md bg-neutral-lighter mr-md',
    title: 'Покажи моето местоположение',
    onclick: getUserLocation(map)
  }, [
    div({ class: 'navigator-dot br-50p' })
  ])
);

const userLocationZoomLevel = 18;

const getUserLocation = (map: google.maps.Map) => (e: MouseEvent) => {
  window.navigator.geolocation.getCurrentPosition(
    // Success
    (result) => {
      const location = new google.maps.LatLng(result.coords.latitude, result.coords.longitude);
      map.panTo(location);
      map.set('zoom', userLocationZoomLevel);
    },
    // Error
    (error) => {
      const errorMessage = getLocationError(error);
      if (errorMessage) {
        notify.error(errorMessage);
      }
    }
  );
};

const getLocationError = (error: PositionError) => {
  switch (error.code) {
  case error.POSITION_UNAVAILABLE:
    return 'Браузърът не успя да установи местоположението Ви';
  case error.TIMEOUT:
    return 'Търсенето на местоположението Ви отне прекалено дълго време';
  case error.PERMISSION_DENIED:
    return null;
  default:
    return 'Настъпи неочаквана грешка при търсенето на местоположението Ви';
  }
};
