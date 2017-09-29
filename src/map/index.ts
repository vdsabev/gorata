import { store, Actions } from '../store';
import { loadScript } from '../utils';

export const mapLoaded = new Promise(async (resolve, reject) => {
  try {
    await loadScript(`https://maps.googleapis.com/maps/api/js?key=${process.env.GOOGLE_API_KEY}&language=bg&region=BG&libraries=places`);

    const map = document.querySelector('#map');
    map.classList.add('loaded');
    store.dispatch({ type: Actions.MAP_LOADED, element: map });

    resolve();
  }
  catch (error) {
    reject(error);
  }
});
