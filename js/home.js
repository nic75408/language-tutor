/* 首页模块 —— 占位实现，后续卡片补充学习计划/今日任务等真实内容 */
(function () {
  function render(container) {
    container.innerHTML = `
      <div class="page" data-page="home">
        <h1 class="page-title">📊 首页</h1>
        <div class="page-placeholder">
          <span class="emoji">📊</span>
          <p>今日任务 · 学习计划进度 · 快捷入口</p>
          <span class="coming-soon">Coming soon</span>
        </div>
      </div>
    `;
  }

  window.App = window.App || {};
  window.App.pages = window.App.pages || {};
  window.App.pages.home = { render };
})();
