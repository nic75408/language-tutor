/* js/plan.js —— 学习计划（My Plan）模块
 * 4 周入门计划，数据来自 data/plan-data.js（window.PLAN_WEEKS，硬编码，不自动生成）。
 * 路由：#plan  —— 全屏页面（不在底部 Tab Bar，从首页"我的学习计划"入口进入）
 * 存储：localStorage['lt_plan_progress_v1'] = { [taskId]: true }（完成状态）
 */
(function () {
  var STORAGE_KEY = 'lt_plan_progress_v1';
  var TYPE_META = {
    vocab: { icon: 'book.closed', label: '词汇' },
    dialogue: { icon: 'bubble.left', label: '对话' },
    grammar: { icon: 'list.bullet', label: '语法' }
  };

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function loadProgress() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      var data = raw ? JSON.parse(raw) : {};
      return (data && typeof data === 'object') ? data : {};
    } catch (e) {
      return {};
    }
  }

  function saveProgress(data) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('学习计划进度保存失败:', e);
    }
  }

  function isTaskDone(progress, taskId) {
    return !!progress[taskId];
  }

  function setTaskDone(taskId, done) {
    var progress = loadProgress();
    if (done) {
      progress[taskId] = true;
      if (window.App.learningLog) window.App.learningLog.recordToday();
    } else {
      delete progress[taskId];
    }
    saveProgress(progress);
    return progress;
  }

  // 所有周所有任务的总完成百分比（0-100 整数）
  function getOverallPercent() {
    var progress = loadProgress();
    var weeks = window.PLAN_WEEKS || [];
    var total = 0, done = 0;
    weeks.forEach(function (w) {
      w.tasks.forEach(function (t) {
        total += 1;
        if (isTaskDone(progress, t.id)) done += 1;
      });
    });
    return total ? Math.round(done / total * 100) : 0;
  }

  function getWeekPercent(week, progress) {
    var total = week.tasks.length;
    var done = week.tasks.filter(function (t) { return isTaskDone(progress, t.id); }).length;
    return total ? Math.round(done / total * 100) : 0;
  }

  function taskTargetHref(task) {
    if (task.type === 'grammar' && task.targetId) return '#grammar/' + encodeURIComponent(task.targetId);
    if (task.type === 'vocab') return '#vocab';
    if (task.type === 'dialogue') return '#conversation';
    return null;
  }

  function renderTask(task, progress) {
    var done = isTaskDone(progress, task.id);
    var meta = TYPE_META[task.type] || { icon: 'doc.text', label: '' };
    var detailHtml = task.detail ? '<div class="plan-task-detail">' + esc(task.detail) + '</div>' : '';
    var href = taskTargetHref(task);
    var linkHtml = href ? '<a class="plan-task-link" href="' + href + '">去完成' + window.Icons.get('chevron.right', { size: 12 }) + '</a>' : '';
    var iconSvg = window.Icons ? window.Icons.get(meta.icon, { size: 14 }) : '';

    return '<div class="plan-task' + (done ? ' done' : '') + '" data-task-id="' + task.id + '">' +
      '<button class="plan-task-checkbox' + (done ? ' checked' : '') + '" data-toggle-task="' + task.id + '" aria-label="标记完成"></button>' +
      '<div class="plan-task-body">' +
        '<div class="plan-task-top">' +
          '<span class="plan-task-type">' + iconSvg + '<span>' + meta.label + '</span></span>' +
        '</div>' +
        '<div class="plan-task-title">' + esc(task.title) + '</div>' +
        detailHtml +
        linkHtml +
      '</div>' +
    '</div>';
  }

  function renderWeek(week, progress) {
    var percent = getWeekPercent(week, progress);
    var tasksHtml = week.tasks.map(function (t) { return renderTask(t, progress); }).join('');

    return '<section class="plan-week" data-week="' + week.week + '">' +
      '<div class="plan-week-header">' +
        '<div class="plan-week-heading">' +
          '<div class="plan-week-label">WEEK ' + week.week + '</div>' +
          '<h2 class="plan-week-theme">' + esc(week.theme) + '</h2>' +
        '</div>' +
        '<div class="plan-week-percent">' + percent + '%</div>' +
      '</div>' +
      '<div class="plan-week-progress"><div class="plan-week-progress-bar" style="width:' + percent + '%"></div></div>' +
      '<div class="plan-week-tasks">' + tasksHtml + '</div>' +
    '</section>';
  }

  function render(container) {
    var progress = loadProgress();
    var weeks = window.PLAN_WEEKS || [];
    var overall = getOverallPercent();

    var weeksHtml = weeks.map(function (w) { return renderWeek(w, progress); }).join('');

    container.innerHTML =
      '<div class="page plan-page" data-page="plan">' +
        '<button class="grammar-header-back" id="plan-back" aria-label="返回">' + window.Icons.get('chevron.left', { size: 20 }) + '</button>' +
        '<h1 class="page-title">' + window.Icons.get('calendar', { size: 22 }) + '<span>4 周学习计划</span></h1>' +
        '<div class="plan-overview">' +
          '<div class="plan-overview-label">总体进度</div>' +
          '<div class="plan-overview-bar"><div class="plan-overview-bar-fill" style="width:' + overall + '%"></div></div>' +
          '<div class="plan-overview-percent">' + overall + '%</div>' +
        '</div>' +
        weeksHtml +
      '</div>';

    bindEvents(container);
  }

  function bindEvents(container) {
    var back = container.querySelector('#plan-back');
    if (back) {
      back.addEventListener('click', function () {
        window.App.navigateTo('home');
      });
    }

    container.addEventListener('click', function (e) {
      var checkbox = e.target.closest('[data-toggle-task]');
      if (!checkbox) return;
      var taskId = checkbox.getAttribute('data-toggle-task');
      var wasDone = checkbox.classList.contains('checked');
      setTaskDone(taskId, !wasDone);
      render(container);
    });
  }

  window.App = window.App || {};
  window.App.pages = window.App.pages || {};
  window.App.pages.plan = { render: render };
  window.App.plan = {
    loadProgress: loadProgress,
    setTaskDone: setTaskDone,
    getOverallPercent: getOverallPercent,
    getWeekPercent: getWeekPercent
  };
})();
