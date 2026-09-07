// STUDIO 홈 PWA service worker.
// HTML은 항상 네트워크에서 새로 받아온다 — "설치된 앱이 예전 버전에 멈춰있다"는 문제를 막기 위함.
// 정적 자산(아이콘 등)만 캐시해서 설치 가능성/오프라인 아이콘 정도만 지원.
const CACHE = "studio-shell-v2";
const STATIC = ["./icon-192.png", "./icon-512.png", "./manifest.json"];

self.addEventListener("install", (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(STATIC)).catch(() => {}));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;
  if (url.pathname.indexOf("/carenote/") === 0) return;   // 다른 방(앱)의 서비스워커 몫
  if (url.pathname.indexOf("/gear/") === 0) return;        // 자주 갱신되는 데이터 — 캐시 없이 항상 최신으로
  if (url.pathname.indexOf("/shoots/") === 0) return;       // 촬영 프로젝트 — 캐시 없이 항상 최신으로

  const isPage = e.request.mode === "navigate" || url.pathname.endsWith("/") || url.pathname.endsWith("index.html");
  if (isPage) {
    e.respondWith(
      fetch(e.request, { cache: "no-store" })
        .then((res) => { caches.open(CACHE).then((c) => c.put(e.request, res.clone())).catch(() => {}); return res; })
        .catch(() => caches.match(e.request).then((r) => r || caches.match("./index.html")))
    );
    return;
  }

  e.respondWith(
    caches.match(e.request).then((cached) => cached || fetch(e.request).then((res) => {
      const copy = res.clone();
      caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(() => {});
      return res;
    }))
  );
});
