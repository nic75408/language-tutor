/* conversation-store.js —— 对话历史的 localStorage 持久化
 * 数据结构：
 * {
 *   id, sceneId (null=自由对话), sceneTitle, startedAt, endedAt,
 *   messages: [{ role: 'user'|'tutor', text, zhNote, corrections:[{wrong,right,zh}], ts }],
 *   review: { errors:[{wrong,right,zh,count}], suggestions:[string], learned:[string] } | null
 * }
 */
(function () {
  var STORAGE_KEY = 'lt.conversations.v1';

  function loadAll() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      var data = JSON.parse(raw);
      return Array.isArray(data) ? data : [];
    } catch (e) {
      console.warn('对话历史读取失败:', e);
      return [];
    }
  }

  function saveAll(list) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.warn('对话历史保存失败:', e);
    }
  }

  function createSession(scene) {
    return {
      id: 'conv-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8),
      sceneId: scene ? scene.id : null,
      sceneTitle: scene ? scene.title : '自由对话',
      sceneIcon: scene ? scene.icon : '💬',
      startedAt: Date.now(),
      endedAt: null,
      messages: [],
      review: null
    };
  }

  function upsert(session) {
    var list = loadAll();
    var idx = list.findIndex(function (s) { return s.id === session.id; });
    if (idx === -1) {
      list.unshift(session);
    } else {
      list[idx] = session;
    }
    saveAll(list);
  }

  function getById(id) {
    return loadAll().find(function (s) { return s.id === id; }) || null;
  }

  function listSorted() {
    return loadAll().slice().sort(function (a, b) { return b.startedAt - a.startedAt; });
  }

  window.ConversationStore = { createSession: createSession, upsert: upsert, getById: getById, listSorted: listSorted };
})();
