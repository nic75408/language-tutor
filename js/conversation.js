/* 对话模块 —— 场景对话 + 自由对话 + 语音输入输出 + AI 纠错 + 对话回顾
 * 子路由（通过 app.js 的 hash 二段式路由传入 subPath）：
 *   ''                          -> 入口：场景列表 + 自由对话卡片 + 历史入口
 *   'scene/<sceneId>'           -> 场景设定页（中文情境介绍）
 *   'chat/free'                 -> 自由对话聊天界面
 *   'chat/scene/<sceneId>'      -> 场景对话聊天界面
 *   'chat/resume/<sessionId>'   -> 继续/查看一个已存在的会话（未结束才可继续输入）
 *   'review/<sessionId>'        -> 对话回顾
 *   'history'                   -> 历史对话列表
 */
(function () {
  var CATEGORY_LABEL = { travel: '旅行', daily: '日常', work: '工作' };
  var scenariosCache = null;
  var currentSession = null; // 当前正在进行的会话对象（内存态，随时同步落盘）
  var currentTurnIndex = 0;
  var recognitionCtrl = null;

  function loadScenarios() {
    if (scenariosCache) return Promise.resolve(scenariosCache);
    return fetch('data/scenarios.json')
      .then(function (res) { return res.json(); })
      .then(function (data) {
        scenariosCache = data;
        return data;
      })
      .catch(function (err) {
        console.warn('场景数据加载失败:', err);
        return [];
      });
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  // ---------- 入口页 ----------
  function renderEntry(container) {
    container.innerHTML = '<div class="page" data-page="conversation"><h1 class="page-title">' + window.Icons.get('bubble.left', { size: 22 }) + '<span>对话</span></h1><div id="conv-entry-body"></div></div>';
    var body = container.querySelector('#conv-entry-body');
    loadScenarios().then(function (scenarios) {
      var byCategory = {};
      scenarios.forEach(function (s) {
        (byCategory[s.category] = byCategory[s.category] || []).push(s);
      });
      var history = window.ConversationStore.listSorted();

      var html = '<div class="conv-entry-list">';
      html += '<div class="conv-freechat-card" data-action="free-chat">';
      html += '<span class="icon">' + window.Icons.get('waveform', { size: 26 }) + '</span><div><div class="title">自由对话</div><div class="sub">想聊什么聊什么，导师自适应你的水平</div></div>';
      html += '</div>';

      Object.keys(CATEGORY_LABEL).forEach(function (cat) {
        if (!byCategory[cat]) return;
        html += '<div><div class="conv-section-title">' + CATEGORY_LABEL[cat] + '</div><div class="conv-scene-grid">';
        byCategory[cat].forEach(function (s) {
          html += '<div class="conv-scene-card" data-action="open-scene" data-scene-id="' + s.id + '">' +
            '<span class="icon">' + window.Icons.get(s.icon, { size: 26 }) + '</span>' +
            '<span class="title">' + escapeHtml(s.title) + '</span>' +
            '<span class="cat">' + cat + '</span>' +
            '</div>';
        });
        html += '</div></div>';
      });

      html += '<div class="conv-history-link" data-action="open-history">' +
        '<span>历史对话回顾</span><span class="count">' + history.length + ' 条</span>' +
        '</div>';
      html += '</div>';
      body.innerHTML = html;

      body.querySelector('[data-action="free-chat"]').addEventListener('click', function () {
        window.App.navigate('conversation/chat/free');
      });
      body.querySelectorAll('[data-action="open-scene"]').forEach(function (el) {
        el.addEventListener('click', function () {
          window.App.navigate('conversation/scene/' + el.getAttribute('data-scene-id'));
        });
      });
      body.querySelector('[data-action="open-history"]').addEventListener('click', function () {
        window.App.navigate('conversation/history');
      });
    });
  }

  // ---------- 场景设定页 ----------
  function renderSceneSetup(container, sceneId) {
    container.innerHTML = '<div class="page" data-page="conversation"><div id="conv-setup-body"></div></div>';
    var body = container.querySelector('#conv-setup-body');
    loadScenarios().then(function (scenarios) {
      var scene = scenarios.find(function (s) { return s.id === sceneId; });
      if (!scene) {
        body.innerHTML = '<p class="review-empty">场景不存在。</p>';
        return;
      }
      var html = '<button class="page-header-back" data-action="back" aria-label="返回">' + window.Icons.get('chevron.left', { size: 20 }) + '</button>';
      html += '<div class="conv-setup">';
      html += '<div class="conv-setup-card">';
      html += '<span class="icon-big">' + window.Icons.get(scene.icon, { size: 48 }) + '</span>';
      html += '<h2>' + escapeHtml(scene.title) + '</h2>';
      html += '<p class="setting-zh">' + escapeHtml(scene.settingZh) + '</p>';
      html += '<div class="goals-title">本场对话目标</div>';
      html += '<ol class="goals-list">' + scene.goals.map(function (g) { return '<li>' + escapeHtml(g) + '</li>'; }).join('') + '</ol>';
      html += '</div>';
      html += '<button class="btn-primary" data-action="start">用英语开始对话</button>';
      html += '</div>';
      body.innerHTML = html;

      body.querySelector('[data-action="back"]').addEventListener('click', function () {
        window.App.navigate('conversation');
      });
      body.querySelector('[data-action="start"]').addEventListener('click', function () {
        window.App.navigate('conversation/chat/scene/' + scene.id);
      });
    });
  }

  // ---------- 聊天界面 ----------
  function renderChat(container, mode, sceneIdOrSessionId) {
    container.innerHTML = '<div class="page" data-page="conversation"><div id="conv-chat-body"></div></div>';
    var body = container.querySelector('#conv-chat-body');

    function boot(scene, resumeSession) {
      currentSession = resumeSession || window.ConversationStore.createSession(scene);
      currentTurnIndex = currentSession.messages.filter(function (m) { return m.role === 'tutor'; }).length;
      window.ConversationStore.upsert(currentSession);
      renderChatShell();
      if (currentSession.messages.length === 0) {
        pushTutorTurn();
      } else {
        renderMessages();
      }
    }

    if (mode === 'free') {
      boot(null, null);
    } else if (mode === 'scene') {
      loadScenarios().then(function (scenarios) {
        var scene = scenarios.find(function (s) { return s.id === sceneIdOrSessionId; });
        boot(scene || null, null);
      });
    } else if (mode === 'resume') {
      var session = window.ConversationStore.getById(sceneIdOrSessionId);
      if (!session) {
        body.innerHTML = '<p class="review-empty">会话不存在。</p>';
        return;
      }
      var scene = null;
      if (session.sceneId) {
        loadScenarios().then(function (scenarios) {
          scene = scenarios.find(function (s) { return s.id === session.sceneId; }) || null;
          boot(scene, session);
        });
      } else {
        boot(null, session);
      }
    }

    function renderChatShell() {
      // sceneIcon 可能是 SF 命名（新会话）或 emoji 字符（旧会话）——兼容处理
      var sceneIconSvg = '';
      if (currentSession.sceneId) {
        var iconName = currentSession.sceneIcon;
        // 若已经是 SF 命名（走 Icons 词表），转 SVG；否则视作 emoji fallback，包一层跳过
        if (iconName && window.Icons && window.Icons.PATHS[iconName]) {
          sceneIconSvg = window.Icons.get(iconName, { size: 20 }) + ' ';
        }
      } else {
        sceneIconSvg = window.Icons.get('waveform', { size: 20 }) + ' ';
      }
      var titleText = currentSession.sceneId ? currentSession.sceneTitle : '自由对话';
      var autoReadOn = window.Speech.getAutoRead();
      body.innerHTML =
        '<button class="page-header-back" data-action="back" aria-label="返回">' + window.Icons.get('chevron.left', { size: 20 }) + '</button>' +
        '<div class="conv-chat">' +
        '<div class="conv-chat-header">' +
        '<span class="title">' + sceneIconSvg + escapeHtml(titleText) + '</span>' +
        '<div class="actions">' +
        '<button class="icon-btn' + (autoReadOn ? ' active' : '') + '" data-action="toggle-read" title="朗读开关">' + window.Icons.get(autoReadOn ? 'speaker.wave' : 'speaker.slash', { size: 18 }) + '</button>' +
        '<button class="btn-end-chat" data-action="end">结束对话</button>' +
        '</div></div>' +
        '<div class="conv-messages" id="conv-messages"></div>' +
        '<div class="rec-cancel-hint" id="conv-rec-hint">← 滑走取消</div>' +
        '<div class="conv-composer" id="conv-composer">' +
        // idle / pending / sending 共用：input 包裹层 + 麦克风 + 发送
        '<div class="conv-input-wrap">' +
        '<span class="pending-dot" aria-hidden="true"></span>' +
        '<input type="text" id="conv-input" placeholder="用英语打字，或按住麦克风说话..." />' +
        '</div>' +
        '<button class="btn-mic" id="conv-mic" title="按住说话" aria-label="按住说话">' + window.Icons.get('waveform', { size: 20 }) + '</button>' +
        '<button class="btn-send" id="conv-send" disabled aria-label="发送">' + window.Icons.get('chevron.right', { size: 18 }) + '</button>' +
        // recording 态：内嵌 rec-inner + 停止按钮（display:none by default）
        '<div class="rec-inner">' +
        '<div class="rec-waveform"><span></span><span></span><span></span><span></span><span></span></div>' +
        '<span class="rec-label">正在听你说</span>' +
        '<span class="rec-timer" id="conv-rec-timer">0:00</span>' +
        '</div>' +
        '<button class="btn-rec-stop" id="conv-rec-stop" aria-label="停止录音">■</button>' +
        '</div>' +
        (window.Speech.isRecognitionSupported() ? '' : '<div class="mic-unsupported-hint">当前浏览器不支持语音识别，请用文字输入</div>') +
        '</div>';

      body.querySelector('[data-action="back"]').addEventListener('click', function () {
        window.App.navigate('conversation');
      });
      body.querySelector('[data-action="end"]').addEventListener('click', endChat);
      body.querySelector('[data-action="toggle-read"]').addEventListener('click', function (e) {
        var next = !window.Speech.getAutoRead();
        window.Speech.setAutoRead(next);
        var btn = e.currentTarget;
        btn.classList.toggle('active', next);
        btn.innerHTML = window.Icons.get(next ? 'speaker.wave' : 'speaker.slash', { size: 18 });
      });

      var input = body.querySelector('#conv-input');
      var sendBtn = body.querySelector('#conv-send');
      var composer = body.querySelector('#conv-composer');
      var chatWrap = body.querySelector('.conv-chat');
      var recTimerEl = body.querySelector('#conv-rec-timer');
      var recStopBtn = body.querySelector('#conv-rec-stop');
      var recTimerHandle = null;

      // 状态互斥切换：任意时刻 composer 只处于一个态
      function setComposerState(state) {
        composer.classList.remove('is-recording', 'is-pending', 'is-sending');
        chatWrap.classList.remove('is-recording');
        if (state === 'recording') {
          composer.classList.add('is-recording');
          chatWrap.classList.add('is-recording');
        } else if (state === 'pending') {
          composer.classList.add('is-pending');
        } else if (state === 'sending') {
          composer.classList.add('is-sending');
        }
      }
      function clearPending() {
        composer.classList.remove('is-pending');
      }

      // 点输入框任意位置 = 进入编辑（脱离 pending 态，dot 消失）
      input.addEventListener('focus', clearPending);
      input.addEventListener('input', function () {
        sendBtn.disabled = input.value.trim().length === 0;
        clearPending();
      });
      input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && !sendBtn.disabled) {
          submitUserText(input.value.trim());
          input.value = '';
          sendBtn.disabled = true;
          clearPending();
        }
      });
      sendBtn.addEventListener('click', function () {
        if (sendBtn.disabled) return;
        submitUserText(input.value.trim());
        input.value = '';
        sendBtn.disabled = true;
        clearPending();
      });

      var micBtn = body.querySelector('#conv-mic');

      function startTimer() {
        var startedAt = Date.now();
        recTimerEl.textContent = '0:00';
        recTimerHandle = setInterval(function () {
          var elapsed = Math.floor((Date.now() - startedAt) / 1000);
          var m = Math.floor(elapsed / 60);
          var s = elapsed % 60;
          recTimerEl.textContent = m + ':' + String(s).padStart(2, '0');
        }, 200);
      }
      function stopTimer() {
        if (recTimerHandle) {
          clearInterval(recTimerHandle);
          recTimerHandle = null;
        }
      }

      var startMic = function (e) {
        e.preventDefault();
        if (!window.Speech.isRecognitionSupported()) {
          alert('当前浏览器不支持语音识别，请使用 Chrome/Safari 最新版，或改用文字输入。');
          return;
        }
        setComposerState('recording');
        startTimer();
        recognitionCtrl = window.Speech.startRecognition({
          onResult: function (text) {
            stopTimer();
            if (text) {
              input.value = text;
              sendBtn.disabled = false;
              setComposerState('pending');
            } else {
              setComposerState('idle');
            }
          },
          onError: function () {
            stopTimer();
            setComposerState('idle');
          },
          onEnd: function () {
            stopTimer();
            // 若结果已回填走 pending，onEnd 不覆盖；否则回 idle
            if (!composer.classList.contains('is-pending')) {
              setComposerState('idle');
            }
          }
        });
      };
      var stopMic = function () {
        if (recognitionCtrl) recognitionCtrl.stop();
      };
      micBtn.addEventListener('mousedown', startMic);
      micBtn.addEventListener('touchstart', startMic, { passive: false });
      micBtn.addEventListener('mouseup', stopMic);
      micBtn.addEventListener('touchend', stopMic);
      micBtn.addEventListener('mouseleave', stopMic);

      // 录音态显式停止按钮（点击 = 松开麦克风）
      recStopBtn.addEventListener('mousedown', function (e) { e.preventDefault(); });
      recStopBtn.addEventListener('click', stopMic);
      recStopBtn.addEventListener('touchend', function (e) { e.preventDefault(); stopMic(); });
    }

    function renderMessages() {
      var wrap = body.querySelector('#conv-messages');
      if (!wrap) return;
      var html = '';
      currentSession.messages.forEach(function (m) {
        if (m.role === 'tutor') {
          html += '<div class="msg-row tutor">' +
            '<div class="msg-tutor-head"><span class="msg-tutor-avatar">T</span></div>' +
            '<div class="bubble-tutor">' + escapeHtml(m.text) + '</div>' +
            '<button class="msg-speak-btn" data-speak="' + escapeHtml(m.text) + '" aria-label="朗读">' + window.Icons.get('speaker.wave', { size: 14 }) + '<span>朗读</span></button>' +
            '</div>';
        } else {
          html += '<div class="msg-row user">' +
            '<div class="bubble-user">' + escapeHtml(m.text) + '</div>';
          if (m.zhNote) {
            html += '<div class="zh-note">' + escapeHtml(m.zhNote) + '</div>';
          }
          if (m.corrections && m.corrections.length) {
            html += '<div class="correction-tag">' + m.corrections.map(function (c) {
              return '<span class="item">' + window.Icons.get('pencil', { size: 12 }) + ' <span class="wrong">' + escapeHtml(c.wrong) + '</span> ' + window.Icons.get('chevron.right', { size: 12 }) + ' ' + escapeHtml(c.right) + '</span>';
            }).join('') + '</div>';
          }
          html += '</div>';
        }
      });
      wrap.innerHTML = html;
      wrap.querySelectorAll('[data-speak]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var text = btn.getAttribute('data-speak');
          wrap.querySelectorAll('.msg-speak-btn.playing').forEach(function (b) {
            b.classList.remove('playing');
          });
          window.Speech.speak(text, {
            onStart: function () { btn.classList.add('playing'); },
            onEnd: function () { btn.classList.remove('playing'); }
          });
        });
      });
      wrap.scrollTop = wrap.scrollHeight;
      var outlet = document.getElementById('page-outlet');
      if (outlet) outlet.scrollTop = outlet.scrollHeight;
    }

    function pushTutorTurn(userText) {
      var scenePayload = null;
      if (currentSession.sceneId) {
        scenePayload = { id: currentSession.sceneId, title: currentSession.sceneTitle, icon: currentSession.sceneIcon, opener: null };
      }
      // 若是场景对话且是第一轮，需要拿到真实 opener —— 从 scenariosCache 里查
      if (currentSession.sceneId && currentTurnIndex === 0 && scenariosCache) {
        var full = scenariosCache.find(function (s) { return s.id === currentSession.sceneId; });
        if (full) scenePayload.opener = full.opener;
      }
      window.AITutor.getReply({
        scene: scenePayload,
        history: currentSession.messages,
        userText: userText || '',
        turnIndex: currentTurnIndex
      }).then(function (result) {
        currentSession.messages.push({ role: 'tutor', text: result.text, ts: Date.now() });
        currentTurnIndex++;
        window.ConversationStore.upsert(currentSession);
        renderMessages();
        if (window.Speech.getAutoRead()) {
          var wrap = body.querySelector('#conv-messages');
          var btns = wrap ? wrap.querySelectorAll('[data-speak]') : [];
          var lastBtn = btns.length ? btns[btns.length - 1] : null;
          window.Speech.speak(result.text, {
            onStart: function () { if (lastBtn) lastBtn.classList.add('playing'); },
            onEnd: function () { if (lastBtn) lastBtn.classList.remove('playing'); }
          });
        }
      });
    }

    function submitUserText(text) {
      if (!text) return;
      window.AITutor.getReply({
        scene: currentSession.sceneId ? { id: currentSession.sceneId } : null,
        history: currentSession.messages,
        userText: text,
        turnIndex: currentTurnIndex
      }).then(function (result) {
        currentSession.messages.push({
          role: 'user',
          text: text,
          zhNote: result.zhNote,
          corrections: result.corrections,
          ts: Date.now()
        });
        window.ConversationStore.upsert(currentSession);
        renderMessages();
        pushTutorTurn(text);
      });
    }

    function endChat() {
      currentSession.endedAt = Date.now();
      currentSession.review = buildReview(currentSession);
      window.ConversationStore.upsert(currentSession);
      window.App.navigate('conversation/review/' + currentSession.id);
    }
  }

  // ---------- 复盘生成 ----------
  function buildReview(session) {
    var errorMap = {};
    session.messages.forEach(function (m) {
      if (m.role === 'user' && m.corrections) {
        m.corrections.forEach(function (c) {
          var key = c.wrong + '=>' + c.right;
          if (!errorMap[key]) errorMap[key] = { wrong: c.wrong, right: c.right, zh: c.zh, count: 0 };
          errorMap[key].count++;
        });
      }
    });
    var errors = Object.keys(errorMap).map(function (k) { return errorMap[k]; });
    var suggestions = [];
    if (errors.length === 0) {
      suggestions.push('这次对话没有检测到明显语法错误，继续保持！可以尝试用更复杂的从句挑战自己。');
    } else {
      suggestions.push('重点复习本次出现的 ' + errors.length + ' 类错误，可以在语法讲堂里找对应知识点巩固。');
      suggestions.push('尝试在下次对话里刻意用一次正确的说法，加深记忆。');
    }
    var learned = [];
    var userMsgCount = session.messages.filter(function (m) { return m.role === 'user'; }).length;
    if (userMsgCount > 0) {
      learned.push('完成了 ' + userMsgCount + ' 轮英语表达练习');
    }
    if (session.sceneTitle) {
      learned.push('学习了「' + session.sceneTitle + '」场景下的常用表达');
    }
    return { errors: errors, suggestions: suggestions, learned: learned };
  }

  // ---------- 回顾页 ----------
  function renderReview(container, sessionId) {
    container.innerHTML = '<div class="page" data-page="conversation"><div id="conv-review-body"></div></div>';
    var body = container.querySelector('#conv-review-body');
    var session = window.ConversationStore.getById(sessionId);
    if (!session) {
      body.innerHTML = '<p class="review-empty">对话记录不存在。</p>';
      return;
    }
    var review = session.review || buildReview(session);
    var html = '<button class="page-header-back" data-action="back" aria-label="返回">' + window.Icons.get('chevron.left', { size: 20 }) + '</button>';
    html += '<div class="conv-review">';
    html += '<div class="review-hero"><div class="title">对话复盘</div><div class="sub">' + escapeHtml(session.sceneTitle) + '</div></div>';

    html += '<div class="review-section"><h3>错误清单</h3>';
    if (review.errors.length === 0) {
      html += '<p class="review-empty">本次没有检测到语法错误</p>';
    } else {
      html += review.errors.map(function (e) {
        return '<div class="review-error-item"><span class="wrong">' + escapeHtml(e.wrong) + '</span> ' + window.Icons.get('chevron.right', { size: 12 }) + ' <span class="right">' + escapeHtml(e.right) + '</span><span class="zh">' + escapeHtml(e.zh || '') + '</span></div>';
      }).join('');
    }
    html += '</div>';

    html += '<div class="review-section"><h3>改进建议</h3><ul class="review-list">' +
      review.suggestions.map(function (s) { return '<li>' + escapeHtml(s) + '</li>'; }).join('') + '</ul></div>';

    html += '<div class="review-section"><h3>本次学到的</h3><ul class="review-list">' +
      (review.learned.length ? review.learned.map(function (s) { return '<li>' + escapeHtml(s) + '</li>'; }).join('') : '<li class="review-empty">暂无</li>') + '</ul></div>';

    html += '<button class="btn-secondary" data-action="history">查看历史对话</button>';
    html += '</div>';
    body.innerHTML = html;

    body.querySelector('[data-action="back"]').addEventListener('click', function () {
      window.App.navigate('conversation');
    });
    body.querySelector('[data-action="history"]').addEventListener('click', function () {
      window.App.navigate('conversation/history');
    });
  }

  // ---------- 历史列表 ----------
  function renderHistory(container) {
    container.innerHTML = '<div class="page" data-page="conversation"><div id="conv-history-body"></div></div>';
    var body = container.querySelector('#conv-history-body');
    var list = window.ConversationStore.listSorted();
    var html = '<button class="page-header-back" data-action="back">‹</button>';
    html += '<h1 class="page-title">历史对话</h1>';
    if (list.length === 0) {
      html += '<p class="review-empty">还没有对话记录，去开始第一次练习吧。</p>';
    } else {
      html += '<div class="conv-history-list">';
      list.forEach(function (s) {
        var date = new Date(s.startedAt);
        var dateStr = date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
        var userCount = s.messages.filter(function (m) { return m.role === 'user'; }).length;
        html += '<div class="history-item" data-action="open" data-id="' + s.id + '" data-ended="' + (s.endedAt ? '1' : '0') + '">' +
          '<div class="left"><div class="title">' + s.sceneIcon + ' ' + escapeHtml(s.sceneTitle) + '</div>' +
          '<div class="meta">' + dateStr + '</div></div>' +
          '<span class="badge-count">' + userCount + ' 轮</span>' +
          '</div>';
      });
      html += '</div>';
    }
    body.innerHTML = html;

    body.querySelector('[data-action="back"]').addEventListener('click', function () {
      window.App.navigate('conversation');
    });
    body.querySelectorAll('[data-action="open"]').forEach(function (el) {
      el.addEventListener('click', function () {
        var id = el.getAttribute('data-id');
        var ended = el.getAttribute('data-ended') === '1';
        if (ended) {
          window.App.navigate('conversation/review/' + id);
        } else {
          window.App.navigate('conversation/chat/resume/' + id);
        }
      });
    });
  }

  // ---------- 路由分发 ----------
  function render(container, subPath) {
    var parts = (subPath || '').split('/').filter(Boolean);
    if (parts.length === 0) {
      renderEntry(container);
    } else if (parts[0] === 'scene' && parts[1]) {
      renderSceneSetup(container, parts[1]);
    } else if (parts[0] === 'chat' && parts[1] === 'free') {
      renderChat(container, 'free');
    } else if (parts[0] === 'chat' && parts[1] === 'scene' && parts[2]) {
      renderChat(container, 'scene', parts[2]);
    } else if (parts[0] === 'chat' && parts[1] === 'resume' && parts[2]) {
      renderChat(container, 'resume', parts[2]);
    } else if (parts[0] === 'review' && parts[1]) {
      renderReview(container, parts[1]);
    } else if (parts[0] === 'history') {
      renderHistory(container);
    } else {
      renderEntry(container);
    }
  }

  window.App = window.App || {};
  window.App.pages = window.App.pages || {};
  window.App.pages.conversation = { render: render };
})();
