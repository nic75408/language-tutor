/* app.js —— 路由 + Tab 切换框架
 * hash 路由：#home / #vocab / #conversation / #grammar / #profile
 * 支持二级详情路由：#grammar/<id>（如 #grammar/tense-present），用于知识点详情页深链。
 * 各页面模块（home.js/vocab.js/...）通过 window.App.pages.<route>.render(container, param) 渲染内容，
 * param 为二级路径的剩余部分（没有则为 null）。
 */
(function () {
  var ROUTES = ['home', 'vocab', 'conversation', 'grammar', 'profile'];
  var DEFAULT_ROUTE = 'home';

  var outlet = document.getElementById('page-outlet');
  var tabBar = document.getElementById('tab-bar');

  function parseHash(hash) {
    var raw = (hash || '').replace(/^#/, '');
    var slashIdx = raw.indexOf('/');
    var routePart = slashIdx === -1 ? raw : raw.substring(0, slashIdx);
    var route = ROUTES.indexOf(routePart) !== -1 ? routePart : DEFAULT_ROUTE;
    var param = slashIdx === -1 ? null : decodeURIComponent(raw.substring(slashIdx + 1));
    return { route: route, param: param };
  }

  function renderRoute(parsed) {
    var page = window.App && window.App.pages && window.App.pages[parsed.route];
    if (page && typeof page.render === 'function') {
      page.render(outlet, parsed.param);
    } else {
      outlet.innerHTML = '<div class="page"><h1 class="page-title">未找到页面</h1></div>';
    }
    updateTabState(parsed.route);
  }

  function updateTabState(route) {
    var items = tabBar.querySelectorAll('.tab-item');
    items.forEach(function (item) {
      var isActive = item.getAttribute('data-route') === route;
      item.classList.toggle('active', isActive);
      item.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
  }

  function navigate(route, param) {
    var target = '#' + route + (param ? '/' + encodeURIComponent(param) : '');
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

  window.App = window.App || {};
  // 供各页面模块内部跳转使用，如详情页返回、卡片间联动跳转
  window.App.navigateTo = navigate;
})();
