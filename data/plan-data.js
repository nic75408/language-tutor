/* data/plan-data.js —— 4 周入门学习计划（硬编码，不做自动生成）
 * 结构：
 *   PLAN_WEEKS: [{ week, theme, emoji, tasks: [{ id, type, title, detail, targetId? }] }]
 *   type: 'vocab' | 'dialogue' | 'grammar'
 *     vocab    -> targetId 对应 window.VOCAB_DATA 中的词条 id，跳转到 #vocab
 *     grammar  -> targetId 对应 window.App.grammarData 中的知识点 id，跳转到 #grammar/<id>
 *     dialogue -> 跳转到 #conversation（场景对话模块占位/未来对接）
 * 每周固定 5 个词汇任务 + 3 次对话练习 + 2 个语法点 = 10 个任务。
 */
(function () {
  window.PLAN_WEEKS = [
    {
      week: 1,
      theme: '打招呼与自我介绍',
      emoji: '👋',
      tasks: [
        { id: 'w1-v1', type: 'vocab', title: '学一句地道的早安问候', detail: 'Good morning! How did you sleep?', targetId: 'daily-001' },
        { id: 'w1-v2', type: 'vocab', title: '学会\u201c好久不见\u201d怎么说', detail: 'Long time no see!', targetId: 'daily-002' },
        { id: 'w1-v3', type: 'vocab', title: '学一句日常寒暄', detail: "How's it going?", targetId: 'daily-003' },
        { id: 'w1-v4', type: 'vocab', title: '学会初次见面怎么说', detail: 'Nice to meet you.', targetId: 'daily-004' },
        { id: 'w1-v5', type: 'vocab', title: '学会道别用语', detail: 'Take care, see you soon!', targetId: 'daily-005' },
        { id: 'w1-d1', type: 'dialogue', title: '完成一次自我介绍场景对话' },
        { id: 'w1-d2', type: 'dialogue', title: '完成一次打招呼场景对话' },
        { id: 'w1-d3', type: 'dialogue', title: '和导师自由聊 5 轮以上' },
        { id: 'w1-g1', type: 'grammar', title: '学习语法点：一般现在时 vs 现在进行时', targetId: 'tense-present' },
        { id: 'w1-g2', type: 'grammar', title: '学习语法点：冠词 a/an/the', targetId: 'articles' }
      ]
    },
    {
      week: 2,
      theme: '日常生活与购物',
      emoji: '🛒',
      tasks: [
        { id: 'w2-v1', type: 'vocab', title: '学一句聊天气的话', detail: "The weather's been really nice lately.", targetId: 'daily-007' },
        { id: 'w2-v2', type: 'vocab', title: '学会约朋友喝咖啡', detail: 'Do you want to grab a coffee sometime?', targetId: 'daily-013' },
        { id: 'w2-v3', type: 'vocab', title: '学会约定见面时间', detail: 'What time works best for you?', targetId: 'daily-015' },
        { id: 'w2-v4', type: 'vocab', title: '学会表达开心', detail: "I'm so happy for you!", targetId: 'daily-018' },
        { id: 'w2-v5', type: 'vocab', title: '学会表达压力', detail: "I'm a bit stressed out today.", targetId: 'daily-019' },
        { id: 'w2-d1', type: 'dialogue', title: '完成一次日常闲聊场景对话' },
        { id: 'w2-d2', type: 'dialogue', title: '完成一次约朋友出行场景对话' },
        { id: 'w2-d3', type: 'dialogue', title: '和导师自由聊 5 轮以上' },
        { id: 'w2-g1', type: 'grammar', title: '学习语法点：一般过去时', targetId: 'tense-past' },
        { id: 'w2-g2', type: 'grammar', title: '学习语法点：介词', targetId: 'prepositions' }
      ]
    },
    {
      week: 3,
      theme: '旅行与交通',
      emoji: '🛫',
      tasks: [
        { id: 'w3-v1', type: 'vocab', title: '学会向路人问路', detail: 'Excuse me, where is the nearest subway station?', targetId: 'travel-001' },
        { id: 'w3-v2', type: 'vocab', title: '学会问去机场的路', detail: 'How do I get to the airport from here?', targetId: 'travel-002' },
        { id: 'w3-v3', type: 'vocab', title: '学会餐厅要求两人桌', detail: 'A table for two, please.', targetId: 'travel-007' },
        { id: 'w3-v4', type: 'vocab', title: '学会要菜单', detail: 'Could I see the menu, please?', targetId: 'travel-008' },
        { id: 'w3-v5', type: 'vocab', title: '学会办理酒店入住', detail: 'I have a reservation under the name Smith.', targetId: 'travel-013' },
        { id: 'w3-d1', type: 'dialogue', title: '完成一次问路场景对话' },
        { id: 'w3-d2', type: 'dialogue', title: '完成一次点餐场景对话' },
        { id: 'w3-d3', type: 'dialogue', title: '完成一次酒店入住场景对话' },
        { id: 'w3-g1', type: 'grammar', title: '学习语法点：情态动词', targetId: 'modals' },
        { id: 'w3-g2', type: 'grammar', title: '学习语法点：比较级与最高级', targetId: 'comparison' }
      ]
    },
    {
      week: 4,
      theme: '工作场景入门',
      emoji: '💼',
      tasks: [
        { id: 'w4-v1', type: 'vocab', title: '学会开会开场白', detail: "Let's get started, shall we?", targetId: 'work-001' },
        { id: 'w4-v2', type: 'vocab', title: '学会请人讲解数据', detail: 'Could you walk us through the numbers?', targetId: 'work-002' },
        { id: 'w4-v3', type: 'vocab', title: '学会邮件开头问候', detail: 'I hope this email finds you well.', targetId: 'work-011' },
        { id: 'w4-v4', type: 'vocab', title: '学会邮件附件用语', detail: 'Please find the attached report.', targetId: 'work-012' },
        { id: 'w4-v5', type: 'vocab', title: '学会电话自报家门', detail: 'Hello, this is Alex speaking.', targetId: 'work-021' },
        { id: 'w4-d1', type: 'dialogue', title: '完成一次工作会议场景对话' },
        { id: 'w4-d2', type: 'dialogue', title: '完成一次电话沟通场景对话' },
        { id: 'w4-d3', type: 'dialogue', title: '完成一次自我介绍（工作场合）场景对话' },
        { id: 'w4-g1', type: 'grammar', title: '学习语法点：被动语态', targetId: 'passive' },
        { id: 'w4-g2', type: 'grammar', title: '学习语法点：易混词辨析', targetId: 'confusables' }
      ]
    }
  ];
})();
