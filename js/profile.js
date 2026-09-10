/* 个人中心模块 —— 学习仪表盘（本周/本月时长、词汇进度、CEFR 等级、薄弱领域）+ 设置（重测/清除数据）
 * 提供"重新测评"入口。
 */
(function () {
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function getVocabMasteredPercent() {
    var allWords = window.VOCAB_DATA || [];
    if (!allWords.length || !window.App.vocab) return 0;
    var progress = window.App.vocab.loadProgress();
    var mastered = allWords.filter(function (w) {
      var entry = progress[w.id];
      return entry && entry.status === 'mastered';
    }).length;
    return Math.round(mastered / allWords.length * 100);
  }

  function renderWeakPoints() {
    if (!window.App.quizLog || !window.App.grammarData) return '';
    var weak = window.App.quizLog.getWeakPoints(3);
    if (!weak.length) {
      return '<p class="profile-weak-empty">还没有练习记录，去语法讲堂做几道练习题吧。</p>';
    }
    var itemsHtml = weak.map(function (w) {
      var point = window.App.grammarData.getById(w.pointId);
      var title = point ? point.title : w.pointId;
      return '<a class="profile-weak-item" href="#grammar/' + encodeURIComponent(w.pointId) + '">' +
        '<span class="profile-weak-title">' + esc(title) + '</span>' +
        '<span class="profile-weak-rate">错误率 ' + Math.round(w.wrongRate * 100) + '%</span>' +
      '</a>';
    }).join('');
    return '<div class="profile-weak-list">' + itemsHtml + '</div>';
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

    var weekMinutes = (window.App.studyTime && window.App.studyTime.getWeekMinutes()) || 0;
    var monthMinutes = (window.App.studyTime && window.App.studyTime.getMonthMinutes()) || 0;
    var vocabPercent = getVocabMasteredPercent();
    var streak = (window.App.learningLog && window.App.learningLog.getStreak()) || 0;

    var dashboardHtml =
      '<div class="profile-dashboard" data-testid="profile-dashboard">' +
        '<h2 class="home-section-title">学习仪表盘</h2>' +
        '<div class="profile-stat-grid">' +
          '<div class="profile-stat-card"><span class="profile-stat-num" data-testid="stat-week-minutes">' + weekMinutes + '</span><span class="profile-stat-label">本周分钟</span></div>' +
          '<div class="profile-stat-card"><span class="profile-stat-num" data-testid="stat-month-minutes">' + monthMinutes + '</span><span class="profile-stat-label">本月分钟</span></div>' +
          '<div class="profile-stat-card"><span class="profile-stat-num" data-testid="stat-vocab-percent">' + vocabPercent + '%</span><span class="profile-stat-label">词汇掌握</span></div>' +
          '<div class="profile-stat-card"><span class="profile-stat-num" data-testid="stat-streak">' + streak + '</span><span class="profile-stat-label">🔥 连续天数</span></div>' +
        '</div>' +
      '</div>';

    var weakSectionHtml =
      '<div class="profile-section">' +
        '<h2 class="home-section-title">薄弱领域</h2>' +
        renderWeakPoints() +
      '</div>';

    var settingsHtml =
      '<div class="profile-section">' +
        '<h2 class="home-section-title">设置</h2>' +
        '<div class="profile-settings-list">' +
          '<button class="profile-settings-item" id="profile-retake-2" data-testid="profile-retake-settings">🔄 重新测评</button>' +
          '<button class="profile-settings-item danger" id="profile-clear-data" data-testid="profile-clear-data">🗑️ 清除所有学习数据</button>' +
        '</div>' +
      '</div>';

    container.innerHTML =
      '<div class="page" data-page="profile">' +
      '<h1 class="page-title">👤 我</h1>' +
      levelSectionHtml +
      dashboardHtml +
      weakSectionHtml +
      settingsHtml +
      '</div>';

    var retakeBtn = container.querySelector('#profile-retake');
    if (retakeBtn) {
      retakeBtn.addEventListener('click', function () {
        window.App.assessment.retake();
      });
    }
    var retakeBtn2 = container.querySelector('#profile-retake-2');
    if (retakeBtn2) {
      retakeBtn2.addEventListener('click', function () {
        window.App.assessment.retake();
      });
    }
    var clearBtn = container.querySelector('#profile-clear-data');
    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        if (window.confirm('确定要清除所有学习数据吗？此操作不可撤销。')) {
          try { window.localStorage.clear(); } catch (e) { /* ignore */ }
          window.location.hash = '#home';
          window.location.reload();
        }
      });
    }
  }

  window.App = window.App || {};
  window.App.pages = window.App.pages || {};
  window.App.pages.profile = { render };
})();
