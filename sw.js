/* sw.js —— Service Worker 基础离线缓存
 * 策略：安装时预缓存 app shell；离线时 fallback 到 offline.html
 */
const CACHE_APP = 'lang-tutor-app-v2';

const APP_SHELL = [
  './',
  './index.html',
  './app.css',
  './manifest.webmanifest',
  './offline.html',
  './data/vocab-data.js',
  './js/app.js',
  './js/home.js',
  './js/vocab.js',
  './js/conversation.js',
  './js/grammar.js',
  './js/profile.js',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_APP).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_APP)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  // 导航请求：网络优先，失败则回退到缓存的 index，再失败回退到 offline.html
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match('./index.html').then((cached) => cached || caches.match('./offline.html'))
      )
    );
    return;
  }

  // 静态资源：缓存优先，回源更新
  event.respondWith(
    caches.match(request).then((cached) => {
      const fetchPromise = fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_APP).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => cached);
      return cached || fetchPromise;
    })
  );
});
