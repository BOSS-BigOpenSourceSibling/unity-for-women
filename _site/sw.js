const version = '20241024223212';
const cacheName = `static::${version}`;

const buildContentBlob = () => {
  return ["/unity-for-women/2024/01/05/Desenvolvendo-N%C3%ADvel.html","/unity-for-women/2024/01/04/InimigosUI.html","/unity-for-women/2024/01/03/movimentoPlayer.html","/unity-for-women/2024/01/01/primeiroNivel.html","/unity-for-women/2024/01/01/Ambiente.html","/unity-for-women/about/","/unity-for-women/categories.html","/unity-for-women/blog/","/unity-for-women/","/unity-for-women/tutorials/","/unity-for-women/manifest.json","/unity-for-women/assets/search.json","/unity-for-women/assets/styles.css","/unity-for-women/redirects.json","/unity-for-women/sitemap.xml","/unity-for-women/robots.txt","/unity-for-women/feed.xml","/unity-for-women/img/logo.jpeg", "/unity-for-women/assets/default-offline-image.png", "/unity-for-women/assets/scripts/fetch.js"
  ]
}

const updateStaticCache = () => {
  return caches.open(cacheName).then(cache => {
    return cache.addAll(buildContentBlob());
  });
};

const clearOldCache = () => {
  return caches.keys().then(keys => {
    // Remove caches whose name is no longer valid.
    return Promise.all(
      keys
        .filter(key => {
          return key !== cacheName;
        })
        .map(key => {
          console.log(`Service Worker: removing cache ${key}`);
          return caches.delete(key);
        })
    );
  });
};

self.addEventListener("install", event => {
  event.waitUntil(
    updateStaticCache().then(() => {
      console.log(`Service Worker: cache updated to version: ${cacheName}`);
    })
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(clearOldCache());
});

self.addEventListener("fetch", event => {
  let request = event.request;
  let url = new URL(request.url);

  // Only deal with requests from the same domain.
  if (url.origin !== location.origin) {
    return;
  }

  // Always fetch non-GET requests from the network.
  if (request.method !== "GET") {
    event.respondWith(fetch(request));
    return;
  }

  // Default url returned if page isn't cached
  let offlineAsset = "/offline/";

  if (request.url.match(/\.(jpe?g|png|gif|svg)$/)) {
    // If url requested is an image and isn't cached, return default offline image
    offlineAsset = "/unity-for-women/assets/default-offline-image.png";
  }

  // For all urls request image from network, then fallback to cache, then fallback to offline page
  event.respondWith(
    fetch(request).catch(async () => {
      return (await caches.match(request)) || caches.match(offlineAsset);
    })
  );
  return;
});
