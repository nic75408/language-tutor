/* assessment.js —— 水平评估模块（v2 · 全选择交互）
 * 首次使用时，导师通过 5 轮交互对话评估用户英语水平，输出 CEFR 等级 + 强弱项 + 学习建议。
 * v2 变更：所有输入环节改为选择（单选/多选卡片 / 段落卡），去除任何文字输入框。
 *   R1 · 自我申报（3 题）：学习经历（单选目录卡）· 目标场景（多选目录卡）· 每天时长（横排 4-chip）
 *   R2 · 阅读理解（3 题）：目录卡单选（视觉一致）
 *   R3 · 词汇多选：chip 网格
 *   R4 · 输出能力：三段英文自我介绍段落卡 3 选 1（替代原写作 textarea）
 *   R5 · AI 综合评定
 * 存储：localStorage['lt_assessment_v1']（key 保持不变，向前兼容读取；本次 answers 结构升级）
 */
(function () {
  var STORAGE_KEY = 'lt_assessment_v1';

  // ---- 静态内容 ----
  var LEARNING_HISTORY = [
    { value: 'never', label: '从未学过', sub: '零基础起步' },
    { value: 'school', label: '学校里学过', sub: '中/高中英语课' },
    { value: 'self', label: '自学过一段', sub: 'App、网课、看剧' },
    { value: 'work', label: '工作中使用过', sub: '邮件、会议、出差' }
  ];

  var GOAL_SCENARIOS = [
    { value: 'travel', label: '旅行', sub: '点餐、问路、订酒店' },
    { value: 'daily', label: '日常对话', sub: '寒暄、聊兴趣爱好' },
    { value: 'work', label: '工作', sub: '写邮件、开会发言' },
    { value: 'exam', label: '考试', sub: '雅思、托福、四六级' }
  ];

  var DAILY_MINUTES = [
    { value: 5, label: '5 min' },
    { value: 15, label: '15 min' },
    { value: 30, label: '30 min' },
    { value: 60, label: '1 h+' }
  ];

  var READING_PASSAGE =
    'Maria arrived at the airport two hours before her flight. She checked in at the counter, ' +
    'then went through security. At the gate, she realized she had forgotten her phone charger, ' +
    'so she quickly bought one at a nearby shop before boarding.';

  var READING_QUESTIONS = [
    { id: 'r1', q: '玛丽亚是什么时候到达机场的？', options: ['起飞前两小时', '起飞前十分钟', '起飞后'], answer: 0 },
    { id: 'r2', q: '她在登机口发现自己忘了带什么？', options: ['护照', '手机充电器', '机票'], answer: 1 },
    { id: 'r3', q: '她后来怎么解决这个问题？', options: ['借了别人的', '在附近商店买了一个', '没有解决就登机了'], answer: 1 }
  ];

  // 从高频到低频排列，用于估测词汇量层级
  var VOCAB_WORDS = [
    { word: 'happy', tier: 1 },
    { word: 'travel', tier: 1 },
    { word: 'schedule', tier: 2 },
    { word: 'colleague', tier: 2 },
    { word: 'negotiate', tier: 3 },
    { word: 'reimbursement', tier: 3 },
    { word: 'ambiguous', tier: 4 },
    { word: 'meticulous', tier: 4 },
    { word: 'ubiquitous', tier: 5 },
    { word: 'idiosyncratic', tier: 5 }
  ];

  // R4 三段"自我介绍"英文文本，梯度锚点（Basic → Intermediate → Advanced）
  // 让用户选"最像你现在能说出来的水平"，替代打字写作
  var OUTPUT_SAMPLES = [
    {
      value: 'basic',
      tierLabel: 'Basic',
      text: "Hi, I'm Anna. I work in Beijing. I like to read books."
    },
    {
      value: 'intermediate',
      tierLabel: 'Intermediate',
      text: "Hi, I'm Anna. I work as a product designer in Beijing. In my free time I like reading and going for walks with my dog."
    },
    {
      value: 'advanced',
      tierLabel: 'Advanced',
      text: "Hi, I'm Anna — nice to meet you. I've been working as a product designer for about five years, mostly on consumer apps. Outside of work I'm into long-form reading and I've recently picked up trail running."
    }
  ];

  var TOTAL_ROUNDS = 5;

  // ---- 状态 ----
  var state = null;

  function freshState() {
    return {
      round: 1,
      answers: {
        selfReport: {
          history: null,       // 'never' | 'school' | 'self' | 'work'
          goals: [],           // 场景多选
          dailyMinutes: null   // 5 | 15 | 30 | 60
        },
        reading: {},
        vocabKnown: [],
        outputLevel: null      // 'basic' | 'intermediate' | 'advanced'
      }
    };
  }

  function loadResult() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function saveResult(result) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(result));
  }

  function clearResult() {
    window.localStorage.removeItem(STORAGE_KEY);
  }

  // ---- 规则评分（AI 不可用时的本地回退） ----
  function scoreLocally(answers) {
    var readingCorrect = 0;
    READING_QUESTIONS.forEach(function (item) {
      if (answers.reading[item.id] === item.answer) readingCorrect++;
    });
    var readingRatio = readingCorrect / READING_QUESTIONS.length;

    var vocabKnownCount = answers.vocabKnown.length;
    var highestTierKnown = 0;
    answers.vocabKnown.forEach(function (w) {
      var found = VOCAB_WORDS.filter(function (v) { return v.word === w; })[0];
      if (found && found.tier > highestTierKnown) highestTierKnown = found.tier;
    });

    // 输出等级映射：basic→0.2 / intermediate→0.55 / advanced→0.9
    var outputMap = { basic: 0.2, intermediate: 0.55, advanced: 0.9 };
    var outputScore = outputMap[answers.outputLevel] != null ? outputMap[answers.outputLevel] : 0.2;

    // 场景多选广度：0-1
    var goalsBreadth = Math.min((answers.selfReport.goals || []).length / 4, 1);

    // 综合打分：0-100
    var score = 0;
    score += readingRatio * 30;
    score += Math.min(vocabKnownCount / VOCAB_WORDS.length, 1) * 25;
    score += Math.min(highestTierKnown / 5, 1) * 15;
    score += outputScore * 25;  // R4 段落自评权重（原写作是 30，稍降 5 分给覆盖广度）
    score += goalsBreadth * 5;  // 场景覆盖广度小权重

    var level;
    if (score < 20) level = 'A1';
    else if (score < 38) level = 'A2';
    else if (score < 56) level = 'B1';
    else if (score < 72) level = 'B2';
    else if (score < 88) level = 'C1';
    else level = 'C2';

    var strengths = [];
    var weaknesses = [];

    if (readingRatio >= 0.67) strengths.push('阅读理解：能抓住短文中的关键信息');
    else weaknesses.push('阅读理解：对细节信息的捕捉还不够稳');

    if (vocabKnownCount >= 7) strengths.push('词汇量：认识的高频词/进阶词都比较多');
    else if (vocabKnownCount <= 3) weaknesses.push('词汇量：认识的词偏少，建议先夯实高频词');

    if (answers.outputLevel === 'advanced') {
      strengths.push('口语表达：能自如说出结构丰富的长句');
    } else if (answers.outputLevel === 'intermediate') {
      strengths.push('口语表达：能自我介绍并展开说一些细节');
    } else {
      weaknesses.push('口语表达：只能说最基础的短句，需要多练自由造句');
    }

    if (strengths.length === 0) strengths.push('愿意主动完成评估，学习态度积极');
    if (weaknesses.length === 0) weaknesses.push('整体表现均衡，暂无明显短板');

    // 从场景多选生成建议指向
    var scenarioLabelMap = { travel: '旅行', daily: '日常对话', work: '工作', exam: '考试' };
    var firstGoal = (answers.selfReport.goals && answers.selfReport.goals[0]) || 'daily';
    var goalName = scenarioLabelMap[firstGoal] || '日常对话';

    var recommendation =
      '建议从 ' + level + ' 对应难度的场景对话练起，优先补齐：' + weaknesses[0].split('：')[0] +
      '。可在"对话"模块选择贴近你目标（' + goalName + '）的场景，每天 ' +
      (answers.selfReport.dailyMinutes || 15) + ' 分钟坚持练习。';

    return {
      level: level,
      strengths: strengths,
      weaknesses: weaknesses,
      recommendation: recommendation,
      score: Math.round(score)
    };
  }

  // ---- AI 评分（可用时优先，失败自动回退到本地规则） ----
  function scoreWithAI(answers) {
    var systemPrompt =
      '你是一位资深英语教学法专家，正在依据 CEFR（A1-C2）量表评估一名中文母语学习者的英语水平。' +
      '请仅依据用户提供的评估数据 JSON，输出严格的 JSON（不要任何多余文字），格式为：' +
      '{"level":"A1|A2|B1|B2|C1|C2","strengths":["..."],"weaknesses":["..."],"recommendation":"..."}。' +
      'strengths 和 weaknesses 各 2-3 条，用简体中文，具体到听说读写哪个维度；recommendation 是一句可执行的学习建议。';

    var selectedSample = OUTPUT_SAMPLES.filter(function (s) { return s.value === answers.outputLevel; })[0];

    var userPayload = JSON.stringify({
      selfReport: answers.selfReport,
      readingQuestions: READING_QUESTIONS.map(function (q) { return q.q; }),
      readingAnswerCorrectCount: READING_QUESTIONS.filter(function (item) {
        return answers.reading[item.id] === item.answer;
      }).length,
      readingTotal: READING_QUESTIONS.length,
      vocabKnown: answers.vocabKnown,
      vocabTotal: VOCAB_WORDS.map(function (v) { return v.word; }),
      outputSelfAssessedLevel: answers.outputLevel,   // 用户选的输出水平锚点
      outputSampleUserSelected: selectedSample ? selectedSample.text : null
    });

    return window.App.ai.chatCompletion([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPayload }
    ]).then(function (content) {
      var parsed = JSON.parse(content);
      if (!parsed.level || !parsed.strengths || !parsed.weaknesses) throw new Error('ai-bad-shape');
      return parsed;
    });
  }

  function finalizeAssessment(answers, onDone) {
    if (window.App.ai && window.App.ai.isConfigured()) {
      scoreWithAI(answers).then(function (result) {
        onDone(Object.assign({ source: 'ai' }, result));
      }).catch(function () {
        onDone(Object.assign({ source: 'local' }, scoreLocally(answers)));
      });
    } else {
      onDone(Object.assign({ source: 'local' }, scoreLocally(answers)));
    }
  }

  // ---- 渲染工具 ----
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function progressHtml(round) {
    return '<div class="assess-progress" aria-label="进度 ' + round + ' / ' + TOTAL_ROUNDS + '">' +
      '<div class="assess-progress-bar" style="width:' + Math.round((round - 1) / TOTAL_ROUNDS * 100) + '%"></div>' +
      '</div><div class="assess-progress-label">第 ' + round + ' / ' + TOTAL_ROUNDS + ' 轮</div>';
  }

  function tutorBubble(text) {
    return '<div class="assess-tutor-msg"><span class="assess-tutor-avatar" aria-hidden="true">T</span>' +
      '<div class="assess-tutor-text">' + text + '</div></div>';
  }

  // 目录卡（单选）—— 主视觉组件
  // items: [{value, label, sub?}]，selectedValue: 当前选中 value
  function catalogSingleHtml(name, items, selectedValue) {
    return '<div class="assess-catalog" role="radiogroup" aria-label="' + esc(name) + '">' +
      items.map(function (item) {
        var sel = item.value === selectedValue;
        return '<button type="button" class="assess-cat-row' + (sel ? ' selected' : '') +
          '" role="radio" aria-checked="' + (sel ? 'true' : 'false') +
          '" data-name="' + esc(name) + '" data-value="' + esc(item.value) + '">' +
          '<span class="assess-cat-text-wrap">' +
            '<span class="assess-cat-text">' + esc(item.label) + '</span>' +
            (item.sub ? '<span class="assess-cat-sub">' + esc(item.sub) + '</span>' : '') +
          '</span>' +
          '<span class="assess-cat-dot" aria-hidden="true"></span>' +
          '</button>';
      }).join('') +
      '</div>';
  }

  // 目录卡（多选）
  function catalogMultiHtml(name, items, selectedValues) {
    var sel = selectedValues || [];
    return '<div class="assess-catalog" role="group" aria-label="' + esc(name) + '">' +
      items.map(function (item) {
        var isSel = sel.indexOf(item.value) !== -1;
        return '<button type="button" class="assess-cat-row' + (isSel ? ' selected' : '') +
          '" role="checkbox" aria-checked="' + (isSel ? 'true' : 'false') +
          '" data-name="' + esc(name) + '" data-value="' + esc(item.value) + '" data-multi="1">' +
          '<span class="assess-cat-text-wrap">' +
            '<span class="assess-cat-text">' + esc(item.label) + '</span>' +
            (item.sub ? '<span class="assess-cat-sub">' + esc(item.sub) + '</span>' : '') +
          '</span>' +
          '<span class="assess-cat-check" aria-hidden="true"></span>' +
          '</button>';
      }).join('') +
      '</div>';
  }

  // 横排 chip 网格（等宽 4 项，用于时长）
  function chipRowHtml(name, items, selectedValue) {
    return '<div class="assess-chip-row" role="radiogroup" aria-label="' + esc(name) + '">' +
      items.map(function (item) {
        var sel = item.value === selectedValue;
        return '<button type="button" class="assess-chip-cell' + (sel ? ' selected' : '') +
          '" role="radio" aria-checked="' + (sel ? 'true' : 'false') +
          '" data-name="' + esc(name) + '" data-value="' + esc(item.value) + '">' +
          esc(item.label) +
          '</button>';
      }).join('') +
      '</div>';
  }

  // 段落卡（用于 R4，3 选 1）
  function paragraphCardHtml(name, items, selectedValue) {
    return '<div class="assess-paragraphs" role="radiogroup" aria-label="' + esc(name) + '">' +
      items.map(function (item) {
        var sel = item.value === selectedValue;
        return '<button type="button" class="assess-para-card' + (sel ? ' selected' : '') +
          '" role="radio" aria-checked="' + (sel ? 'true' : 'false') +
          '" data-name="' + esc(name) + '" data-value="' + esc(item.value) + '">' +
          '<span class="assess-para-en">' + esc(item.text) + '</span>' +
          '<span class="assess-para-tier">Level · ' + esc(item.tierLabel) + '</span>' +
          '</button>';
      }).join('') +
      '</div>';
  }

  // 通用：按钮点选（single / multi）绑定
  function bindChoices(scope, onChange) {
    scope.addEventListener('click', function (e) {
      var btn = e.target.closest('.assess-cat-row, .assess-chip-cell, .assess-para-card');
      if (!btn || !scope.contains(btn)) return;
      var name = btn.getAttribute('data-name');
      var value = btn.getAttribute('data-value');
      var isMulti = btn.getAttribute('data-multi') === '1';
      var group = btn.parentElement;

      if (isMulti) {
        var was = btn.classList.toggle('selected');
        btn.setAttribute('aria-checked', was ? 'true' : 'false');
      } else {
        Array.prototype.forEach.call(
          group.querySelectorAll('[data-name="' + name + '"]'),
          function (el) {
            el.classList.remove('selected');
            el.setAttribute('aria-checked', 'false');
          }
        );
        btn.classList.add('selected');
        btn.setAttribute('aria-checked', 'true');
      }
      if (onChange) onChange(name, value, isMulti);
    });
  }

  // 从 group 内提取当前选择
  function readGroupSingle(scope, name) {
    var el = scope.querySelector('[data-name="' + name + '"].selected');
    return el ? el.getAttribute('data-value') : null;
  }
  function readGroupMulti(scope, name) {
    return Array.prototype.slice.call(
      scope.querySelectorAll('[data-name="' + name + '"].selected')
    ).map(function (el) { return el.getAttribute('data-value'); });
  }

  // ---- 渲染 ----
  function render(container) {
    if (!state) state = freshState();
    container.innerHTML =
      '<div class="page assess-page" data-page="assessment">' +
      progressHtml(state.round) +
      '<div id="assess-body" class="assess-body"></div>' +
      '</div>';
    var body = container.querySelector('#assess-body');
    renderRound(body);
  }

  function renderRound(body) {
    if (state.round === 1) return renderRound1(body);
    if (state.round === 2) return renderRound2(body);
    if (state.round === 3) return renderRound3(body);
    if (state.round === 4) return renderRound4(body);
    if (state.round === 5) return renderRound5(body);
  }

  function goNext(body) {
    state.round += 1;
    var container = body.closest('.assess-page');
    var progressWrap = container.querySelector('.assess-progress');
    var label = container.querySelector('.assess-progress-label');
    if (progressWrap) progressWrap.querySelector('.assess-progress-bar').style.width =
      Math.round((state.round - 1) / TOTAL_ROUNDS * 100) + '%';
    if (label) label.textContent = '第 ' + Math.min(state.round, TOTAL_ROUNDS) + ' / ' + TOTAL_ROUNDS + ' 轮';
    body.scrollTop = 0;
    renderRound(body);
  }

  // R1 · 自我申报（3 题选择）
  function renderRound1(body) {
    var sr = state.answers.selfReport;
    body.innerHTML =
      tutorBubble('你好！我是你的英语私教。先了解一下你的情况——都是选择题，不用打字。') +
      '<div class="assess-q-block">' +
        '<div class="assess-q-label">你学英语大概多久了？</div>' +
        catalogSingleHtml('history', LEARNING_HISTORY, sr.history) +
      '</div>' +
      '<div class="assess-q-block">' +
        '<div class="assess-q-label">这次学习主要想覆盖哪些场景？<span class="assess-q-hint">可多选</span></div>' +
        catalogMultiHtml('goals', GOAL_SCENARIOS, sr.goals) +
      '</div>' +
      '<div class="assess-q-block">' +
        '<div class="assess-q-label">每天大概能花多少时间学？</div>' +
        chipRowHtml('dailyMinutes', DAILY_MINUTES, sr.dailyMinutes) +
      '</div>' +
      '<div class="assess-actions">' +
        '<button type="button" id="r1-next" class="assess-btn-primary" disabled>下一步</button>' +
      '</div>';

    function refresh() {
      var history = readGroupSingle(body, 'history');
      var goals = readGroupMulti(body, 'goals');
      var mins = readGroupSingle(body, 'dailyMinutes');
      state.answers.selfReport = {
        history: history,
        goals: goals,
        dailyMinutes: mins == null ? null : parseInt(mins, 10)
      };
      body.querySelector('#r1-next').disabled = !(history && goals.length && mins);
    }

    bindChoices(body, refresh);
    body.querySelector('#r1-next').addEventListener('click', function () {
      if (this.disabled) return;
      goNext(body);
    });
  }

  // R2 · 阅读理解（3 题目录卡）
  function renderRound2(body) {
    var current = state.answers.reading || {};
    var qBlocks = READING_QUESTIONS.map(function (item, idx) {
      var opts = item.options.map(function (opt, oi) {
        return { value: String(oi), label: opt };
      });
      return '<div class="assess-q-block">' +
        '<div class="assess-q-label">' + (idx + 1) + '. ' + esc(item.q) + '</div>' +
        catalogSingleHtml(item.id, opts, current[item.id] != null ? String(current[item.id]) : null) +
        '</div>';
    }).join('');

    body.innerHTML =
      tutorBubble('先读一段短文，再回答几个理解性问题。') +
      '<div class="assess-passage">' + esc(READING_PASSAGE) + '</div>' +
      qBlocks +
      '<div class="assess-actions">' +
        '<button type="button" id="r2-next" class="assess-btn-primary" disabled>下一步</button>' +
      '</div>';

    function refresh() {
      var reading = {};
      var complete = true;
      READING_QUESTIONS.forEach(function (item) {
        var v = readGroupSingle(body, item.id);
        reading[item.id] = v == null ? null : parseInt(v, 10);
        if (v == null) complete = false;
      });
      state.answers.reading = reading;
      body.querySelector('#r2-next').disabled = !complete;
    }

    bindChoices(body, refresh);
    body.querySelector('#r2-next').addEventListener('click', function () {
      if (this.disabled) return;
      goNext(body);
    });
  }

  // R3 · 词汇多选（保留原 chip 网格视觉）
  function renderRound3(body) {
    var known = state.answers.vocabKnown || [];
    var wordsHtml = VOCAB_WORDS.map(function (item) {
      var isSel = known.indexOf(item.word) !== -1;
      return '<button type="button" class="assess-chip-check' + (isSel ? ' selected' : '') +
        '" role="checkbox" aria-checked="' + (isSel ? 'true' : 'false') +
        '" data-name="vocab" data-value="' + esc(item.word) + '" data-multi="1">' +
        esc(item.word) +
        '</button>';
    }).join('');

    body.innerHTML =
      tutorBubble('下面这些单词，勾选出你认识的（知道大概意思就算认识）。') +
      '<div class="assess-vocab-grid" role="group" aria-label="vocab">' + wordsHtml + '</div>' +
      '<div class="assess-actions">' +
        '<button type="button" id="r3-next" class="assess-btn-primary">下一步</button>' +
      '</div>';

    // chip-check 单独处理 toggle
    body.querySelector('.assess-vocab-grid').addEventListener('click', function (e) {
      var btn = e.target.closest('.assess-chip-check');
      if (!btn) return;
      var was = btn.classList.toggle('selected');
      btn.setAttribute('aria-checked', was ? 'true' : 'false');
    });

    body.querySelector('#r3-next').addEventListener('click', function () {
      var checked = Array.prototype.slice.call(
        body.querySelectorAll('.assess-chip-check.selected')
      ).map(function (el) { return el.getAttribute('data-value'); });
      state.answers.vocabKnown = checked;
      goNext(body);
    });
  }

  // R4 · 输出能力（三段选一段）
  function renderRound4(body) {
    body.innerHTML =
      tutorBubble('最后一题。下面三段是「跟新同事自我介绍」的三种版本——选一段<b>最像你现在能说出来的水平</b>就好。') +
      paragraphCardHtml('outputLevel', OUTPUT_SAMPLES, state.answers.outputLevel) +
      '<div class="assess-actions">' +
        '<button type="button" id="r4-next" class="assess-btn-primary" disabled>生成我的评估结果</button>' +
      '</div>';

    function refresh() {
      var v = readGroupSingle(body, 'outputLevel');
      state.answers.outputLevel = v;
      body.querySelector('#r4-next').disabled = !v;
    }
    bindChoices(body, refresh);
    body.querySelector('#r4-next').addEventListener('click', function () {
      if (this.disabled) return;
      goNext(body);
    });
  }

  // R5 · AI 综合评定
  function renderRound5(body) {
    body.innerHTML =
      tutorBubble('好的，正在根据这几轮的表现帮你综合评定……') +
      '<div class="assess-loading">分析中 <span class="assess-dots">...</span></div>';

    finalizeAssessment(state.answers, function (result) {
      var record = {
        status: 'completed',
        level: result.level,
        strengths: result.strengths,
        weaknesses: result.weaknesses,
        recommendation: result.recommendation,
        source: result.source,
        completedAt: new Date().toISOString(),
        answers: state.answers
      };
      saveResult(record);
      renderResult(body, record);
    });
  }

  function renderResult(body, record) {
    var strengthsHtml = record.strengths.map(function (s) {
      return '<li class="assess-result-strength">' + esc(s) + '</li>';
    }).join('');
    var weaknessesHtml = record.weaknesses.map(function (s) {
      return '<li class="assess-result-weakness">' + esc(s) + '</li>';
    }).join('');

    body.innerHTML =
      '<div class="assess-result" data-testid="assess-result">' +
      '<div class="assess-result-level-label">你的英语水平大约是</div>' +
      '<div class="assess-result-level" data-testid="assess-level">' + esc(record.level) + '</div>' +
      '<div class="assess-result-section"><h3>强项</h3><ul>' + strengthsHtml + '</ul></div>' +
      '<div class="assess-result-section"><h3>待提升</h3><ul>' + weaknessesHtml + '</ul></div>' +
      '<div class="assess-result-section"><h3>学习建议</h3><p>' + esc(record.recommendation) + '</p></div>' +
      '<button id="assess-start-learning" class="assess-btn-primary" data-testid="assess-start-learning">开始学习</button>' +
      '</div>';

    body.querySelector('#assess-start-learning').addEventListener('click', function () {
      state = null; // 重置内存状态，供下次"重新测评"使用
      window.App.navigate('home');
    });
  }

  // ---- 对外接口 ----
  function retake() {
    clearResult();
    state = freshState();
    window.App.navigate('assessment');
  }

  window.App = window.App || {};
  window.App.pages = window.App.pages || {};
  window.App.pages.assessment = { render: render };
  window.App.assessment = {
    loadResult: loadResult,
    isCompleted: function () {
      var r = loadResult();
      return !!(r && r.status === 'completed');
    },
    retake: retake
  };
})();
