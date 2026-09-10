/* 词库模块 —— 占位实现，后续卡片补充 100 词场景词库 + 间隔重复 */
(function () {
  function render(container) {
    container.innerHTML = `
      <div class="page" data-page="vocab">
        <h1 class="page-title">📖 词库</h1>
        <div class="page-placeholder">
          <span class="emoji">📖</span>
          <p>核心词汇列表 · 按场景分类 · 可筛选状态</p>
          <span class="coming-soon">Coming soon</span>
        </div>
      </div>
    `;
  }

  window.App = window.App || {};
  window.App.pages = window.App.pages || {};
  window.App.pages.vocab = { render };
})();
