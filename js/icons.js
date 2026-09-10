/* js/icons.js —— 全站 icon 词表（SF Symbols 原生等效 · stroke 1.7px）
 * 决策依据：DESIGN.md `Icon System` 章节 + Decision Log `2026-09-10 · t_fae84c24`
 * 用法：
 *   Icons.get('house')                → 返回 stroke 1.7px 的 SVG 字符串（默认 24×24）
 *   Icons.get('house', { size: 22 })  → 自定义尺寸
 *   Icons.get('house', { color: 'var(--primary)' })  → 自定义描边颜色
 *   Icons.get('trash', { size: 18, color: 'var(--primary)' })
 *
 * 规范：
 *   - 所有 SVG viewBox="0 0 24 24"，stroke-width=1.7，round cap/join，fill=none
 *   - 不引入 emoji、不引入其它图标库
 */
(function () {
  'use strict';

  // 每个 icon 只存 <path>/<circle>/<rect> 内部结构；外层 <svg> 由 render 生成
  var PATHS = {
    // 导航 tab bar
    'house':          '<path d="M4 21V10l8-6 8 6v11h-6v-7h-4v7H4z"/>',
    'book.closed':    '<path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3V4z"/><path d="M5 17a3 3 0 0 1 3-3h11"/>',
    'bubble.left':    '<path d="M4 6h16v10H8l-4 4V6z"/>',
    'list.bullet':    '<path d="M4 5h16M4 10h10M4 15h16M4 20h10"/>',
    'person':         '<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4-6 8-6s7 2 8 6"/>',

    // 数据 / 时序
    'flame':          '<path d="M12 3c0 4-4 5-4 9a4 4 0 0 0 8 0c0-2-1-4-2-5 0 2-1 3-2 3 1-2 0-5 0-7z"/>',
    'calendar':       '<path d="M8 3v3M16 3v3"/><path d="M4 7h16v13H4z"/><path d="M4 11h16"/>',
    'chart.bar':      '<path d="M4 20V10M10 20V4M16 20v-6M22 20H2"/>',
    'clock':          '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',

    // 场景（10 个对话场景）
    'cup.and.saucer': '<path d="M6 8h9v6a4 4 0 0 1-4 4H10a4 4 0 0 1-4-4V8z"/><path d="M15 10h2a2 2 0 0 1 0 4h-2"/><path d="M8 3v2M11 3v2"/>',
    'airplane':       '<path d="M4 12h16M4 12l3-6h10l3 6M4 12v6h16v-6"/><circle cx="8" cy="15" r="1"/><circle cx="16" cy="15" r="1"/>',
    'bed.double':     '<path d="M3 21V8l9-5 9 5v13"/><path d="M9 21v-6h6v6"/><path d="M6 12h2M16 12h2M6 16h2M16 16h2"/>',
    'location.north': '<circle cx="12" cy="12" r="9"/><path d="m9 15 2-6 4 2-6 4z"/>',
    'face.smiling':   '<circle cx="12" cy="12" r="9"/><path d="M9 10h.01M15 10h.01M9 15c1 1 2 1.5 3 1.5s2-.5 3-1.5"/>',
    'briefcase':      '<path d="M4 7h16v13H4z"/><path d="M8 7V4h8v3"/><path d="M4 12h16"/><path d="M11 11v3"/>',
    'envelope':       '<path d="M4 5h16v14H4z"/><path d="m4 5 8 7 8-7"/>',
    'doc.text':       '<path d="M4 5h9l7 7v7H4z"/><path d="M13 5v6h6"/><path d="M8 14h6M8 17h4"/>',
    'waveform':       '<path d="M2 12h6l2-8 4 16 2-8h6"/>',

    // 状态 / 反馈
    'checkmark':          '<path d="m5 12 5 5L20 7"/>',
    'checkmark.circle':   '<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
    'xmark':              '<path d="M6 6l12 12M18 6 6 18"/>',
    'xmark.circle':       '<circle cx="12" cy="12" r="9"/><path d="M9 9l6 6M15 9l-6 6"/>',
    'target':             '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/>',
    'party':              '<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>', // 空态用 checkmark.circle 视觉

    // 操作按钮
    'speaker.wave':       '<path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M17 9c1 1 1.5 2 1.5 3s-.5 2-1.5 3"/>',
    'speaker.slash':      '<path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="m17 10 4 4M21 10l-4 4"/>',
    'pencil':             '<path d="M4 20 20 4M14 4l6 6M4 20l6-2"/>',
    'arrow.triangle.2.circlepath': '<path d="M21 12a9 9 0 0 1-15 6.7L3 21"/><path d="M3 12a9 9 0 0 1 15-6.7L21 3"/><path d="M21 3v6h-6M3 21v-6h6"/>',
    'trash':              '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/><path d="M10 11v6M14 11v6"/>',

    // 通用箭头
    'chevron.right':      '<path d="m9 6 6 6-6 6"/>',
    'chevron.left':       '<path d="M15 6l-6 6 6 6"/>',
    'chevron.down':       '<path d="m6 9 6 6 6-6"/>',
    'chevron.up':         '<path d="m6 15 6-6 6 6"/>',

    // 语义
    'globe':              '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>',
    'clipboard':          '<path d="M6 5h12v16H6z"/><path d="M9 3h6v3H9z"/>',
    'paperclip':          '<path d="M18 9 9 18a3 3 0 0 1-4-4l9-9a2 2 0 0 1 3 3l-9 9"/>'
  };

  /**
   * 生成 SVG 字符串
   * @param {string} name  icon 名（见 PATHS 键）
   * @param {object} opts  { size?: number, color?: string, class?: string, strokeWidth?: number }
   * @returns {string} SVG HTML 字符串
   */
  function get(name, opts) {
    opts = opts || {};
    var inner = PATHS[name];
    if (!inner) {
      console.warn('[icons] unknown icon:', name);
      // 未知 icon 返回一个虚线方框作为占位符（视觉上会明显，方便发现）
      inner = '<rect x="3" y="3" width="18" height="18" stroke-dasharray="2 2"/>';
    }
    var size = opts.size || 24;
    var color = opts.color || 'currentColor';
    var sw = opts.strokeWidth || 1.7;
    var cls = opts.class ? ' class="' + opts.class + '"' : '';
    return '<svg' + cls + ' width="' + size + '" height="' + size +
      '" viewBox="0 0 24 24" fill="none" stroke="' + color +
      '" stroke-width="' + sw + '" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      inner + '</svg>';
  }

  window.Icons = { get: get, PATHS: PATHS };
})();
