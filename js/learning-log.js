/* js/learning-log.js —— 学习活动打卡日志：记录"今天学习过"，用于连续天数（Streak）计算
 * 存储：localStorage['lt_activity_log_v1'] = string[]（YYYY-MM-DD 去重数组，按时间升序）
 * 任何"算作学习"的动作都应调用 recordToday()：
 *   - 词库：切换记忆状态 / 复习评价（js/vocab.js）
 *   - 语法：答一道练习题（js/grammar.js）
 *   - 学习计划：勾选任务完成（js/plan.js）
 *   - 对话：发送一轮对话（未来对话模块接入时调用）
 */
(function () {
  var STORAGE_KEY = 'lt_activity_log_v1';

  function pad2(n) {
    return n < 10 ? '0' + n : '' + n;
  }

  // 本地日期字符串（避免 toISOString 转 UTC 导致的跨时区日期偏移，
  // 例如 UTC+8 用户在本地午夜后调用 toISOString 会拿到"昨天"的日期）
  function todayStr() {
    var d = new Date();
    return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
  }

  function loadLog() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      var arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch (e) {
      return [];
    }
  }

  function saveLog(arr) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
    } catch (e) {
      console.warn('学习日志保存失败:', e);
    }
  }

  function recordToday() {
    var log = loadLog();
    var today = todayStr();
    if (log.indexOf(today) === -1) {
      log.push(today);
      log.sort();
      saveLog(log);
    }
  }

  function addDays(dateStr, days) {
    var parts = dateStr.split('-');
    var d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    d.setDate(d.getDate() + days);
    return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
  }

  // 从今天往前数，连续出现在日志里的天数（今天没打卡也不清零，
  // 但今天没打卡时 streak 按"昨天为止"计算，不含今天）
  function getStreak() {
    var log = loadLog();
    var set = {};
    log.forEach(function (d) { set[d] = true; });
    var today = todayStr();
    var cursor = set[today] ? today : addDays(today, -1);
    var streak = 0;
    while (set[cursor]) {
      streak += 1;
      cursor = addDays(cursor, -1);
    }
    return streak;
  }

  function getLog() {
    return loadLog();
  }

  window.App = window.App || {};
  window.App.learningLog = {
    recordToday: recordToday,
    getStreak: getStreak,
    getLog: getLog
  };
})();
