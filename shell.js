/* ─────────────────────────────────────────────────────────────
   CARECENTER 공통 앱 셸
   각 방 <head> 에 이 두 줄만 넣으면 된다.
     <link rel="stylesheet" href="../shell.css">
     <script src="../shell.js" defer></script>

   하는 일
     1) 기존 "케어센터로 돌아가기" 링크를 찾아 표준 상단바로 승격
     2) 방 제목을 <title> 에서 가져와 표시
     3) data-cc-action 이 붙은 버튼을 상단바 오른쪽으로 옮김
     4) safe-area · 가로 넘침 방지 등 모바일 기본기를 켬(html.cc-on)

   기존 마크업을 지우지 않는다. 뒤로가기 링크만 상단바 안으로 옮긴다.
   ───────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  var doc = document;
  if (doc.querySelector('.cc-bar')) return;           // 이미 적용된 페이지
  doc.documentElement.classList.add('cc-on');

  function ready(fn) {
    if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  /* 방 제목: <title> 에서 " · CARECENTER" 같은 꼬리를 떼어낸다 */
  function roomTitle() {
    var explicit = doc.body && doc.body.getAttribute('data-cc-title');
    if (explicit) return explicit;
    var t = (doc.title || '').trim();
    t = t.replace(/\s*[·|–—-]\s*CARECENTER\s*$/i, '');
    t = t.replace(/^\s*CARECENTER\s*[·|–—-]\s*/i, '');
    return t.trim();
  }

  /* 케어센터 허브로 돌아가는 링크 찾기 */
  function findBackLink() {
    var all = doc.querySelectorAll('a[href]');
    for (var i = 0; i < all.length; i++) {
      var a = all[i];
      var href = a.getAttribute('href') || '';
      var home = /^(\.\.\/(index\.html)?|\.\.|https?:\/\/youngjun5\.github\.io\/?(index\.html)?)$/.test(href.trim());
      if (!home) continue;
      var txt = (a.textContent || '').replace(/\s+/g, '');
      if (a.querySelector('img')) continue;            // 로고 링크는 건드리지 않음
      if (txt.length > 12) continue;                   // 본문 속 긴 링크는 제외
      return a;
    }
    return null;
  }

  var ARROW = '<svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="currentColor" ' +
              'stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4L6.5 10l5.5 6"/></svg>';

  ready(function () {
    /* body 가 화면 높이에 고정되고 내부 요소가 스크롤되는 방인지 판별 */
    var cs = getComputedStyle(doc.body);
    if (cs.overflowY === 'hidden' && Math.abs(doc.body.clientHeight - window.innerHeight) < 4) {
      doc.documentElement.classList.add('cc-appshell');
    }

    var bar = doc.createElement('div');
    bar.className = 'cc-bar';

    /* 0) 옮길 액션 버튼을 먼저 떼어둔다 — 옛 헤더 안에 들어 있는 경우가 있어서
          헤더를 지우기 전에 확보해야 한다 */
    var keep = [];
    var marked = doc.querySelectorAll('[data-cc-action]');
    for (var m = 0; m < marked.length; m++) keep.push(marked[m]);

    /* 1) 뒤로가기 — data-cc-replace 로 표시된 옛 헤더가 있으면 통째로 걷어낸다 */
    var old = doc.querySelector('[data-cc-replace]');
    var back = (old && old.querySelector('a[href]')) || findBackLink();
    var href = back ? back.getAttribute('href') : '../index.html';
    if (old && old.parentNode) { old.parentNode.removeChild(old); back = null; }
    var a = doc.createElement('a');
    a.className = 'cc-back';
    a.href = href;
    a.innerHTML = ARROW + '<span>케어센터</span>';
    if (back && back.parentNode) back.parentNode.removeChild(back);
    bar.appendChild(a);

    /* 2) 제목 */
    var title = roomTitle();
    if (title) {
      var h = doc.createElement('span');
      h.className = 'cc-title';
      h.textContent = title;
      bar.appendChild(h);
    }

    var sp = doc.createElement('span');
    sp.className = 'cc-sp';
    bar.appendChild(sp);

    /* 3) 방이 내어준 액션 버튼들을 오른쪽으로 */
    var actions = doc.createElement('span');
    actions.className = 'cc-actions';
    for (var i = 0; i < keep.length; i++) {
      if (keep[i].tagName === 'BUTTON' || keep[i].tagName === 'A') keep[i].classList.add('cc-ib');
      actions.appendChild(keep[i]);
    }
    bar.appendChild(actions);

    doc.body.insertBefore(bar, doc.body.firstChild);

    /* 4) 스크롤하면 상단바 아래 경계선 */
    var sentinel = doc.createElement('div');
    sentinel.style.cssText = 'position:absolute;top:0;height:1px;width:1px;pointer-events:none';
    doc.body.insertBefore(sentinel, bar);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (e) {
        bar.classList.toggle('cc-stuck', !e[0].isIntersecting);
      }).observe(sentinel);
    }

    /* 방이 준비되면 알림 — 방 쪽에서 추가로 붙일 게 있을 때 */
    doc.dispatchEvent(new CustomEvent('cc:ready', { detail: { bar: bar, actions: actions } }));
  });
})();
