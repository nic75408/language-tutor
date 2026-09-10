/* 首页模块 —— 未完成评估时提示"完成评估解锁学习计划"；已完成则展示占位任务卡 */
(function () {
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function render(container) {
    var completed = window.App.assessment && window.App.assessment.isCompleted();
    var result = completed ? window.App.assessment.loadResult() : null;

    if (!completed) {
      container.innerHTML =
        '<div class="page" data-page="home">' +
        '<h1 class="page-title">📊 首页</h1>' +
        '<div class="home-onboard-banner" data-testid="onboard-banner">' +
        '<p class="home-onboard-text">完成评估，解锁你的专属学习计划</p>' +
        '<button class="assess-btn-primary" id="home-start-assess" data-testid="home-start-assess">开始评估</button>' +
        '</div>' +
        '</div>';

      container.querySelector('#home-start-assess').addEventListener('click', function () {
        window.App.navigate('assessment');
      });
      return;
    }

    container.innerHTML =
      '<div class="page" data-page="home">' +
      '<h1 class="page-title">📊 首页</h1>' +
      '<div class="home-level-card">当前水平：<strong>' + esc(result.level) + '</strong></div>' +
      '<div class="page-placeholder">' +
      '<span class="emoji">📊</span>' +
      '<p>今日任务 · 学习计划进度 · 快捷入口</p>' +
      '<span class="coming-soon">Coming soon</span>' +
      '</div>' +
      '</div>';
  }

  window.App = window.App || {};
  window.App.pages = window.App.pages || {};
  window.App.pages.home = { render };
})();
