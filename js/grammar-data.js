/* 语法数据 —— 10 个 MVP 语法知识点，硬编码（不依赖 AI 实时生成）。
 * 结构约定（供 grammar.js 消费，也供未来「对话」模块联动引用）：
 *   id          唯一标识，用于路由 #grammar/<id> 深链
 *   title       中文标题
 *   difficulty  'basic' | 'advanced'
 *   summary     一句话摘要，列表页展示
 *   rule        规则说明（中文，简洁）
 *   correct     正确例句 [{ en, zh }]
 *   incorrect   常见错误 [{ wrong, why, right }]
 *   practice    小练习 [{ question, options: [string], answerIndex, explanation }]
 *   errorTags   错误类型标签数组，供「对话」模块的纠错信息做关联跳转，
 *               例如对话里检测到 tag 'tense-present' 的错误时，
 *               可用 window.App.grammarData.findByErrorTag('tense-present')
 *               取到本知识点 id，拼出 `#grammar/${id}` 跳转链接。
 */
(function () {
  var GRAMMAR_POINTS = [
    {
      id: 'tense-present',
      title: '一般现在时 vs 现在进行时',
      difficulty: 'basic',
      summary: 'I work / I am working —— 习惯动作与此刻动作的区别',
      rule:
        '一般现在时表示<em>习惯性动作、客观事实、日常规律</em>，第三人称单数动词要加 -s/-es。' +
        '现在进行时表示<em>此刻正在发生的动作</em>或短期趋势，用 am/is/are + 动词-ing 构成。' +
        '注意：像 know、like、want、believe 这类「状态动词」一般不用进行时。',
      correct: [
        { en: 'I work at a bank.', zh: '我在一家银行工作。（习惯性事实）' },
        { en: 'She is working on a report right now.', zh: '她现在正在写一份报告。（此刻动作）' }
      ],
      incorrect: [
        { wrong: 'I am knowing the answer.', why: 'know 是状态动词，不用进行时', right: 'I know the answer.' },
        { wrong: 'She go to work every day.', why: '第三人称单数动词需加 -s', right: 'She goes to work every day.' }
      ],
      errorTags: ['tense-present', 'stative-verb-progressive'],
      practice: [
        {
          question: 'Look! The baby ___ (cry).',
          options: ['cries', 'is crying', 'cry', 'cried'],
          answerIndex: 1,
          explanation: '此刻正在发生的动作用现在进行时：is crying。'
        },
        {
          question: 'Water ___ at 100°C.',
          options: ['boils', 'is boiling', 'boil', 'boiled'],
          answerIndex: 0,
          explanation: '客观事实/科学规律用一般现在时：boils。'
        },
        {
          question: '下列哪句是正确的？',
          options: ['I am liking this song.', 'I like this song.', 'I likes this song.', 'I liked this song currently.'],
          answerIndex: 1,
          explanation: 'like 是状态动词，一般不用进行时，也要注意主语 I 不加 -s。'
        }
      ]
    },
    {
      id: 'tense-past',
      title: '一般过去时',
      difficulty: 'basic',
      summary: 'I went / I visited —— 过去已完成的动作',
      rule:
        '一般过去时表示<em>过去某一时间点已完成</em>的动作。规则动词加 -ed，不规则动词需要单独记忆过去式。' +
        '常与具体过去时间状语连用：yesterday、last week、in 2020。注意不要和现在完成时（have done）混用。',
      correct: [
        { en: 'I visited Paris last summer.', zh: '我去年夏天去了巴黎。' },
        { en: 'They went to the cinema yesterday.', zh: '他们昨天去看电影了。' }
      ],
      incorrect: [
        { wrong: 'I have visited Paris last summer.', why: 'have+过去分词是现在完成时，不能与具体过去时间(last summer)连用', right: 'I visited Paris last summer.' },
        { wrong: 'She goed home early.', why: 'go 是不规则动词，过去式是 went，不是 goed', right: 'She went home early.' }
      ],
      errorTags: ['tense-past', 'irregular-verb'],
      practice: [
        {
          question: 'Yesterday I ___ (go) to the market.',
          options: ['go', 'went', 'have gone', 'going'],
          answerIndex: 1,
          explanation: '具体过去时间点用一般过去时：went。'
        },
        {
          question: '下列哪句正确？',
          options: ['I seen him yesterday.', 'I saw him yesterday.', 'I have seen him yesterday at noon.', 'I sees him yesterday.'],
          answerIndex: 1,
          explanation: 'see 的过去式是 saw；不能与「过去分词无助动词」连用，也不能与具体过去时间搭配现在完成时。'
        },
        {
          question: 'We ___ (finish) the project last Friday.',
          options: ['finish', 'finished', 'have finished', 'finishing'],
          answerIndex: 1,
          explanation: '规则动词加 -ed 构成过去式：finished。'
        }
      ]
    },
    {
      id: 'tense-future',
      title: '将来时（will vs going to）',
      difficulty: 'basic',
      summary: 'I will / I\'m going to —— 临时决定与已有计划的区别',
      rule:
        'will 用于<em>说话当下才做出的决定</em>、没有确凿证据的预测、承诺。' +
        'be going to 用于<em>已经安排好的计划</em>、或有明显迹象支持的预测。',
      correct: [
        { en: 'I will call you later.', zh: '我稍后给你打电话。（临时决定）' },
        { en: "I'm going to visit my parents this weekend.", zh: '我这周末打算去看我父母。（已有计划）' }
      ],
      incorrect: [
        { wrong: 'Look at the clouds! It will rain.', why: '有明显迹象（乌云）支持的预测应该用 be going to', right: "Look at the clouds! It's going to rain." },
        { wrong: "A: The phone is ringing. B: I'm going to answer it.", why: '说话当下才做的决定应该用 will，而不是已有计划的 going to', right: 'A: The phone is ringing. B: I will answer it.' }
      ],
      errorTags: ['tense-future'],
      practice: [
        {
          question: 'A: The phone is ringing. B: I ___ (answer) it.',
          options: ['will answer', 'am going to answer', 'answer', 'answered'],
          answerIndex: 0,
          explanation: '说话当下才做出的决定，用 will。'
        },
        {
          question: "I've already booked the tickets. I ___ (go) to Japan next month.",
          options: ['will go', 'am going to go', 'go', 'went'],
          answerIndex: 1,
          explanation: '已经安排好的计划（已订票），用 be going to。'
        }
      ]
    },
    {
      id: 'articles',
      title: '冠词（a/an/the）',
      difficulty: 'basic',
      summary: '什么时候用，什么时候不用',
      rule:
        'a/an 用于<em>泛指、第一次提到</em>的单数可数名词——a 用于辅音<em>发音</em>开头，an 用于元音<em>发音</em>开头（看发音不看字母）。' +
        'the 用于<em>特指</em>：双方都知道的事物、独一无二的事物、上文已提到过的名词。' +
        '专有名词（人名、多数城市/国家名）前一般<em>不加</em>冠词。',
      correct: [
        { en: 'I saw a dog in the park. The dog was very friendly.', zh: '我在公园看到一只狗，那只狗很友好。' },
        { en: 'She is an honest person.', zh: '她是一个诚实的人。（honest 发音以元音开头）' }
      ],
      incorrect: [
        { wrong: 'I saw an university yesterday.', why: 'university 发音以辅音 /j/ 开头，应该用 a', right: 'I saw a university yesterday.' },
        { wrong: 'I live in an Beijing.', why: '城市名等专有名词前一般不加冠词', right: 'I live in Beijing.' }
      ],
      errorTags: ['articles'],
      practice: [
        {
          question: 'She works as ___ engineer.',
          options: ['a', 'an', 'the', '(不填)'],
          answerIndex: 1,
          explanation: 'engineer 发音以元音 /ɪ/ 开头，用 an。'
        },
        {
          question: 'Can you pass me ___ salt on the table?',
          options: ['a', 'an', 'the', '(不填)'],
          answerIndex: 2,
          explanation: '双方都知道是哪份盐（就在桌上），用 the 表特指。'
        },
        {
          question: '选出正确句子：',
          options: ['I visited the Paris last year.', 'I visited a Paris last year.', 'I visited Paris last year.', 'I visited an Paris last year.'],
          answerIndex: 2,
          explanation: '城市名 Paris 是专有名词，前面不加冠词。'
        }
      ]
    },
    {
      id: 'prepositions',
      title: '介词（in/on/at）',
      difficulty: 'basic',
      summary: '时间和地点的用法',
      rule:
        '<strong>时间</strong>：at 用于具体时刻（at 3pm），on 用于日期/星期（on Monday），in 用于较长时间段（in July, in 2024）。' +
        '<strong>地点</strong>：at 用于具体的点（at the door），on 用于接触的表面（on the table），in 用于范围内部（in the room, in London）。',
      correct: [
        { en: "Let's meet at 3pm on Friday.", zh: '我们周五下午三点见面。' },
        { en: 'The keys are on the table in the kitchen.', zh: '钥匙在厨房的桌子上。' }
      ],
      incorrect: [
        { wrong: 'I will see you in Monday.', why: '具体星期几用 on，不用 in', right: 'I will see you on Monday.' },
        { wrong: 'She is waiting on the door.', why: '在门口这个具体的点，用 at，不用 on', right: 'She is waiting at the door.' }
      ],
      errorTags: ['prepositions'],
      practice: [
        {
          question: 'My birthday is ___ July.',
          options: ['at', 'on', 'in', '(不填)'],
          answerIndex: 2,
          explanation: '较长的时间段（月份）用 in。'
        },
        {
          question: "I'll meet you ___ the airport.",
          options: ['at', 'on', 'in', '(不填)'],
          answerIndex: 0,
          explanation: '机场作为一个具体的会面地点，用 at。'
        },
        {
          question: 'The meeting starts ___ 9 a.m. ___ Monday.',
          options: ['at / on', 'in / at', 'on / in', 'at / in'],
          answerIndex: 0,
          explanation: '具体时刻用 at，具体星期用 on。'
        }
      ]
    },
    {
      id: 'modals',
      title: '情态动词（can/could/should/would）',
      difficulty: 'advanced',
      summary: 'can/could/should/would —— 请求与建议',
      rule:
        'can 表示<em>能力</em>或较随意的请求；could 是更<em>委婉/正式</em>的请求；' +
        'should 表示<em>建议</em>；would 常用于委婉表达意愿或礼貌请求（Would you like...?）。',
      correct: [
        { en: 'Could you please pass me the menu?', zh: '能麻烦你把菜单递给我吗？（委婉请求）' },
        { en: 'You should see a doctor if it still hurts.', zh: '如果还疼的话你应该去看医生。（建议）' }
      ],
      incorrect: [
        { wrong: 'Can you please help me with this report? (to your boss in a formal email)', why: '正式场合/对上级请求更适合用 could 或 would，而不是较随意的 can', right: 'Could you please help me with this report?' },
        { wrong: 'You could see a doctor.', why: '给出明确建议时用 should 更恰当，could 更偏向「可能性」而非建议', right: 'You should see a doctor.' }
      ],
      errorTags: ['modals'],
      practice: [
        {
          question: '（正式邮件里请求同事帮忙）___ you send me the file by tomorrow?',
          options: ['Can', 'Could', 'Should', 'Must'],
          answerIndex: 1,
          explanation: '正式/委婉的请求用 could 更合适。'
        },
        {
          question: '给朋友的建议：You ___ try the new restaurant downtown.',
          options: ['can', 'should', 'would', 'must'],
          answerIndex: 1,
          explanation: '表达建议用 should。'
        }
      ]
    },
    {
      id: 'comparison',
      title: '比较级和最高级',
      difficulty: 'basic',
      summary: 'better/best, more/most —— 怎么变形',
      rule:
        '单音节及部分双音节形容词：加 -er/-est（tall → taller → tallest）。' +
        '多音节形容词：用 more/most（expensive → more expensive → most expensive）。' +
        '不规则变化需要记忆：good → better → best；bad → worse → worst。',
      correct: [
        { en: 'This phone is more expensive than that one.', zh: '这部手机比那部贵。' },
        { en: 'This is the best restaurant in town.', zh: '这是城里最好的餐厅。' }
      ],
      incorrect: [
        { wrong: 'This phone is expensiver than that one.', why: 'expensive 是多音节词，不能直接加 -er', right: 'This phone is more expensive than that one.' },
        { wrong: 'She is the gooder student in class.', why: 'good 是不规则变化，最高级是 best，不是 gooder', right: 'She is the best student in class.' }
      ],
      errorTags: ['comparison'],
      practice: [
        {
          question: 'Today is ___ (cold) than yesterday.',
          options: ['colder', 'more cold', 'coldest', 'more colder'],
          answerIndex: 0,
          explanation: 'cold 是单音节词，加 -er 构成比较级。'
        },
        {
          question: 'This is ___ (interesting) book I have ever read.',
          options: ['the interestinger', 'the most interesting', 'the interestingest', 'more interesting'],
          answerIndex: 1,
          explanation: 'interesting 是多音节词，最高级用 the most interesting。'
        },
        {
          question: 'His health got ___ (bad) after the surgery.',
          options: ['badder', 'more bad', 'worse', 'worst'],
          answerIndex: 2,
          explanation: 'bad 的比较级是不规则变化 worse。'
        }
      ]
    },
    {
      id: 'conditionals',
      title: '条件句（if）',
      difficulty: 'advanced',
      summary: 'If I have time, I will... —— 真实条件句',
      rule:
        '第一类条件句（描述真实可能发生的条件）：<em>If + 一般现在时, ... will + 动词原形</em>。' +
        '零条件句（描述客观事实/规律）：<em>If + 一般现在时, ... 一般现在时</em>。' +
        '注意：if 从句里不用 will，即使说的是将来的事。',
      correct: [
        { en: 'If I have time, I will help you.', zh: '如果我有时间，我会帮你。' },
        { en: 'If you heat ice, it melts.', zh: '如果加热冰，它就会融化。（客观事实）' }
      ],
      incorrect: [
        { wrong: 'If I will have time, I will help you.', why: 'if 从句里不用 will，从句用一般现在时表示将来', right: 'If I have time, I will help you.' },
        { wrong: 'If it will rain, we will stay home.', why: '同上，if 从句不能用 will', right: 'If it rains, we will stay home.' }
      ],
      errorTags: ['conditionals'],
      practice: [
        {
          question: 'If it ___ (rain) tomorrow, we will cancel the trip.',
          options: ['will rain', 'rains', 'rained', 'is raining'],
          answerIndex: 1,
          explanation: 'if 从句用一般现在时表将来：rains。'
        },
        {
          question: 'If you ___ (heat) water to 100°C, it boils.',
          options: ['will heat', 'heat', 'heated', 'are heating'],
          answerIndex: 1,
          explanation: '零条件句描述客观规律，从句和主句都用一般现在时。'
        }
      ]
    },
    {
      id: 'passive',
      title: '被动语态',
      difficulty: 'advanced',
      summary: 'The report was written by... —— 强调动作承受者',
      rule:
        '被动语态：<em>be + 过去分词</em>，强调动作的<em>承受者</em>而不是执行者，' +
        '常用于不知道、不重要或不想说出动作执行者的场合。by + 执行者可省略。',
      correct: [
        { en: 'The report was written by the intern.', zh: '这份报告是那位实习生写的。' },
        { en: 'English is spoken in many countries.', zh: '很多国家都说英语。（不需要强调是谁在说）' }
      ],
      incorrect: [
        { wrong: 'The report was wrote by the intern.', why: '被动语态用过去分词 written，不是过去式 wrote', right: 'The report was written by the intern.' },
        { wrong: 'The window broken yesterday.', why: '被动语态缺少 be 动词，应为 was broken', right: 'The window was broken yesterday.' }
      ],
      errorTags: ['passive'],
      practice: [
        {
          question: 'This bridge ___ (build) in 1990.',
          options: ['built', 'was built', 'is building', 'builds'],
          answerIndex: 1,
          explanation: '被动语态：was + 过去分词 built。'
        },
        {
          question: 'The cake ___ (make) by my grandmother.',
          options: ['was made', 'made', 'is make', 'making'],
          answerIndex: 0,
          explanation: '被动语态：was made。'
        }
      ]
    },
    {
      id: 'confusables',
      title: '常见易混词（make/do, say/tell, borrow/lend）',
      difficulty: 'advanced',
      summary: '意思相近但用法不同的动词组',
      rule:
        'make 强调<em>制造/创造出新事物</em>（make a cake, make a decision）；do 强调<em>执行一项任务或工作</em>（do homework, do the dishes）。' +
        'say 后面接<em>说的内容</em>（say something）；tell 后面必须先接<em>宾语（某人）</em>（tell somebody something）。' +
        'borrow 表示<em>借入</em>（borrow sth. from sb.）；lend 表示<em>借出</em>（lend sth. to sb.）。',
      correct: [
        { en: 'Can you tell me the way to the station?', zh: '你能告诉我去车站的路吗？' },
        { en: 'Could I borrow your pen? — Sure, I can lend it to you.', zh: '我能借用一下你的笔吗？——当然，我可以借给你。' }
      ],
      incorrect: [
        { wrong: 'I need to do a decision.', why: 'decision（决定）是被「做出」的新结果，应搭配 make', right: 'I need to make a decision.' },
        { wrong: 'She said me the truth.', why: 'say 后不能直接接人做宾语，应该用 tell', right: 'She told me the truth.' },
        { wrong: 'Can you lend me your pen? — Sure, I will borrow it to you.', why: '「借出去」应该用 lend，不是 borrow', right: 'Can you lend me your pen? — Sure, I will lend it to you.' }
      ],
      errorTags: ['confusables'],
      practice: [
        {
          question: 'I need to ___ my homework before dinner.',
          options: ['make', 'do', 'say', 'tell'],
          answerIndex: 1,
          explanation: 'homework 是要完成的任务，用 do。'
        },
        {
          question: 'Please ___ me what happened.',
          options: ['say', 'tell', 'make', 'do'],
          answerIndex: 1,
          explanation: 'tell 后直接接宾语（me），再接内容。'
        },
        {
          question: 'I forgot my umbrella. Can I ___ yours?',
          options: ['borrow', 'lend', 'make', 'say'],
          answerIndex: 0,
          explanation: '「我」向对方借入东西，用 borrow。'
        }
      ]
    }
  ];

  var BY_ID = {};
  GRAMMAR_POINTS.forEach(function (item) {
    BY_ID[item.id] = item;
  });

  function getAll() {
    return GRAMMAR_POINTS;
  }

  function getById(id) {
    return BY_ID[id] || null;
  }

  /* 供未来「对话」模块调用：传入纠错时打的错误类型标签，找到对应知识点 id。
   * 用法示例（对话模块内）：
   *   var id = window.App.grammarData.findByErrorTag('tense-present');
   *   // 拼出链接 `#grammar/${id}`，插入纠错气泡里，用户点击即可跳转到本知识点详情页
   */
  function findByErrorTag(tag) {
    var found = GRAMMAR_POINTS.filter(function (item) {
      return item.errorTags && item.errorTags.indexOf(tag) !== -1;
    });
    return found.length ? found[0].id : null;
  }

  window.App = window.App || {};
  window.App.grammarData = {
    getAll: getAll,
    getById: getById,
    findByErrorTag: findByErrorTag
  };
})();
