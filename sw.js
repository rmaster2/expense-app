/* 오프라인에서도 화면이 열리게 해주는 파일입니다.
   프로그램을 고쳐서 올릴 때마다 아래 CACHE 뒤의 숫자를 하나씩 올려 주십시오.
   그래야 휴대폰이 옛날 화면을 계속 보여주지 않습니다.            */

const CACHE = 'expense-v6';
const FILES = ['./', './index.html', './config.js', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).catch(() => {}));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* 인터넷이 되면 항상 최신 파일을 가져오고,
   안 되면 저장해 둔 파일로 화면을 엽니다. */
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;

  e.respondWith(
    fetch(req)
      .then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(req).then(hit => hit || caches.match('./index.html')))
  );
});
