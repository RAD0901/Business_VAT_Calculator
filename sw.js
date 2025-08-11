// Service Worker for VAT Calculator Pro
const CACHE_NAME = 'vat-calculator-v1.0.0';
const STATIC_CACHE_NAME = 'vat-calculator-static-v1.0.0';
const DYNAMIC_CACHE_NAME = 'vat-calculator-dynamic-v1.0.0';

// Files to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/assets/css/main.css',
  '/assets/css/components.css',
  '/assets/css/responsive.css',
  '/assets/js/app.js',
  '/assets/js/vat-engine.js',
  '/assets/js/file-processor.js',
  '/assets/js/ui-components.js',
  '/assets/js/error-handler.js',
  '/assets/js/performance-manager.js',
  '/assets/js/analytics-manager.js',
  '/assets/js/accessibility-manager.js',
  '/assets/js/seo-manager.js',
  '/assets/js/security-manager.js',
  '/manifest.json',
  '/assets/icons/icon-192x192.png',
  '/assets/icons/icon-512x512.png'
];

// Files to cache on demand
const DYNAMIC_ASSETS = [
  '/assets/images/',
  '/assets/fonts/',
  'https://fonts.googleapis.com/',
  'https://fonts.gstatic.com/'
];

// Network-first resources
const NETWORK_FIRST = [
  'https://www.google-analytics.com/',
  'https://www.googletagmanager.com/',
  '/api/'
];

// Install event - cache static assets
self.addEventListener('install', event => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then(cache => {
        console.log('Caching static assets...');
        return cache.addAll(STATIC_ASSETS);
      })
      .catch(error => {
        console.error('Failed to cache static assets:', error);
      })
  );
  
  // Skip waiting to activate immediately
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(cacheName => {
            return cacheName !== STATIC_CACHE_NAME && 
                   cacheName !== DYNAMIC_CACHE_NAME &&
                   cacheName.startsWith('vat-calculator-');
          })
          .map(cacheName => {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          })
      );
    })
  );
  
  // Take control of all clients
  self.clients.claim();
});

// Fetch event - serve cached content and implement caching strategies
self.addEventListener('fetch', event => {
  const requestUrl = new URL(event.request.url);
  
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }
  
  // Skip chrome-extension requests
  if (requestUrl.protocol === 'chrome-extension:') {
    return;
  }
  
  // Handle different caching strategies
  if (isStaticAsset(event.request.url)) {
    event.respondWith(cacheFirstStrategy(event.request));
  } else if (isNetworkFirst(event.request.url)) {
    event.respondWith(networkFirstStrategy(event.request));
  } else if (isDynamicAsset(event.request.url)) {
    event.respondWith(staleWhileRevalidateStrategy(event.request));
  } else {
    event.respondWith(networkWithCacheFallbackStrategy(event.request));
  }
});

// Caching Strategies

// Cache First - for static assets that don't change
function cacheFirstStrategy(request) {
  return caches.match(request)
    .then(response => {
      if (response) {
        return response;
      }
      
      return fetch(request)
        .then(fetchResponse => {
          // Don't cache if not a valid response
          if (!fetchResponse || fetchResponse.status !== 200 || fetchResponse.type !== 'basic') {
            return fetchResponse;
          }
          
          const responseToCache = fetchResponse.clone();
          caches.open(STATIC_CACHE_NAME)
            .then(cache => {
              cache.put(request, responseToCache);
            });
          
          return fetchResponse;
        });
    });
}

// Network First - for dynamic content and analytics
function networkFirstStrategy(request) {
  return fetch(request)
    .then(response => {
      // If network succeeds, cache and return
      if (response && response.status === 200) {
        const responseToCache = response.clone();
        caches.open(DYNAMIC_CACHE_NAME)
          .then(cache => {
            cache.put(request, responseToCache);
          });
      }
      return response;
    })
    .catch(() => {
      // If network fails, try cache
      return caches.match(request);
    });
}

// Stale While Revalidate - for frequently updated content
function staleWhileRevalidateStrategy(request) {
  return caches.match(request)
    .then(cachedResponse => {
      const fetchPromise = fetch(request)
        .then(networkResponse => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(DYNAMIC_CACHE_NAME)
              .then(cache => {
                cache.put(request, responseToCache);
              });
          }
          return networkResponse;
        });
      
      // Return cached version immediately, update cache in background
      return cachedResponse || fetchPromise;
    });
}

// Network with Cache Fallback - default strategy
function networkWithCacheFallbackStrategy(request) {
  return fetch(request)
    .then(response => {
      if (response && response.status === 200) {
        const responseToCache = response.clone();
        caches.open(DYNAMIC_CACHE_NAME)
          .then(cache => {
            cache.put(request, responseToCache);
          });
      }
      return response;
    })
    .catch(() => {
      return caches.match(request);
    });
}

// Helper Functions
function isStaticAsset(url) {
  return STATIC_ASSETS.some(asset => url.includes(asset)) ||
         url.includes('/assets/css/') ||
         url.includes('/assets/js/') ||
         url.includes('/assets/icons/');
}

function isNetworkFirst(url) {
  return NETWORK_FIRST.some(pattern => url.includes(pattern));
}

function isDynamicAsset(url) {
  return DYNAMIC_ASSETS.some(pattern => url.includes(pattern));
}

// Background Sync for offline functionality
self.addEventListener('sync', event => {
  console.log('Background sync triggered:', event.tag);
  
  if (event.tag === 'background-file-processing') {
    event.waitUntil(processOfflineFiles());
  }
});

async function processOfflineFiles() {
  try {
    // Get offline processing queue
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    const offlineData = await cache.match('/offline-queue');
    
    if (offlineData) {
      const queue = await offlineData.json();
      
      // Process each queued file
      for (const item of queue) {
        try {
          await processFileOffline(item);
        } catch (error) {
          console.error('Failed to process offline file:', error);
        }
      }
      
      // Clear the queue
      await cache.delete('/offline-queue');
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Push notifications for processing completion
self.addEventListener('push', event => {
  console.log('Push notification received:', event);
  
  const options = {
    body: 'Your VAT calculation is complete!',
    icon: '/assets/icons/icon-192x192.png',
    badge: '/assets/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 'vat-calculation-complete'
    },
    actions: [
      {
        action: 'view-results',
        title: 'View Results',
        icon: '/assets/icons/action-view.png'
      },
      {
        action: 'download-pdf',
        title: 'Download PDF',
        icon: '/assets/icons/action-download.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('VAT Calculator Pro', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  console.log('Notification clicked:', event);
  
  event.notification.close();
  
  if (event.action === 'view-results') {
    event.waitUntil(
      clients.openWindow('/#results')
    );
  } else if (event.action === 'download-pdf') {
    event.waitUntil(
      clients.openWindow('/#results?download=pdf')
    );
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Handle message from main thread
self.addEventListener('message', event => {
  console.log('Message received in SW:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_FILE') {
    event.waitUntil(
      cacheFile(event.data.url, event.data.data)
    );
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({
      type: 'VERSION',
      version: CACHE_NAME
    });
  }
});

async function cacheFile(url, data) {
  try {
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    const response = new Response(JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    await cache.put(url, response);
    console.log('File cached successfully:', url);
  } catch (error) {
    console.error('Failed to cache file:', error);
  }
}

// Periodic background sync for updates
self.addEventListener('periodicsync', event => {
  if (event.tag === 'update-check') {
    event.waitUntil(checkForUpdates());
  }
});

async function checkForUpdates() {
  try {
    const response = await fetch('/version.json');
    const { version } = await response.json();
    
    if (version !== CACHE_NAME) {
      // New version available
      const clients = await self.clients.matchAll();
      clients.forEach(client => {
        client.postMessage({
          type: 'UPDATE_AVAILABLE',
          version: version
        });
      });
    }
  } catch (error) {
    console.error('Update check failed:', error);
  }
}

// Handle installation prompt
self.addEventListener('beforeinstallprompt', event => {
  // Prevent Chrome 67 and earlier from automatically showing the prompt
  event.preventDefault();
  
  // Stash the event so it can be triggered later
  self.deferredPrompt = event;
  
  // Notify the main thread
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({
        type: 'INSTALL_AVAILABLE'
      });
    });
  });
});

// Error handling
self.addEventListener('error', event => {
  console.error('Service Worker error:', event.error);
});

self.addEventListener('unhandledrejection', event => {
  console.error('Service Worker unhandled rejection:', event.reason);
});

console.log('Service Worker registered successfully');
