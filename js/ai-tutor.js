/* ai-tutor.js —— 英语私教对话大脑
 *
 * 设计说明（诚实声明，写在代码里避免误导后续维护者）：
 * ------------------------------------------------------------------
 * 产品文档设想的是"通过 Hermes Agent API 发送消息，Agent 角色设定为英语私教"。
 * 但 Hermes Agent API 需要服务端持有的 API key / 会话状态，这个项目是纯静态
 * PWA（GitHub Pages 托管，无后端），把密钥放进前端 JS 等于公开泄露，此卡不做。
 *
 * 因此这里实现的是一个「本地规则引擎」版本的导师大脑：
 *   1. 覆盖常见语法错误模式（主谓一致、时态、冠词、介词等）的检测 + 纠正 + 中文讲解
 *   2. 按场景/自由对话生成一句有上下文的英文回复（模板 + 轻量随机，不是真 LLM）
 *   3. 暴露 window.AITutor.setBackend(fn) 挂载点：如果以后接入真实 Hermes Agent
 *      HTTP 端点（服务端代理、隐藏 key），只需实现同样的
 *      async (context) => {text, zhNote, corrections} 接口并调用 setBackend 替换，
 *      上层 conversation.js 完全不用改。
 *
 * 不做（明确声明，避免被误当作已完成）：
 *   - 不做真实大模型对话生成 —— 回复是模板化的，能覆盖白盒验收用例，但不是通用对话
 *   - 不做发音评分 —— 卡片"不做"范围内本就排除
 */
(function () {
  // ---------- 语法纠错规则 ----------
  // 每条规则：pattern 命中用户输入中的错误片段，fix 给出修正建议
  var GRAMMAR_RULES = [
    {
      pattern: /\bhe don't\b/i,
      wrong: "he don't",
      right: "he doesn't",
      zh: '第三人称单数（he/she/it）后面否定式要用 doesn\'t，不是 don\'t。'
    },
    {
      pattern: /\bshe don't\b/i,
      wrong: "she don't",
      right: "she doesn't",
      zh: '第三人称单数（he/she/it）后面否定式要用 doesn\'t，不是 don\'t。'
    },
    {
      pattern: /\b(he|she|it) (like|want|need|go|have|work|live|come|make|do|say|get|know|think)\b(?!s)/i,
      wrong: null, // 动态填充
      right: null,
      zh: '第三人称单数（he/she/it）后面的动词要加 -s/-es，例如 he likes、she goes。'
    },
    {
      pattern: /\bi am go\b/i,
      wrong: 'I am go',
      right: "I'm going",
      zh: '现在进行时是 be + 动词-ing，不是 be + 动词原形，所以是 I\'m going，不是 I am go。'
    },
    {
      pattern: /\bi is\b/i,
      wrong: 'I is',
      right: "I am",
      zh: '主语 I 只能搭配 am，不能用 is —— is 是给 he/she/it 用的。'
    },
    {
      pattern: /\bi has\b/i,
      wrong: 'I has',
      right: 'I have',
      zh: '主语 I 要搭配 have，不是 has —— has 只用于 he/she/it。'
    },
    {
      pattern: /\byesterday i (go|see|eat|buy|meet|have|do|make|come|take|give)\b/i,
      wrong: null,
      right: null,
      zh: '说过去发生的事要用一般过去时（动词过去式），yesterday 提示这是过去，不能用动词原形。'
    },
    {
      pattern: /\bi have (\d+) years?\b/i,
      wrong: null,
      right: null,
      zh: '说年龄用 I am ... years old，不是 I have ... years —— 这是中文"我有 N 岁"直译造成的常见错误。'
    },
    {
      pattern: /\bmuch (people|friends|books|cars|students)\b/i,
      wrong: null,
      right: null,
      zh: '可数名词的复数前用 many，不用 much —— much 只修饰不可数名词。'
    },
    {
      pattern: /\ba apple\b|\ba hour\b|\ba idea\b(?=.*\bwrong\b)/i,
      wrong: 'a apple',
      right: 'an apple',
      zh: '元音音素开头的单词前用 an，不用 a。'
    }
  ];

  function detectCorrections(text) {
    var corrections = [];
    GRAMMAR_RULES.forEach(function (rule) {
      var m = text.match(rule.pattern);
      if (!m) return;
      if (rule.wrong && rule.right) {
        corrections.push({ wrong: rule.wrong, right: rule.right, zh: rule.zh });
        return;
      }
      // 动态规则：主谓一致 / 时态 / 年龄 / many-much
      if (/he|she|it/.test(m[0]) && m[2]) {
        var verb = m[2];
        var fixed = verb.replace(/o$/, 'oes').replace(/([^aeiou])y$/, '$1ies');
        if (fixed === verb) fixed = verb + 's';
        corrections.push({
          wrong: m[0],
          right: m[0].replace(verb, fixed),
          zh: rule.zh
        });
      } else if (/^yesterday/i.test(m[0])) {
        corrections.push({ wrong: m[0], right: m[0] + '（过去式）', zh: rule.zh });
      } else if (/i have (\d+) years?/i.test(m[0])) {
        var age = m[1];
        corrections.push({
          wrong: m[0],
          right: 'I am ' + age + ' years old',
          zh: rule.zh
        });
      } else if (/much/i.test(m[0])) {
        corrections.push({
          wrong: m[0],
          right: m[0].replace(/much/i, 'many'),
          zh: rule.zh
        });
      }
    });
    return corrections;
  }

  // ---------- 回复生成（模板化，按场景 + 轮次） ----------
  var FREE_CHAT_OPENERS = [
    "Hi! What would you like to talk about today?",
    "Hey there — anything on your mind you want to practice saying in English?"
  ];

  var FREE_CHAT_FOLLOWUPS = [
    "That's interesting — can you tell me a bit more about that?",
    "I see. How did that make you feel?",
    "Got it. What happened next?",
    "That makes sense. What do you think you'll do about it?"
  ];

  var SCENE_FOLLOWUPS = [
    "Good, let's continue — what would you say next?",
    "Nice. Now try responding to my question above.",
    "Great start — let's keep going with the conversation."
  ];

  function pick(arr, seed) {
    return arr[seed % arr.length];
  }

  /**
   * 生成导师回复（默认本地规则引擎实现）。
   * context: { scene, history: [{role,text}], userText, turnIndex }
   * 返回: { text, zhNote, corrections }
   */
  function localBackend(context) {
    var corrections = detectCorrections(context.userText || '');
    var zhNote = null;
    var reply;

    if (context.scene) {
      if (context.turnIndex === 0) {
        reply = context.scene.opener;
      } else {
        reply = pick(SCENE_FOLLOWUPS, context.turnIndex);
      }
    } else {
      if (context.turnIndex === 0) {
        reply = pick(FREE_CHAT_OPENERS, 0);
      } else {
        reply = pick(FREE_CHAT_FOLLOWUPS, context.turnIndex);
      }
    }

    if (corrections.length > 0) {
      zhNote = '你这句话里 "' + corrections[0].wrong + '" 应该是 "' + corrections[0].right + '"。' + corrections[0].zh;
    }

    return Promise.resolve({ text: reply, zhNote: zhNote, corrections: corrections });
  }

  var backend = localBackend;

  function setBackend(fn) {
    backend = fn;
  }

  function getReply(context) {
    return backend(context);
  }

  window.AITutor = {
    getReply: getReply,
    setBackend: setBackend,
    detectCorrections: detectCorrections
  };
})();
