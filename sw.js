// Работа без интернета: свои файлы — сначала из сети (свежая версия), при отсутствии сети — из кэша.
// Шрифты и библиотека порядка черт — из кэша, если уже скачаны.
const CACHE = 'kitayskiy-1.4.0';
const V = '?v=1.4.0';
const FILES = ['./', 'index.html', 'manifest.webmanifest', 'icon-512.png'].concat(
  ['data_base','data_more','course_data','course_data2','course_data3','core','lang','course','story_data','mascot','game','map','games','slang_data','slang','theme','tab_home','tab_sounds','tab_words','tab_talk','tab_read','tab_rules','tab_stats','main'].map(f => 'js/' + f + '.js' + V));
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('kitayskiy-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin === location.origin) {
    e.respondWith(fetch(req).then(r => { const cp = r.clone(); caches.open(CACHE).then(c => c.put(req, cp)); return r; })
      .catch(() => caches.match(req, {ignoreSearch: false}).then(r => r || caches.match('index.html'))));
  } else if (/fonts\.(googleapis|gstatic)\.com|cdn\.jsdelivr\.net/.test(url.host)) {
    e.respondWith(caches.match(req).then(r => r || fetch(req).then(n => { const cp = n.clone(); caches.open(CACHE).then(c => c.put(req, cp)); return n; })));
  }
});
