/* 对话模块 —— 占位实现，后续卡片补充场景对话 + AI 后端对接 */
(function () {
  function render(container) {
    container.innerHTML = `
      <div class="page" data-page="conversation">
        <h1 class="page-title">💬 对话</h1>
        <div class="page-placeholder">
          <span class="emoji">💬</span>
          <p>场景选择 → 进入对话 · 历史对话回顾</p>
          <span class="coming-soon">Coming soon</span>
        </div>
      </div>
    `;
  }

  window.App = window.App || {};
  window.App.pages = window.App.pages || {};
  window.App.pages.conversation = { render };
})();
