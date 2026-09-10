/* 语法模块 —— 占位实现，后续卡片补充语法知识点列表 */
(function () {
  function render(container) {
    container.innerHTML = `
      <div class="page" data-page="grammar">
        <h1 class="page-title">📐 语法</h1>
        <div class="page-placeholder">
          <span class="emoji">📐</span>
          <p>语法知识点列表 · 按难度分级</p>
          <span class="coming-soon">Coming soon</span>
        </div>
      </div>
    `;
  }

  window.App = window.App || {};
  window.App.pages = window.App.pages || {};
  window.App.pages.grammar = { render };
})();
