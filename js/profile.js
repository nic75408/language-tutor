/* 个人中心模块 —— 占位实现，后续卡片补充学习仪表盘 + 设置 */
(function () {
  function render(container) {
    container.innerHTML = `
      <div class="page" data-page="profile">
        <h1 class="page-title">👤 我</h1>
        <div class="page-placeholder">
          <span class="emoji">👤</span>
          <p>学习仪表盘 · 设置 · 水平重测</p>
          <span class="coming-soon">Coming soon</span>
        </div>
      </div>
    `;
  }

  window.App = window.App || {};
  window.App.pages = window.App.pages || {};
  window.App.pages.profile = { render };
})();
