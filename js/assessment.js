/* assessment.js —— 水平评估模块
 * 首次使用时，导师通过 5 轮交互对话评估用户英语水平，输出 CEFR 等级 + 强弱项 + 学习建议。
 * 存储：localStorage['lt_assessment_v1'] = {
 *   status: 'completed',
 *   level: 'A1'..'C2',
 *   strengths: string[],
 *   weaknesses: string[],
 *   recommendation: string,
 *   completedAt: ISO string,
 *   answers: {...}   // 原始作答，供以后回看/重测参考
 * }
 */
(function () {
  var STORAGE_KEY = 'lt_assessment_v1';

  // ---- 静态内容（按 PRODUCT.md "不做：标准化测试题库用 AI 动态生成" —— 固定题面即可） ----
  var READING_PASSAGE =
    'Maria arrived at the airport two hours before her flight. She checked in at the counter, ' +
    'then went through security. At the gate, she realized she had forgotten her phone charger, ' +
    'so she quickly bought one at a nearby shop before boarding.';

  var READING_QUESTIONS = [
    {
      id: 'r1',
      q: '玛丽亚是什么时候到达机场的？',
      options: ['起飞前两小时', '起飞前十分钟', '起飞后'],
      answer: 0
    },
    {
      id: 'r2',
      q: '她在登机口发现自己忘了带什么？',
      options: ['护照', '手机充电器', '机票'],
      answer: 1
    },
    {
      id: 'r3',
      q: '她后来怎么解决这个问题？',
      options: ['借了别人的', '在附近商店买了一个', '没有解决就登机了'],
      answer: 1
    }
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

  var SCENARIO_PROMPT = 'Please introduce yourself to a new colleague: your name, your job, and one hobby you enjoy.';

  var TOTAL_ROUNDS = 5;

  // ---- 状态 ----
  var state = null;

  function freshState() {
    return {
      round: 1,
      answers: {
        selfReport: { yearsLearning: '', toolsUsed: '', goal: '' },
        reading: {},
        vocabKnown: [],
        writing: ''
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

  // ---- 规则评分（AI 不可用时的本地回退，确保离线可用） ----
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

    var writing = (answers.writing || '').trim();
    var writingWordCount = writing ? writing.split(/\s+/).length : 0;
    var writingHasComplexClause = /\bbecause\b|\bwhich\b|\balthough\b|\bwhile\b|\bwhen\b/i.test(writing);

    // 综合打分：0-100
    var score = 0;
    score += readingRatio * 30;
    score += Math.min(vocabKnownCount / VOCAB_WORDS.length, 1) * 25;
    score += Math.min(highestTierKnown / 5, 1) * 15;
    score += Math.min(writingWordCount / 40, 1) * 20;
    score += writingHasComplexClause ? 10 : 0;

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

    if (writingWordCount >= 25) strengths.push('写作输出：能自由表达，句子长度足够');
    else weaknesses.push('写作/口语输出：表达偏简短，需要多练习自由造句');

    if (writingHasComplexClause) strengths.push('语法结构：会使用从句，句式有一定复杂度');
    else weaknesses.push('语法结构：基本只用简单句，从句/连接词用得少');

    if (strengths.length === 0) strengths.push('愿意主动完成评估，学习态度积极');
    if (weaknesses.length === 0) weaknesses.push('整体表现均衡，暂无明显短板');

    var recommendation =
      '建议从 ' + level + ' 对应难度的场景对话练起，优先补齐：' + weaknesses[0].split('：')[0] +
      '。可在"对话"模块选择贴近你目标（旅行/日常/工作）的场景，每天 15-20 分钟坚持练习。';

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

    var userPayload = JSON.stringify({
      selfReport: answers.selfReport,
      readingQuestions: READING_QUESTIONS.map(function (q) { return q.q; }),
      readingAnswerCorrectCount: READING_QUESTIONS.filter(function (item) {
        return answers.reading[item.id] === item.answer;
      }).length,
      readingTotal: READING_QUESTIONS.length,
      vocabKnown: answers.vocabKnown,
      vocabTotal: VOCAB_WORDS.map(function (v) { return v.word; }),
      writingSample: answers.writing
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

  // ---- 渲染 ----
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

  function tutorBubble(text) {
    return '<div class="assess-tutor-msg"><span class="assess-tutor-avatar" aria-hidden="true">T</span>' +
      '<div class="assess-tutor-text">' + text + '</div></div>';
  }

  function goNext(body) {
    state.round += 1;
    var container = body.closest('.assess-page');
    var progressWrap = container.querySelector('.assess-progress');
    var label = container.querySelector('.assess-progress-label');
    if (progressWrap) progressWrap.querySelector('.assess-progress-bar').style.width =
      Math.round((state.round - 1) / TOTAL_ROUNDS * 100) + '%';
    if (label) label.textContent = '第 ' + Math.min(state.round, TOTAL_ROUNDS) + ' / ' + TOTAL_ROUNDS + ' 轮';
    renderRound(body);
  }

  function renderRound1(body) {
    body.innerHTML =
      tutorBubble('你好！我是你的英语私教。开始之前，先聊几句了解你的情况——中文回答就好。') +
      '<form id="r1-form" class="assess-form">' +
      '<label class="assess-label">你学英语大概多久了？</label>' +
      '<input class="assess-input" name="yearsLearning" placeholder="例如：断断续续 5 年" required>' +
      '<label class="assess-label">你用过什么学习工具或方法？</label>' +
      '<input class="assess-input" name="toolsUsed" placeholder="例如：多邻国、背单词 App">' +
      '<label class="assess-label">你这次学习的目标是什么？</label>' +
      '<input class="assess-input" name="goal" placeholder="例如：能自如地日常对话" required>' +
      '<button type="submit" class="assess-btn-primary">下一步</button>' +
      '</form>';

    body.querySelector('#r1-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var fd = new FormData(e.target);
      state.answers.selfReport = {
        yearsLearning: (fd.get('yearsLearning') || '').trim(),
        toolsUsed: (fd.get('toolsUsed') || '').trim(),
        goal: (fd.get('goal') || '').trim()
      };
      goNext(body);
    });
  }

  function renderRound2(body) {
    var questionsHtml = READING_QUESTIONS.map(function (item, idx) {
      var optionsHtml = item.options.map(function (opt, oi) {
        return '<label class="assess-radio">' +
          '<input type="radio" name="' + item.id + '" value="' + oi + '" required> ' + esc(opt) +
          '</label>';
      }).join('');
      return '<div class="assess-question">' +
        '<p class="assess-q-text">' + (idx + 1) + '. ' + esc(item.q) + '</p>' +
        optionsHtml +
        '</div>';
    }).join('');

    body.innerHTML =
      tutorBubble('先读一段短文，再回答几个理解性问题（中文回答即可）。') +
      '<div class="assess-passage">' + esc(READING_PASSAGE) + '</div>' +
      '<form id="r2-form" class="assess-form">' +
      questionsHtml +
      '<button type="submit" class="assess-btn-primary">下一步</button>' +
      '</form>';

    body.querySelector('#r2-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var fd = new FormData(e.target);
      var reading = {};
      READING_QUESTIONS.forEach(function (item) {
        var v = fd.get(item.id);
        reading[item.id] = v == null ? null : parseInt(v, 10);
      });
      state.answers.reading = reading;
      goNext(body);
    });
  }

  function renderRound3(body) {
    var wordsHtml = VOCAB_WORDS.map(function (item) {
      return '<label class="assess-chip-check">' +
        '<input type="checkbox" name="vocab" value="' + esc(item.word) + '"> ' + esc(item.word) +
        '</label>';
    }).join('');

    body.innerHTML =
      tutorBubble('下面这些单词，勾选出你认识的（知道大概意思就算认识）。') +
      '<form id="r3-form" class="assess-form">' +
      '<div class="assess-vocab-grid">' + wordsHtml + '</div>' +
      '<button type="submit" class="assess-btn-primary">下一步</button>' +
      '</form>';

    body.querySelector('#r3-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var checked = Array.prototype.slice.call(
        body.querySelectorAll('input[name="vocab"]:checked')
      ).map(function (el) { return el.value; });
      state.answers.vocabKnown = checked;
      goNext(body);
    });
  }

  function renderRound4(body) {
    body.innerHTML =
      tutorBubble('最后一轮，请你自由发挥。用英语写一写（或者语音说也可以，先写下来）：') +
      '<div class="assess-scenario">' + esc(SCENARIO_PROMPT) + '</div>' +
      '<form id="r4-form" class="assess-form">' +
      '<textarea class="assess-textarea" name="writing" rows="5" placeholder="Type in English..." required></textarea>' +
      '<button type="submit" class="assess-btn-primary">生成我的评估结果</button>' +
      '</form>';

    body.querySelector('#r4-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var fd = new FormData(e.target);
      state.answers.writing = (fd.get('writing') || '').trim();
      goNext(body);
    });
  }

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
