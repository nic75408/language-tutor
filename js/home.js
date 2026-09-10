/* 首页模块 —— 今日任务卡 + 本周进度环 + 连续学习天数 + 快捷入口
 * 未完成评估时先提示"完成评估解锁学习计划"；已完成则展示仪表盘内容。
 */
(function () {
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  var TYPE_META = {
    vocab: { emoji: '📖', label: '词汇' },
    dialogue: { emoji: '💬', label: '对话' },
    grammar: { emoji: '📐', label: '语法' }
  };

  // 找到"当前进行中"的一周：第一个还没 100% 完成的周；全部完成则回退到最后一周
  function getCurrentWeek(progress) {
    var weeks = window.PLAN_WEEKS || [];
    for (var i = 0; i < weeks.length; i++) {
      if (window.App.plan.getWeekPercent(weeks[i], progress) < 100) return weeks[i];
    }
    return weeks[weeks.length - 1] || null;
  }

  // 从当前周里挑 2-3 个未完成任务作为"今日任务"；不够则从已完成任务里补足展示数量
  function pickTodayTasks(week, progress) {
    if (!week) return [];
    var pending = week.tasks.filter(function (t) { return !progress[t.id]; });
    var picked = pending.slice(0, 3);
    if (picked.length < 2) {
      var done = week.tasks.filter(function (t) { return progress[t.id]; });
      picked = picked.concat(done.slice(0, 2 - picked.length));
    }
    return picked;
  }

  function taskTargetHref(task) {
    if (task.type === 'grammar' && task.targetId) return '#grammar/' + encodeURIComponent(task.targetId);
    if (task.type === 'vocab') return '#vocab';
    if (task.type === 'dialogue') return '#conversation';
    return '#plan';
  }

  function renderTaskCard(task, progress) {
    var done = !!progress[task.id];
    var meta = TYPE_META[task.type] || { emoji: '📎', label: '' };
    var href = taskTargetHref(task);
    return '<div class="home-task-card' + (done ? ' done' : '') + '" data-task-id="' + task.id + '">' +
      '<button class="home-task-checkbox' + (done ? ' checked' : '') + '" data-toggle-task="' + task.id + '" aria-label="标记完成"></button>' +
      '<a class="home-task-body" href="' + href + '">' +
        '<span class="home-task-type">' + meta.emoji + ' ' + meta.label + '</span>' +
        '<span class="home-task-title">' + esc(task.title) + '</span>' +
      '</a>' +
    '</div>';
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

    var progress = (window.App.plan && window.App.plan.loadProgress()) || {};
    var currentWeek = getCurrentWeek(progress);
    var todayTasks = pickTodayTasks(currentWeek, progress);
    var weekPercent = currentWeek ? window.App.plan.getWeekPercent(currentWeek, progress) : 0;
    var streak = (window.App.learningLog && window.App.learningLog.getStreak()) || 0;

    var tasksHtml = todayTasks.length
      ? todayTasks.map(function (t) { return renderTaskCard(t, progress); }).join('')
      : '<p class="home-task-empty">今日任务已全部完成，去学习计划看看下一周吧 🎉</p>';

    var ringDeg = Math.round(weekPercent * 3.6);

    container.innerHTML =
      '<div class="page" data-page="home">' +
      '<h1 class="page-title">📊 首页</h1>' +
      '<div class="home-level-card">当前水平：<strong>' + esc(result.level) + '</strong></div>' +

      '<div class="home-dashboard-row">' +
        '<div class="home-progress-ring" style="--ring-deg:' + ringDeg + 'deg" data-testid="home-progress-ring">' +
          '<div class="home-progress-ring-inner">' +
            '<span class="home-progress-ring-percent">' + weekPercent + '%</span>' +
            '<span class="home-progress-ring-label">本周进度</span>' +
          '</div>' +
        '</div>' +
        '<div class="home-streak-card" data-testid="home-streak">' +
          '<span class="home-streak-num">' + streak + '</span>' +
          '<span class="home-streak-label">🔥 连续学习天数</span>' +
        '</div>' +
      '</div>' +

      '<div class="home-section">' +
        '<h2 class="home-section-title">今日任务</h2>' +
        '<div class="home-task-list" data-testid="home-today-tasks">' + tasksHtml + '</div>' +
      '</div>' +

      '<div class="home-section">' +
        '<h2 class="home-section-title">快捷入口</h2>' +
        '<div class="home-shortcut-row">' +
          '<a class="home-shortcut" href="#conversation" data-testid="shortcut-conversation">💬<span>对话</span></a>' +
          '<a class="home-shortcut" href="#vocab" data-testid="shortcut-vocab">📖<span>词库</span></a>' +
          '<a class="home-shortcut" href="#grammar" data-testid="shortcut-grammar">📐<span>语法</span></a>' +
          '<a class="home-shortcut" href="#plan" data-testid="shortcut-plan">📋<span>学习计划</span></a>' +
        '</div>' +
      '</div>' +
      '</div>';

    bindEvents(container);
  }

  function bindEvents(container) {
    var list = container.querySelector('[data-testid="home-today-tasks"]');
    if (!list) return;
    list.addEventListener('click', function (e) {
      var checkbox = e.target.closest('[data-toggle-task]');
      if (!checkbox) return;
      e.preventDefault();
      var taskId = checkbox.getAttribute('data-toggle-task');
      var wasDone = checkbox.classList.contains('checked');
      if (window.App.plan) window.App.plan.setTaskDone(taskId, !wasDone);
      render(container);
    });
  }

  window.App = window.App || {};
  window.App.pages = window.App.pages || {};
  window.App.pages.home = { render };
})();
