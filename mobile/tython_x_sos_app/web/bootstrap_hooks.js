// Enable App Check debug token mode only on localhost for local development.
if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
  self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
}

const offlineBanner = document.getElementById('offline-banner');
const updateBanner = document.getElementById('update-banner');
const updateReload = document.getElementById('update-reload');
const bootSplash = document.getElementById('boot-splash');
let waitingWorker = null;

function setOfflineBanner() {
  const offline = !navigator.onLine;
  if (offlineBanner) {
    offlineBanner.style.display = offline ? 'flex' : 'none';
  }
}

function showUpdateBanner(worker) {
  waitingWorker = worker;
  if (updateBanner) {
    updateBanner.style.display = 'flex';
  }
}

window.addEventListener('online', setOfflineBanner);
window.addEventListener('offline', setOfflineBanner);
setOfflineBanner();

window.addEventListener('flutter-first-frame', () => {
  if (bootSplash) {
    bootSplash.style.display = 'none';
  }
});

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistration().then((registration) => {
    if (!registration) {
      return;
    }
    if (registration.waiting) {
      showUpdateBanner(registration.waiting);
    }
    registration.addEventListener('updatefound', () => {
      const worker = registration.installing;
      if (!worker) {
        return;
      }
      worker.addEventListener('statechange', () => {
        if (worker.state === 'installed' && navigator.serviceWorker.controller) {
          showUpdateBanner(worker);
        }
      });
    });
  });
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    window.location.reload();
  });
}

if (updateReload) {
  updateReload.addEventListener('click', () => {
    if (waitingWorker) {
      waitingWorker.postMessage('skipWaiting');
    }
    window.location.reload();
  });
}
