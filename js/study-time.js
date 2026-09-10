/* js/study-time.js —— 学习时长统计（近似值，App 处于前台时按秒累加）
 * 存储：localStorage['lt_study_time_v1'] = { 'YYYY-MM-DD': seconds }
 * 说明：静态 PWA 无后台服务，用 Page Visibility API 近似统计——
 *   仅当页面可见（用户正在看/操作）时才计时，每 15 秒写一次盘，
 *   切到后台/关闭标签页时自动停止累加。这是"近似值"而非精确埋点，
 *   但足够支撑"本周/本月学习时长"这个仪表盘指标。
 */
(function () {
  var STORAGE_KEY = 'lt_study_time_v1';
  var TICK_MS = 15000;
  var TICK_SECONDS = TICK_MS / 1000;

  function pad2(n) {
    return n < 10 ? '0' + n : '' + n;
  }

  // 本地日期字符串（与 learning-log.js 保持一致，避免 UTC 偏移）
  function todayStr() {
    var d = new Date();
    return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
  }

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
      console.warn('学习时长保存失败:', e);
    }
  }

  function addSeconds(seconds) {
    var data = loadAll();
    var today = todayStr();
    data[today] = (data[today] || 0) + seconds;
    saveAll(data);
  }

  function tick() {
    if (document.visibilityState === 'visible') {
      addSeconds(TICK_SECONDS);
    }
  }

  if (typeof window.setInterval === 'function') {
    window.setInterval(tick, TICK_MS);
  }

  // 日期字符串转周一为起点的本周起止范围
  function startOfWeek(d) {
    var day = d.getDay(); // 0=Sun..6=Sat
    var diff = (day === 0 ? -6 : 1 - day); // 周一为一周起点
    var monday = new Date(d);
    monday.setDate(d.getDate() + diff);
    monday.setHours(0, 0, 0, 0);
    return monday;
  }

  function getTotalSecondsSince(sinceDate) {
    var data = loadAll();
    var total = 0;
    Object.keys(data).forEach(function (dateStr) {
      var d = new Date(dateStr + 'T00:00:00');
      if (d >= sinceDate) total += data[dateStr];
    });
    return total;
  }

  function getWeekMinutes() {
    var now = new Date();
    return Math.round(getTotalSecondsSince(startOfWeek(now)) / 60);
  }

  function getMonthMinutes() {
    var now = new Date();
    var monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    return Math.round(getTotalSecondsSince(monthStart) / 60);
  }

  window.App = window.App || {};
  window.App.studyTime = {
    getWeekMinutes: getWeekMinutes,
    getMonthMinutes: getMonthMinutes
  };
})();
