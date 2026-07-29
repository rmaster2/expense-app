/* 오프라인에서도 화면이 열리게 해주는 파일입니다.
   아래 CACHE 값은 config.js 의 version 과 똑같이 맞춰 주십시오.
   (예: version 이 '0.9.3' 이면 아래도 'expense-0.9.3')
   그래야 휴대폰이 옛날 화면을 계속 보여주지 않고, 두 값이 어긋날 일도 없습니다. */

const CACHE = 'expense-0.9.4';
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
