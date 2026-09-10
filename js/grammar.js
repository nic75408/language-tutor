/* 语法模块 —— 语法知识点列表 + 详情页（规则说明 + 正反例 + 小练习）
 * 路由：
 *   #grammar          列表页，展示 10 个知识点，标注难度
 *   #grammar/<id>     详情页，展示单个知识点的完整内容
 * 数据来自 js/grammar-data.js（window.App.grammarData），不依赖 AI 实时生成。
 */
(function () {
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  /* rule/why 等字段允许 <em>/<strong> 富文本标记（语法讲解需要强调关键词），
   * 但要防止用户输入被当作 HTML 注入——本模块数据是硬编码常量，非用户输入，
   * 因此这里对白名单标签放行，其余照常转义。 */
  function renderRichText(str) {
    var placeholder = [];
    var masked = String(str).replace(/<(em|strong)>([\s\S]*?)<\/\1>/g, function (m, tag, inner) {
      var idx = placeholder.length;
      placeholder.push('<' + tag + '>' + escapeHtml(inner) + '</' + tag + '>');
      return '\u0000' + idx + '\u0000';
    });
    masked = escapeHtml(masked);
    return masked.replace(/\u0000(\d+)\u0000/g, function (m, idx) {
      return placeholder[Number(idx)];
    });
  }

  function difficultyLabel(d) {
    return d === 'advanced' ? '进阶' : '基础';
  }

  function renderList(container) {
    var points = window.App.grammarData.getAll();
    var cards = points.map(function (p) {
      return (
        '<button class="grammar-card" data-id="' + p.id + '">' +
          '<span class="grammar-badge ' + p.difficulty + '">' + difficultyLabel(p.difficulty) + '</span>' +
          '<h2 class="grammar-card-title" style="margin-top:8px;">' + escapeHtml(p.title) + '</h2>' +
          '<p class="grammar-card-summary">' + escapeHtml(p.summary) + '</p>' +
        '</button>'
      );
    }).join('');

    container.innerHTML =
      '<div class="page" data-page="grammar">' +
        '<h1 class="page-title">📐 语法讲堂</h1>' +
        '<div class="grammar-list">' + cards + '</div>' +
      '</div>';

    container.querySelectorAll('.grammar-card').forEach(function (btn) {
      btn.addEventListener('click', function () {
        window.App.navigateTo('grammar', btn.getAttribute('data-id'));
      });
    });
  }

  function renderExample(item) {
    var correctHtml = item.correct.map(function (ex) {
      return (
        '<div class="grammar-example correct">' +
          '<div class="grammar-example-en"><span class="grammar-example-mark">✅</span>' + escapeHtml(ex.en) + '</div>' +
          '<div class="grammar-example-zh">' + escapeHtml(ex.zh) + '</div>' +
        '</div>'
      );
    }).join('');

    var incorrectHtml = item.incorrect.map(function (ex) {
      return (
        '<div class="grammar-example incorrect">' +
          '<div class="grammar-example-en"><span class="grammar-example-mark">❌</span>' + escapeHtml(ex.wrong) + '</div>' +
          '<div class="grammar-example-why">为什么错：' + escapeHtml(ex.why) + '</div>' +
          '<div class="grammar-example-right">✅ 正确写法：' + escapeHtml(ex.right) + '</div>' +
        '</div>'
      );
    }).join('');

    return (
      '<div class="grammar-section">' +
        '<p class="grammar-section-label">正确例句</p>' + correctHtml +
      '</div>' +
      '<div class="grammar-section">' +
        '<p class="grammar-section-label">常见错误</p>' + incorrectHtml +
      '</div>'
    );
  }

  function renderQuiz(item) {
    var quizHtml = item.practice.map(function (q, qIdx) {
      var optionsHtml = q.options.map(function (opt, oIdx) {
        return (
          '<button class="grammar-quiz-option" data-q="' + qIdx + '" data-opt="' + oIdx + '">' +
            escapeHtml(opt) +
          '</button>'
        );
      }).join('');

      return (
        '<div class="grammar-quiz" data-quiz="' + qIdx + '">' +
          '<p class="grammar-quiz-question">🎯 ' + escapeHtml(q.question) + '</p>' +
          '<div class="grammar-quiz-options">' + optionsHtml + '</div>' +
          '<div class="grammar-quiz-feedback" data-feedback="' + qIdx + '"></div>' +
        '</div>'
      );
    }).join('');

    return '<div class="grammar-section"><p class="grammar-section-label">小练习</p>' + quizHtml + '</div>';
  }

  function bindQuizEvents(container, item) {
    container.querySelectorAll('.grammar-quiz-option').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var qIdx = Number(btn.getAttribute('data-q'));
        var oIdx = Number(btn.getAttribute('data-opt'));
        var quizWrap = container.querySelector('.grammar-quiz[data-quiz="' + qIdx + '"]');
        var q = item.practice[qIdx];
        var isCorrect = oIdx === q.answerIndex;

        // 立即反馈：禁用本题所有选项，标记选中项与正确项
        quizWrap.querySelectorAll('.grammar-quiz-option').forEach(function (opt) {
          opt.disabled = true;
          var optIdx = Number(opt.getAttribute('data-opt'));
          if (optIdx === oIdx) {
            opt.classList.add(isCorrect ? 'picked-correct' : 'picked-wrong');
          }
          if (!isCorrect && optIdx === q.answerIndex) {
            opt.classList.add('reveal-correct');
          }
        });

        var feedback = container.querySelector('.grammar-quiz-feedback[data-feedback="' + qIdx + '"]');
        feedback.classList.add(isCorrect ? 'is-correct' : 'is-wrong');
        feedback.textContent = (isCorrect ? '✅ 答对了！' : '❌ 答错了。') + ' ' + q.explanation;
      });
    });
  }

  function renderDetail(container, id) {
    var item = window.App.grammarData.getById(id);
    if (!item) {
      container.innerHTML =
        '<div class="page" data-page="grammar-detail">' +
          '<button class="grammar-header-back" id="grammar-back">←</button>' +
          '<h1 class="page-title">未找到该语法知识点</h1>' +
        '</div>';
      container.querySelector('#grammar-back').addEventListener('click', function () {
        window.App.navigateTo('grammar');
      });
      return;
    }

    container.innerHTML =
      '<div class="page" data-page="grammar-detail">' +
        '<button class="grammar-header-back" id="grammar-back" aria-label="返回">←</button>' +
        '<span class="grammar-badge ' + item.difficulty + '">' + difficultyLabel(item.difficulty) + '</span>' +
        '<h1 class="grammar-detail-title" style="margin-top:8px;">' + escapeHtml(item.title) + '</h1>' +
        '<div class="grammar-section">' +
          '<p class="grammar-section-label">规则说明</p>' +
          '<p class="grammar-rule">' + renderRichText(item.rule) + '</p>' +
        '</div>' +
        renderExample(item) +
        renderQuiz(item) +
      '</div>';

    container.querySelector('#grammar-back').addEventListener('click', function () {
      window.App.navigateTo('grammar');
    });

    bindQuizEvents(container, item);
  }

  function render(container, param) {
    if (param) {
      renderDetail(container, param);
    } else {
      renderList(container);
    }
  }

  window.App = window.App || {};
  window.App.pages = window.App.pages || {};
  window.App.pages.grammar = { render: render };
})();
