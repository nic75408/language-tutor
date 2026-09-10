/* 个人中心模块 —— 展示当前 CEFR 等级 + 强弱项，提供"重新测评"入口 */
(function () {
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function render(container) {
    var completed = window.App.assessment && window.App.assessment.isCompleted();
    var result = completed ? window.App.assessment.loadResult() : null;

    var levelSectionHtml;
    if (completed) {
      var strengthsHtml = result.strengths.map(function (s) {
        return '<li>' + esc(s) + '</li>';
      }).join('');
      var weaknessesHtml = result.weaknesses.map(function (s) {
        return '<li>' + esc(s) + '</li>';
      }).join('');
      levelSectionHtml =
        '<div class="profile-level-card" data-testid="profile-level-card">' +
        '<div class="profile-level-label">当前 CEFR 等级</div>' +
        '<div class="profile-level-value" data-testid="profile-level">' + esc(result.level) + '</div>' +
        '<div class="profile-level-section"><h3>强项</h3><ul>' + strengthsHtml + '</ul></div>' +
        '<div class="profile-level-section"><h3>待提升</h3><ul>' + weaknessesHtml + '</ul></div>' +
        '<button class="assess-btn-secondary" id="profile-retake" data-testid="profile-retake">重新测评</button>' +
        '</div>';
    } else {
      levelSectionHtml =
        '<div class="profile-level-card" data-testid="profile-level-card">' +
        '<p>还没有完成水平评估。</p>' +
        '<button class="assess-btn-primary" id="profile-retake" data-testid="profile-retake">开始评估</button>' +
        '</div>';
    }

    container.innerHTML =
      '<div class="page" data-page="profile">' +
      '<h1 class="page-title">👤 我</h1>' +
      levelSectionHtml +
      '<div class="page-placeholder">' +
      '<span class="emoji">👤</span>' +
      '<p>学习仪表盘 · 设置</p>' +
      '<span class="coming-soon">Coming soon</span>' +
      '</div>' +
      '</div>';

    container.querySelector('#profile-retake').addEventListener('click', function () {
      window.App.assessment.retake();
    });
  }

  window.App = window.App || {};
  window.App.pages = window.App.pages || {};
  window.App.pages.profile = { render };
})();
