/* js/quiz-log.js —— 语法练习题作答记录：{ [pointId]: { correct, total } }
 * 用于个人中心"薄弱领域提示"：按知识点统计错误率，找出错得最多的知识点。
 * 存储：localStorage['lt_quiz_log_v1']
 */
(function () {
  var STORAGE_KEY = 'lt_quiz_log_v1';

  function loadAll() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      var data = raw ? JSON.parse(raw) : {};
      return (data && typeof data === 'object') ? data : {};
    } catch (e) {
      return {};
    }
  }

  function saveAll(data) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('练习记录保存失败:', e);
    }
  }

  function record(pointId, isCorrect) {
    var data = loadAll();
    var entry = data[pointId] || { correct: 0, total: 0 };
    entry.total += 1;
    if (isCorrect) entry.correct += 1;
    data[pointId] = entry;
    saveAll(data);
  }

  // 返回错误率最高的知识点（至少答过 1 题、且有过至少 1 次答错才算"薄弱"）
  // 结果按错误率降序，最多返回 top N 个 { pointId, wrongRate, wrongCount }
  function getWeakPoints(limit) {
    var data = loadAll();
    var list = Object.keys(data).map(function (id) {
      var e = data[id];
      var wrongCount = e.total - e.correct;
      return { pointId: id, total: e.total, wrongCount: wrongCount, wrongRate: wrongCount / e.total };
    }).filter(function (item) { return item.wrongCount > 0; });

    list.sort(function (a, b) { return b.wrongRate - a.wrongRate || b.wrongCount - a.wrongCount; });
    return list.slice(0, limit || 3);
  }

  window.App = window.App || {};
  window.App.quizLog = {
    record: record,
    getWeakPoints: getWeakPoints
  };
})();
