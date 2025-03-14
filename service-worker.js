// 緩存版本，當需要更新緩存時，更改此版本號
const CACHE_VERSION = 'v1';
const CACHE_NAME = `travel-planner-cache-${CACHE_VERSION}`;

// 需要緩存的資源列表
const CACHE_URLS = [
  '/',
  '/index.html',
  '/app.js',
  '/styles.css',
  '/favicon.ico',
  'https://unpkg.com/leaflet@1.7.1/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.7.1/dist/leaflet.js',
  'https://cdn.jsdelivr.net/npm/chart.js',
  'https://unpkg.com/leaflet-routing-machine@latest/dist/leaflet-routing-machine.js',
  'https://unpkg.com/leaflet-routing-machine@latest/dist/leaflet-routing-machine.css'
];

// 安裝事件 - 緩存初始資源
self.addEventListener('install', event => {
  console.log('[Service Worker] 安裝中...');
  
  // 跳過等待，直接激活
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] 緩存資源中...');
        return cache.addAll(CACHE_URLS);
      })
      .then(() => {
        console.log('[Service Worker] 所有資源已緩存');
      })
      .catch(error => {
        console.error('[Service Worker] 緩存失敗:', error);
      })
  );
});

// 激活事件 - 清理舊緩存
self.addEventListener('activate', event => {
  console.log('[Service Worker] 激活中...');
  
  // 立即控制所有頁面
  event.waitUntil(self.clients.claim());
  
  // 清理舊版本的緩存
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME) {
              console.log('[Service Worker] 刪除舊緩存:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
  );
});

// 攔截請求事件
self.addEventListener('fetch', event => {
  // 針對API請求和地圖瓦片，使用網絡優先策略
  if (event.request.url.includes('api.') || 
      event.request.url.includes('tile.openstreetmap.org')) {
    
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          console.log('[Service Worker] 網絡請求失敗，嘗試從緩存讀取:', event.request.url);
          return caches.match(event.request);
        })
    );
  } 
  // 對於其他資源，使用緩存優先策略
  else {
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          if (response) {
            console.log('[Service Worker] 從緩存返回:', event.request.url);
            return response;
          }
          
          console.log('[Service Worker] 緩存未找到，從網絡獲取:', event.request.url);
          
          // 如果緩存中沒有，則從網絡獲取並緩存
          return fetch(event.request)
            .then(networkResponse => {
              // 需要克隆響應，因為響應流只能被使用一次
              if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
                caches.open(CACHE_NAME)
                  .then(cache => {
                    console.log('[Service Worker] 緩存新資源:', event.request.url);
                    cache.put(event.request, networkResponse.clone());
                  });
              }
              
              return networkResponse;
            })
            .catch(error => {
              console.error('[Service Worker] 獲取失敗:', error);
              // 如果是HTML頁面請求且失敗，返回離線頁面
              if (event.request.headers.get('accept').includes('text/html')) {
                return caches.match('/');
              }
              
              return null;
            });
        })
    );
  }
});

// 監聽來自頁面的消息
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
}); 