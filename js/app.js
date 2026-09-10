/* app.js —— 路由 + Tab 切换框架
 * hash 路由：#home / #vocab / #conversation / #grammar / #profile
 * 支持子路由（如 #conversation/scene/cafe-order），Tab 高亮按第一段匹配。
 * 各页面模块（home.js/vocab.js/...）通过 window.App.pages.<route>.render(container, subPath) 渲染内容
 */
(function () {
  var ROUTES = ['home', 'vocab', 'conversation', 'grammar', 'profile'];
  var DEFAULT_ROUTE = 'home';

  var outlet = document.getElementById('page-outlet');
  var tabBar = document.getElementById('tab-bar');

  function parseHash(hash) {
    var full = (hash || '').replace(/^#/, '');
    var segments = full.split('/');
    var base = segments[0];
    if (ROUTES.indexOf(base) === -1) {
      return { base: DEFAULT_ROUTE, sub: '', full: DEFAULT_ROUTE };
    }
    return { base: base, sub: segments.slice(1).join('/'), full: full };
  }

  function renderRoute(parsed) {
    var page = window.App && window.App.pages && window.App.pages[parsed.base];
    if (page && typeof page.render === 'function') {
      page.render(outlet, parsed.sub);
    } else {
      outlet.innerHTML = '<div class="page"><h1 class="page-title">未找到页面</h1></div>';
    }
    updateTabState(parsed.base);
    outlet.scrollTop = 0;
  }

  function updateTabState(route) {
    var items = tabBar.querySelectorAll('.tab-item');
    items.forEach(function (item) {
      var isActive = item.getAttribute('data-route') === route;
      item.classList.toggle('active', isActive);
      item.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
  }

  function navigate(route) {
    var target = '#' + route;
    if (window.location.hash === target) {
      renderRoute(parseHash(target));
    } else {
      window.location.hash = target;
    }
  }

  function onHashChange() {
    renderRoute(parseHash(window.location.hash));
  }

  tabBar.addEventListener('click', function (e) {
    var btn = e.target.closest('.tab-item');
    if (!btn) return;
    navigate(btn.getAttribute('data-route'));
  });

  window.addEventListener('hashchange', onHashChange);

  window.App = window.App || {};
  window.App.navigate = navigate;

  // 初始路由
  if (!window.location.hash) {
    window.location.hash = '#' + DEFAULT_ROUTE;
  } else {
    onHashChange();
  }

  // Service Worker 注册
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').catch(function (err) {
        console.warn('Service Worker 注册失败:', err);
      });
    });
  }
})();
