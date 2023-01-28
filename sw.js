const version = '1.0.0'
const cacheId = 'sw_cache_' + version
const toCache = [
  '/index.html',
  '/css/chesstr.css',
  '/css/chessboard-1.0.0.min.css',
  '/img/chesspieces/wikipedia/bB.png',
  '/img/chesspieces/wikipedia/bK.png',
  '/img/chesspieces/wikipedia/bN.png',
  '/img/chesspieces/wikipedia/bP.png',
  '/img/chesspieces/wikipedia/bQ.png',
  '/img/chesspieces/wikipedia/bR.png',
  '/img/chesspieces/wikipedia/wB.png',
  '/img/chesspieces/wikipedia/wK.png',
  '/img/chesspieces/wikipedia/wN.png',
  '/img/chesspieces/wikipedia/wP.png',
  '/img/chesspieces/wikipedia/wQ.png',
  '/img/chesspieces/wikipedia/wR.png',
  '/js/chess-1.0.0-alpha.0.min.js',
  '/js/chessboard-1.0.0.min.js',
  '/js/chesstr.js',
  '/js/jquery-3.6.2.min.js',
]

// on install, cache assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(cacheId).then((cache) => {
      cache.addAll(toCache)
    })
  )
})

// on version update, remove old cached files
self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => key !== cacheId).map((key) => caches.delete(key))
        )
      )
  )
})

// on fetch event, serve from cache
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches
      .match(event.request)
      .then((response) => response || fetch(event.request))
  )
})
