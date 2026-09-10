/* js/vocab.js —— 核心词库模块
 * 功能：
 *  1. 按场景 Tab 筛选（全部/旅行/日常/工作）
 *  2. 词卡列表：英文 + 音标 + 中文释义 + 场景标签 + 记忆状态
 *  3. 点击词卡展开：例句 + 用法说明
 *  4. 记忆状态手动切换：新词 → 学习中 → 已掌握
 *  5. 间隔重复（SM-2 简化版）：今日复习队列
 *
 * 数据存储：
 *  - 词库内容：window.VOCAB_DATA（data/vocab-data.js，硬编码常量）
 *  - 用户状态（status / SM-2 参数）：localStorage key = 'vocabProgress'
 *    { [id]: { status, easeFactor, interval, repetitions, dueDate, lastReviewed } }
 */
(function () {
  var STORAGE_KEY = 'vocabProgress';
  var SCENES = [
    { key: 'all', label: '全部' },
    { key: 'travel', label: '旅行' },
    { key: 'daily', label: '日常' },
    { key: 'work', label: '工作' }
  ];
  var STATUS_LABEL = { new: '新词', learning: '学习中', mastered: '已掌握' };
  var STATUS_ORDER = ['new', 'learning', 'mastered'];

  var state = {
    activeScene: 'all',
    expandedId: null,
    showDueOnly: false
  };

  // ---------------------------------------------------------------------
  // 持久化：用户学习进度（SM-2 参数 + 状态）
  // ---------------------------------------------------------------------
  function loadProgress() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      console.warn('读取词库进度失败:', e);
      return {};
    }
  }

  function saveProgress(progress) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (e) {
      console.warn('保存词库进度失败:', e);
    }
  }

  function getEntryState(progress, word) {
    return progress[word.id] || {
      status: word.status || 'new',
      easeFactor: 2.5,
      interval: 0,
      repetitions: 0,
      dueDate: todayStr(),
      lastReviewed: null
    };
  }

  function todayStr() {
    return new Date().toISOString().slice(0, 10);
  }

  function addDays(dateStr, days) {
    var d = new Date(dateStr + 'T00:00:00');
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
  }

  // ---------------------------------------------------------------------
  // SM-2 简化版算法
  // quality: 0-5，这里用简化的三档映射：
  //   again(不认识)=2 / hard(模糊)=3 / good(认识)=4 / easy(很熟)=5
  // ---------------------------------------------------------------------
  function sm2(entry, quality) {
    var ef = entry.easeFactor || 2.5;
    var reps = entry.repetitions || 0;
    var interval = entry.interval || 0;

    if (quality < 3) {
      reps = 0;
      interval = 1;
    } else {
      if (reps === 0) {
        interval = 1;
      } else if (reps === 1) {
        interval = 6;
      } else {
        interval = Math.round(interval * ef);
      }
      reps += 1;
    }

    ef = ef + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    if (ef < 1.3) ef = 1.3;

    return {
      easeFactor: ef,
      interval: interval,
      repetitions: reps,
      dueDate: addDays(todayStr(), interval),
      lastReviewed: todayStr()
    };
  }

  // ---------------------------------------------------------------------
  // 状态操作
  // ---------------------------------------------------------------------
  function setStatus(word, newStatus) {
    var progress = loadProgress();
    var entry = getEntryState(progress, word);
    entry.status = newStatus;
    // 状态切换也顺带记录一次复习（正向）
    if (newStatus === 'mastered') {
      Object.assign(entry, sm2(entry, 5));
    } else if (newStatus === 'learning') {
      Object.assign(entry, sm2(entry, 3));
    } else {
      entry.interval = 0;
      entry.repetitions = 0;
      entry.dueDate = todayStr();
    }
    progress[word.id] = entry;
    saveProgress(progress);
    if (window.App.learningLog) window.App.learningLog.recordToday();
  }

  function reviewWord(word, quality) {
    var progress = loadProgress();
    var entry = getEntryState(progress, word);
    var updated = sm2(entry, quality);
    Object.assign(entry, updated);
    // 复习质量差 → 打回"学习中"；质量好且已达 3 次以上 → 标记"已掌握"
    if (quality < 3) {
      entry.status = 'learning';
    } else if (entry.repetitions >= 3) {
      entry.status = 'mastered';
    } else {
      entry.status = 'learning';
    }
    progress[word.id] = entry;
    saveProgress(progress);
    if (window.App.learningLog) window.App.learningLog.recordToday();
    return entry;
  }

  function getDueWords(allWords, progress) {
    var today = todayStr();
    return allWords.filter(function (w) {
      var entry = getEntryState(progress, w);
      // 新词永远显示在待复习里（还没学过）；非新词按 dueDate 判断
      if (entry.status === 'new') return true;
      return entry.dueDate <= today;
    });
  }

  // ---------------------------------------------------------------------
  // 渲染
  // ---------------------------------------------------------------------
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function renderSceneTabs() {
    return SCENES.map(function (s) {
      var active = s.key === state.activeScene ? ' active' : '';
      return '<button class="vocab-scene-tab' + active + '" data-scene="' + s.key + '">' +
        '<span>' + s.label + '</span>' +
        '</button>';
    }).join('');
  }

  function renderWordCard(word, progress) {
    var entry = getEntryState(progress, word);
    var isExpanded = state.expandedId === word.id;
    var tagsHtml = (word.tags || []).map(function (t) {
      return '<span class="vocab-tag">' + escapeHtml(t) + '</span>';
    }).join('');

    var sceneInfo = SCENES.filter(function (s) { return s.key === word.scene; })[0];
    var sceneLabel = sceneInfo ? sceneInfo.label : word.scene;

    var detailHtml = '';
    if (isExpanded) {
      var statusSegHtml = '<div class="vocab-status-segmented">' +
        '<span class="vocab-detail-label">状态</span>' +
        '<div class="vocab-segmented" role="radiogroup" aria-label="学习状态">' +
          STATUS_ORDER.map(function (s) {
            var pressed = s === entry.status ? 'true' : 'false';
            return '<button class="seg-' + s + '" role="radio" aria-pressed="' + pressed + '" data-set-status="' + s + '" data-id="' + word.id + '">' +
              '<span class="seg-dot"></span>' + STATUS_LABEL[s] +
            '</button>';
          }).join('') +
        '</div>' +
      '</div>';
      detailHtml = '<div class="vocab-card-detail">' +
        '<div class="vocab-detail-row"><span class="vocab-detail-label">例句</span>' +
        '<p class="vocab-example">' + escapeHtml(word.example || '') + '</p></div>' +
        statusSegHtml +
        '<div class="vocab-review-actions">' +
        '<span class="vocab-detail-label">复习评价</span>' +
        '<div class="vocab-review-btns">' +
        '<button class="vocab-review-btn again" data-review="2" data-id="' + word.id + '">不认识</button>' +
        '<button class="vocab-review-btn hard" data-review="3" data-id="' + word.id + '">模糊</button>' +
        '<button class="vocab-review-btn good" data-review="4" data-id="' + word.id + '">认识</button>' +
        '<button class="vocab-review-btn easy" data-review="5" data-id="' + word.id + '">很熟</button>' +
        '</div></div>' +
        '</div>';
    }

    return '<div class="vocab-card' + (isExpanded ? ' expanded' : '') + '" data-id="' + word.id + '">' +
      '<div class="vocab-card-main" data-toggle="' + word.id + '">' +
        '<div class="vocab-card-top">' +
          '<span class="vocab-en">' + escapeHtml(word.en) + '</span>' +
          '<span class="vocab-status-tag status-' + entry.status + '" aria-label="状态：' + STATUS_LABEL[entry.status] + '">' +
            STATUS_LABEL[entry.status] +
          '</span>' +
        '</div>' +
        '<div class="vocab-phonetic">' + escapeHtml(word.phonetic || '') + '</div>' +
        '<div class="vocab-zh">' + escapeHtml(word.zh) + '</div>' +
        '<div class="vocab-meta-row">' +
          '<span class="vocab-scene-badge">' + sceneLabel + '</span>' +
          tagsHtml +
        '</div>' +
      '</div>' +
      detailHtml +
      '</div>';
  }

  function render(container) {
    var progress = loadProgress();
    var allWords = window.VOCAB_DATA || [];

    var filtered = state.activeScene === 'all'
      ? allWords
      : allWords.filter(function (w) { return w.scene === state.activeScene; });

    if (state.showDueOnly) {
      var due = getDueWords(allWords, progress);
      var dueIds = {};
      due.forEach(function (w) { dueIds[w.id] = true; });
      filtered = filtered.filter(function (w) { return dueIds[w.id]; });
    }

    // 排序：按 priority 升序，其次按 id
    filtered = filtered.slice().sort(function (a, b) {
      return (a.priority || 9) - (b.priority || 9) || a.id.localeCompare(b.id);
    });

    var dueCount = getDueWords(allWords, progress).length;
    var masteredCount = allWords.filter(function (w) {
      return getEntryState(progress, w).status === 'mastered';
    }).length;

    var cardsHtml = filtered.length
      ? filtered.map(function (w) { return renderWordCard(w, progress); }).join('')
      : '<div class="vocab-empty">这个分类下暂无待复习词条</div>';

    container.innerHTML =
      '<div class="page" data-page="vocab">' +
        '<h1 class="page-title">' + window.Icons.get('book.closed', { size: 22 }) + '<span>词库</span></h1>' +
        '<div class="vocab-summary">' +
          '<span>共 ' + allWords.length + ' 词</span>' +
          '<span>·</span>' +
          '<span>已掌握 ' + masteredCount + '</span>' +
          '<span>·</span>' +
          '<span>今日待复习 ' + dueCount + '</span>' +
        '</div>' +
        '<div class="vocab-sticky-tabs" id="vocab-sticky-tabs">' +
          '<div class="vocab-scene-tabs" id="vocab-scene-tabs">' + renderSceneTabs() + '</div>' +
        '</div>' +
        '<label class="vocab-due-toggle">' +
          '<input type="checkbox" id="vocab-due-checkbox"' + (state.showDueOnly ? ' checked' : '') + '>' +
          '<span>只看今日复习队列</span>' +
        '</label>' +
        '<div class="vocab-list" id="vocab-list">' + cardsHtml + '</div>' +
      '</div>';

    bindEvents(container);
  }

  function bindEvents(container) {
    var tabsEl = container.querySelector('#vocab-scene-tabs');
    if (tabsEl) {
      tabsEl.addEventListener('click', function (e) {
        var btn = e.target.closest('.vocab-scene-tab');
        if (!btn) return;
        state.activeScene = btn.getAttribute('data-scene');
        render(container);
      });
    }

    var dueCheckbox = container.querySelector('#vocab-due-checkbox');
    if (dueCheckbox) {
      dueCheckbox.addEventListener('change', function (e) {
        state.showDueOnly = e.target.checked;
        render(container);
      });
    }

    var listEl = container.querySelector('#vocab-list');
    if (!listEl) return;

    listEl.addEventListener('click', function (e) {
      var reviewBtn = e.target.closest('[data-review]');
      if (reviewBtn) {
        e.stopPropagation();
        var wid = reviewBtn.getAttribute('data-id');
        var quality = parseInt(reviewBtn.getAttribute('data-review'), 10);
        var word = (window.VOCAB_DATA || []).filter(function (w) { return w.id === wid; })[0];
        if (word) reviewWord(word, quality);
        render(container);
        return;
      }

      var segBtn = e.target.closest('[data-set-status]');
      if (segBtn) {
        e.stopPropagation();
        var sid = segBtn.getAttribute('data-id');
        var newStatus = segBtn.getAttribute('data-set-status');
        var w = (window.VOCAB_DATA || []).filter(function (x) { return x.id === sid; })[0];
        if (w) setStatus(w, newStatus);
        render(container);
        return;
      }

      var toggle = e.target.closest('[data-toggle]');
      if (toggle) {
        var tid = toggle.getAttribute('data-toggle');
        state.expandedId = state.expandedId === tid ? null : tid;
        render(container);
      }
    });
  }

  window.App = window.App || {};
  window.App.pages = window.App.pages || {};
  window.App.pages.vocab = { render: render };

  // 暴露给测试/其他模块使用
  window.App.vocab = {
    loadProgress: loadProgress,
    saveProgress: saveProgress,
    getDueWords: getDueWords,
    sm2: sm2,
    reviewWord: reviewWord,
    setStatus: setStatus
  };
})();
