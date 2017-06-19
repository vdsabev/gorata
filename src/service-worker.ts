// https://github.com/GoogleChrome/airhorn/blob/master/app/sw.js
// TODO: Replace `any` with specific type
// TODO: Figure out how to reliably invalidate the cache

// self.addEventListener('install', (event: any) => {
//   const timestamp = Date.now();
//   event.waitUntil(
//     caches.open('gorata').then((cache) => {
//       return cache.addAll([
//         `/`,
//         `/index.html?t=${timestamp}`,
//         `/app.js?t=${timestamp}`
//       ]).then(() => (<any>self).skipWaiting());
//     })
//   );
// });

// self.addEventListener('activate', (event: any) => {
//   event.waitUntil((<any>self).clients.claim());
// });

// self.addEventListener('fetch', (event: any) => {
//   event.respondWith(
//     caches.match(event.request, { ignoreSearch: true }).then((response) => response || fetch(event.request))
//   );
// });
