/* ai.js —— AI 对话客户端（可插拔）
 * 评估对话理论上走 Hermes Agent / OpenAI 兼容网关（如 lboneapi），
 * 但本 PWA 是纯静态站点，不能内置密钥。所以设计为：
 *   1. 用户可在本地配置网关（localStorage: lt_ai_config = {baseUrl, apiKey, model}）
 *   2. 未配置或请求失败时，自动回退到本地规则评分（deterministic, 离线可用）
 * 这样评估功能在没有网络/没有 key 的情况下依然完整可用，
 * 有 key 时可无缝切换为真实 AI 生成的个性化点评。
 */
(function () {
  var CONFIG_KEY = 'lt_ai_config';
  var DEFAULT_BASE_URL = 'https://lboneapi.longbridge-inc.com/v1';
  var DEFAULT_MODEL = 'qwen3.5-plus';

  function getConfig() {
    try {
      var raw = window.localStorage.getItem(CONFIG_KEY);
      if (!raw) return null;
      var cfg = JSON.parse(raw);
      if (cfg && cfg.apiKey) return cfg;
      return null;
    } catch (e) {
      return null;
    }
  }

  function setConfig(cfg) {
    window.localStorage.setItem(CONFIG_KEY, JSON.stringify(cfg));
  }

  /* 调用 OpenAI 兼容 chat/completions；失败抛异常，由调用方回退 */
  function chatCompletion(messages, opts) {
    var cfg = getConfig();
    if (!cfg) return Promise.reject(new Error('no-ai-config'));
    opts = opts || {};
    var baseUrl = cfg.baseUrl || DEFAULT_BASE_URL;
    var model = cfg.model || DEFAULT_MODEL;
    var controller = new AbortController();
    var timeout = setTimeout(function () { controller.abort(); }, opts.timeoutMs || 15000);

    return fetch(baseUrl.replace(/\/$/, '') + '/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + cfg.apiKey
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        temperature: opts.temperature != null ? opts.temperature : 0.4
      }),
      signal: controller.signal
    }).then(function (res) {
      clearTimeout(timeout);
      if (!res.ok) throw new Error('ai-http-' + res.status);
      return res.json();
    }).then(function (data) {
      var content = data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
      if (!content) throw new Error('ai-empty-response');
      return content;
    }).catch(function (err) {
      clearTimeout(timeout);
      throw err;
    });
  }

  window.App = window.App || {};
  window.App.ai = {
    getConfig: getConfig,
    setConfig: setConfig,
    chatCompletion: chatCompletion,
    isConfigured: function () { return !!getConfig(); }
  };
})();
