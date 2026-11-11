window.__ModuleLoader__.load({
  id: 'dsh-bookmark',
  factory(require) {
    const React = require('react')
    const {
      createElement: h,
      Fragment,
      useState,
      useEffect,
      useMemo,
      useRef,
      useCallback,
      useSyncExternalStore,
    } = React

    const PANEL_ID = 'dsh-bookmark'
    const TAB_ID = 'dsh-bookmark/tab'
    const TAB_KIND = 'bookmark'
    const NS = 'dshBookmark'
    const STORAGE_KEY = 'dsh-bookmark/v1/items'
    const CONTEXT_CHARS = 32

    // ── Locales ──────────────────────────────────────────────────────────────
    const zh = {
      'nav.title': '书签',
      'tab.title': '书签',
      'guide.title': '书签',
      'guide.description': '当前会话中保存的段落、表格与注释',
      'pill.label': '书签',
      'pill.tip': '打开右侧书签栏',
      'find.label': '查找',
      'find.tip': '在当前会话中搜索内容 (⌘F)',
      'find.placeholder': '在当前会话中查找…',
      'find.prev': '上一个 (Shift+Enter)',
      'find.next': '下一个 (Enter)',
      'find.close': '关闭 (Esc)',
      'menu.bookmark': 'Bookmark',
      'menu.remove': '移除 Bookmark',
      'side.title': '书签',
      'side.allBtn': '全部会话',
      'side.search': '过滤本会话书签…',
      'side.empty': '选中对话中的文本或表格，右键选择「Bookmark」即可高亮并保存至此处。',
      'side.noMatch': '无匹配结果',
      'side.locate': '定位',
      'side.insert': '引用',
      'side.delete': '删除',
      'side.notePlaceholder': '添加注释…',
      'page.title': '全部书签',
      'page.back': '返回对话',
      'page.search': '搜索内容、注释或会话…',
      'page.sortRecent': '最近添加',
      'page.sortTitle': '会话名称',
      'page.sortCount': '书签数量',
      'page.expandAll': '展开全部',
      'page.collapseAll': '折叠全部',
      'page.exportMd': '导出',
      'page.empty': '暂无书签。在任意会话中选中文本或表格，右键点击「Bookmark」即可保存。',
      'page.openSession': '打开会话',
      'page.untitled': '未命名会话',
    }

    const en = {
      'nav.title': 'Bookmarks',
      'tab.title': 'Bookmarks',
      'guide.title': 'Bookmarks',
      'guide.description': 'Saved passages, tables, and notes in this session',
      'pill.label': 'Bookmarks',
      'pill.tip': 'Open session bookmarks',
      'find.label': 'Find',
      'find.tip': 'Find in current conversation (⌘F)',
      'find.placeholder': 'Find in conversation…',
      'find.prev': 'Previous (Shift+Enter)',
      'find.next': 'Next (Enter)',
      'find.close': 'Close (Esc)',
      'menu.bookmark': 'Bookmark',
      'menu.remove': 'Remove Bookmark',
      'side.title': 'Bookmarks',
      'side.allBtn': 'All Sessions',
      'side.search': 'Filter bookmarks…',
      'side.empty': 'Select any text or table in the conversation and right-click "Bookmark" to save it here.',
      'side.noMatch': 'No matches',
      'side.locate': 'Locate',
      'side.insert': 'Quote',
      'side.delete': 'Delete',
      'side.notePlaceholder': 'Add a note…',
      'page.title': 'Bookmarks',
      'page.back': 'Back',
      'page.search': 'Search quotes, notes, or sessions…',
      'page.sortRecent': 'Recent',
      'page.sortTitle': 'Session Name',
      'page.sortCount': 'Count',
      'page.expandAll': 'Expand All',
      'page.collapseAll': 'Collapse All',
      'page.exportMd': 'Export',
      'page.empty': 'No bookmarks yet. Select text or tables in any conversation and right-click "Bookmark".',
      'page.openSession': 'Open',
      'page.untitled': 'Untitled Session',
    }

    // ── Minimalist Apple-inspired Styles ─────────────────────────────────────
    const STYLES = `
::highlight(dsh-bm-mark) {
  background-color: rgba(255, 204, 0, 0.22);
  color: inherit;
}
::highlight(dsh-bm-active) {
  background-color: rgba(255, 180, 0, 0.48);
  color: inherit;
  text-decoration: underline rgba(217, 119, 6, 0.9) 2px;
  text-underline-offset: 3px;
}
::highlight(dsh-bm-search) {
  background-color: rgba(56, 189, 248, 0.25);
  color: inherit;
}
::highlight(dsh-bm-search-active) {
  background-color: rgba(255, 159, 10, 0.62);
  color: inherit;
  text-decoration: underline #ff9f0a 2px;
}

.dshbm-dock-group {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.dshbm-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 26px;
  padding: 0 9px;
  border-radius: 6px;
  border: 1px solid var(--dsw-alias-border-l1, rgba(128, 128, 128, 0.2));
  background: transparent;
  color: var(--dsw-alias-label-secondary, #86868b);
  font-size: 12px;
  font-weight: 450;
  cursor: pointer;
  user-select: none;
  transition: background-color 0.12s ease, color 0.12s ease;
}
.dshbm-pill:hover {
  background: var(--dsw-alias-bg-layer-2, rgba(128, 128, 128, 0.1));
  color: var(--dsw-alias-label-primary, #1d1d1f);
}
.dshbm-pill-count {
  font-size: 11px;
  color: var(--dsw-alias-label-tertiary, #86868b);
  font-variant-numeric: tabular-nums;
}

/* Apple Safari style floating Find Bar */
.dshbm-find-bar {
  position: fixed;
  top: calc(var(--dsh-frame-top-clearance, 48px) + 12px);
  right: 24px;
  z-index: 9998;
  display: flex;
  align-items: center;
  gap: 6px;
  height: 36px;
  padding: 0 8px 0 10px;
  border-radius: 9px;
  background: var(--dsw-alias-bg-layer-1, rgba(36, 36, 38, 0.92));
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid var(--dsw-alias-border-l1, rgba(128, 128, 128, 0.24));
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18), 0 1px 2px rgba(0, 0, 0, 0.08);
  pointer-events: auto;
  color: var(--dsw-alias-label-primary, #f5f5f7);
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", sans-serif;
}
.dshbm-find-input {
  width: 190px;
  border: none;
  background: transparent;
  color: var(--dsw-alias-label-primary, #f5f5f7);
  font-size: 13px;
  outline: none;
}
.dshbm-find-input::placeholder {
  color: var(--dsw-alias-label-tertiary, #86868b);
}
.dshbm-find-count {
  font-size: 11.5px;
  color: var(--dsw-alias-label-secondary, #86868b);
  font-variant-numeric: tabular-nums;
  padding: 0 4px;
  min-width: 36px;
  text-align: right;
  user-select: none;
}
.dshbm-find-btn {
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 5px;
  background: transparent;
  color: var(--dsw-alias-label-secondary, #86868b);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
}
.dshbm-find-btn:hover:not(:disabled) {
  background: var(--dsw-alias-bg-layer-2, rgba(128, 128, 128, 0.16));
  color: var(--dsw-alias-label-primary, #f5f5f7);
}
.dshbm-find-btn:disabled {
  opacity: 0.35;
  cursor: default;
}

/* Apple macOS style minimal context menu */
.dshbm-context-menu {
  position: fixed;
  z-index: 9999;
  min-width: 136px;
  padding: 4px;
  border-radius: 8px;
  background: var(--dsw-alias-bg-layer-1, rgba(36, 36, 38, 0.92));
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid var(--dsw-alias-border-l1, rgba(128, 128, 128, 0.22));
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18), 0 1px 2px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  pointer-events: auto;
}
.dshbm-menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 6px 10px;
  border: none;
  border-radius: 5px;
  background: transparent;
  color: var(--dsw-alias-label-primary, #f5f5f7);
  font-size: 13px;
  font-weight: 450;
  text-align: left;
  cursor: pointer;
  line-height: 1.3;
}
.dshbm-menu-item:hover {
  background: var(--dsw-alias-bg-layer-2, rgba(128, 128, 128, 0.18));
}
.dshbm-menu-item[data-danger="true"] {
  color: #ff453a;
}

/* Right sidebar panel */
.dshbm-side-root {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--dsw-alias-bg-base, transparent);
  color: var(--dsw-alias-label-primary, #f5f5f7);
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", sans-serif;
}
.dshbm-side-header {
  padding: 12px 14px 10px;
  border-bottom: 1px solid var(--dsw-alias-border-l1, rgba(128, 128, 128, 0.14));
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.dshbm-side-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.dshbm-side-title {
  font-size: 13px;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: var(--dsw-alias-label-primary, #f5f5f7);
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.dshbm-side-count {
  font-size: 12px;
  font-weight: 400;
  color: var(--dsw-alias-label-secondary, #86868b);
}
.dshbm-text-btn {
  border: none;
  background: transparent;
  color: var(--dsw-alias-label-secondary, #86868b);
  font-size: 12px;
  padding: 3px 6px;
  border-radius: 5px;
  cursor: pointer;
  transition: color 0.12s ease, background-color 0.12s ease;
}
.dshbm-text-btn:hover {
  color: var(--dsw-alias-label-primary, #f5f5f7);
  background: var(--dsw-alias-bg-layer-2, rgba(128, 128, 128, 0.12));
}
.dshbm-text-btn:disabled {
  opacity: 0.4;
  cursor: default;
}
.dshbm-input {
  width: 100%;
  height: 28px;
  padding: 0 9px;
  border-radius: 6px;
  border: 1px solid var(--dsw-alias-border-l1, rgba(128, 128, 128, 0.18));
  background: var(--dsw-alias-bg-layer-1, rgba(128, 128, 128, 0.06));
  color: var(--dsw-alias-label-primary, #f5f5f7);
  font-size: 12px;
  transition: border-color 0.12s ease;
}
.dshbm-input:focus {
  outline: none;
  border-color: var(--dsw-alias-label-secondary, #86868b);
}
.dshbm-side-list {
  flex: 1;
  overflow-y: auto;
  padding: 10px 14px 24px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.dshbm-empty {
  padding: 48px 16px;
  text-align: center;
  color: var(--dsw-alias-label-secondary, #86868b);
  font-size: 12.5px;
  line-height: 1.6;
}

/* Bookmark Card */
.dshbm-card {
  border-radius: 8px;
  border: 1px solid var(--dsw-alias-border-l1, rgba(128, 128, 128, 0.16));
  background: var(--dsw-alias-bg-layer-1, rgba(128, 128, 128, 0.04));
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  transition: border-color 0.15s ease, background-color 0.15s ease;
}
.dshbm-card:hover {
  border-color: var(--dsw-alias-border-l2, rgba(128, 128, 128, 0.3));
}
.dshbm-card[data-active="true"] {
  border-color: var(--dsw-alias-label-secondary, rgba(128, 128, 128, 0.5));
}
.dshbm-quote-box {
  font-size: 12.5px;
  line-height: 1.55;
  color: var(--dsw-alias-label-primary, #f5f5f7);
  padding-left: 8px;
  border-left: 2px solid rgba(255, 204, 0, 0.7);
  word-break: break-word;
  white-space: pre-wrap;
  max-height: 132px;
  overflow-y: auto;
  cursor: pointer;
}
.dshbm-table-wrap {
  overflow-x: auto;
  max-height: 150px;
  border-radius: 6px;
  border: 1px solid var(--dsw-alias-border-l1, rgba(128, 128, 128, 0.16));
  cursor: pointer;
}
.dshbm-mini-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 11.5px;
}
.dshbm-mini-table th,
.dshbm-mini-table td {
  border-bottom: 1px solid var(--dsw-alias-border-l1, rgba(128, 128, 128, 0.12));
  padding: 4px 8px;
  text-align: left;
}
.dshbm-mini-table tr:first-child th {
  font-weight: 600;
  color: var(--dsw-alias-label-secondary, #86868b);
  background: var(--dsw-alias-bg-layer-2, rgba(128, 128, 128, 0.06));
}
.dshbm-note-input {
  width: 100%;
  border: none;
  background: transparent;
  color: var(--dsw-alias-label-secondary, #86868b);
  font-size: 12px;
  line-height: 1.45;
  font-family: inherit;
  padding: 2px 0;
  resize: none;
  overflow: hidden;
}
.dshbm-note-input::placeholder {
  color: var(--dsw-alias-label-tertiary, rgba(134, 134, 139, 0.6));
}
.dshbm-note-input:focus {
  outline: none;
  color: var(--dsw-alias-label-primary, #f5f5f7);
}
.dshbm-card-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding-top: 2px;
}
.dshbm-time {
  font-size: 11px;
  color: var(--dsw-alias-label-tertiary, #86868b);
  font-variant-numeric: tabular-nums;
}
.dshbm-card-actions {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  opacity: 0.65;
  transition: opacity 0.12s ease;
}
.dshbm-card:hover .dshbm-card-actions {
  opacity: 1;
}

/* Global Main Page */
.dshbm-page-root {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--dsw-alias-bg-base, #000);
  color: var(--dsw-alias-label-primary, #f5f5f7);
  padding-top: var(--dsh-frame-top-clearance, 0px);
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", sans-serif;
}
.dshbm-page-inner-wrap {
  width: 100%;
  max-width: 780px;
  margin: 0 auto;
  padding: 24px 28px 0;
  padding-left: calc(28px + var(--dsh-frame-leading-clearance, 0px));
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.dshbm-page-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 16px;
}
.dshbm-page-title-row {
  display: flex;
  align-items: baseline;
  gap: 10px;
}
.dshbm-page-title-row h1 {
  font-size: 20px;
  font-weight: 600;
  letter-spacing: -0.02em;
  margin: 0;
}
.dshbm-page-meta {
  font-size: 12.5px;
  color: var(--dsw-alias-label-secondary, #86868b);
}
.dshbm-page-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--dsw-alias-border-l1, rgba(128, 128, 128, 0.14));
}
.dshbm-select {
  height: 28px;
  padding: 0 8px;
  border-radius: 6px;
  border: 1px solid var(--dsw-alias-border-l1, rgba(128, 128, 128, 0.18));
  background: var(--dsw-alias-bg-layer-1, rgba(128, 128, 128, 0.06));
  color: var(--dsw-alias-label-secondary, #86868b);
  font-size: 12px;
}
.dshbm-select:focus {
  outline: none;
}
.dshbm-page-body {
  flex: 1;
  overflow-y: auto;
  padding: 14px 28px 48px;
  padding-left: calc(28px + var(--dsh-frame-leading-clearance, 0px));
}
.dshbm-page-list {
  max-width: 780px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.dshbm-session-group {
  border-radius: 10px;
  border: 1px solid var(--dsw-alias-border-l1, rgba(128, 128, 128, 0.15));
  background: var(--dsw-alias-bg-layer-1, rgba(128, 128, 128, 0.03));
  overflow: hidden;
}
.dshbm-session-head {
  padding: 10px 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  cursor: pointer;
  user-select: none;
  transition: background-color 0.12s ease;
}
.dshbm-session-head:hover {
  background: var(--dsw-alias-bg-layer-2, rgba(128, 128, 128, 0.07));
}
.dshbm-session-head-left {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  flex: 1;
}
.dshbm-chevron {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  color: var(--dsw-alias-label-secondary, #86868b);
  transition: transform 0.15s ease;
}
.dshbm-chevron[data-open="true"] {
  transform: rotate(90deg);
}
.dshbm-session-name {
  font-size: 13.5px;
  font-weight: 500;
  color: var(--dsw-alias-label-primary, #f5f5f7);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.dshbm-session-count {
  font-size: 11.5px;
  color: var(--dsw-alias-label-secondary, #86868b);
  font-variant-numeric: tabular-nums;
}
.dshbm-session-body {
  padding: 6px 14px 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  border-top: 1px solid var(--dsw-alias-border-l1, rgba(128, 128, 128, 0.1));
}
`

    // ── Minimal SVG Icons ────────────────────────────────────────────────────
    function BookmarkSvg({ size = 15, filled = false }) {
      return h(
        'svg',
        {
          width: size,
          height: size,
          viewBox: '0 0 24 24',
          fill: filled ? 'currentColor' : 'none',
          stroke: 'currentColor',
          strokeWidth: 1.6,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          'aria-hidden': 'true',
          style: { flexShrink: 0 },
        },
        h('path', {
          d: 'M6.5 4.75C6.5 3.7835 7.2835 3 8.25 3H15.75C16.7165 3 17.5 3.7835 17.5 4.75V20.1C17.5 20.6858 16.8427 21.0298 16.3612 20.6964L12 17.6771L7.63883 20.6964C7.15727 21.0298 6.5 20.6858 6.5 20.1V4.75Z',
        })
      )
    }

    function SearchSvg({ size = 14 }) {
      return h(
        'svg',
        {
          width: size,
          height: size,
          viewBox: '0 0 20 20',
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: 1.6,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          'aria-hidden': 'true',
          style: { flexShrink: 0 },
        },
        h('circle', { cx: 8.5, cy: 8.5, r: 5.5 }),
        h('path', { d: 'M13 13L17 17' })
      )
    }

    function ChevronRightSvg() {
      return h(
        'svg',
        {
          width: 12,
          height: 12,
          viewBox: '0 0 16 16',
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: 1.6,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          'aria-hidden': 'true',
        },
        h('path', { d: 'M6 3.5L10.5 8L6 12.5' })
      )
    }

    // ── DOM Text & Table Anchoring ───────────────────────────────────────────
    const MESSAGE_ATTR = 'data-chat-node-key'
    const SEAT_ATTR = 'data-chat-flow-key'
    const EXCLUDED_SELECTOR = 'button, [data-variant="think"], [aria-hidden="true"], .katex-mathml, script, style, [data-dsh-bm-ui]'

    function escapeSelector(val) {
      return typeof CSS !== 'undefined' && typeof CSS.escape === 'function'
        ? CSS.escape(val)
        : String(val).replace(/\\/g, '\\\\').replace(/"/g, '\\"')
    }

    function owningMessage(node) {
      const el = node && node.nodeType === 1 ? node : node ? node.parentElement : null
      if (!el) return null
      return el.closest(`[${SEAT_ATTR}]`) || el.closest(`[${MESSAGE_ATTR}]`)
    }

    function buildTextModel(root) {
      const walker = root.ownerDocument.createTreeWalker(root, NodeFilter.SHOW_TEXT)
      const segments = []
      let text = ''
      for (let node = walker.nextNode(); node !== null; node = walker.nextNode()) {
        const parent = node.parentElement
        if (parent && parent.closest(EXCLUDED_SELECTOR)) continue
        const value = node.nodeValue || ''
        if (!value) continue
        const start = text.length
        text += value
        segments.push({ node, start, end: text.length })
      }
      return { text, segments }
    }

    function pointAt(model, offset) {
      const clamped = Math.max(0, Math.min(offset, model.text.length))
      for (const seg of model.segments) {
        if (clamped < seg.end) return { node: seg.node, offset: clamped - seg.start }
      }
      const last = model.segments[model.segments.length - 1]
      if (!last) return undefined
      return { node: last.node, offset: (last.node.nodeValue || '').length }
    }

    function rangeOf(model, start, end) {
      const from = pointAt(model, start)
      const to = pointAt(model, end)
      if (!from || !to) return undefined
      try {
        const r = from.node.ownerDocument.createRange()
        r.setStart(from.node, from.offset)
        r.setEnd(to.node, to.offset)
        return r
      } catch {
        return undefined
      }
    }

    /**
     * Resolve an arbitrary DOM (container, offset) boundary to an exact character offset
     * inside `model.text`, even when `container` is an Element node (<tr>, <td>, <p>, etc.).
     */
    function offsetInModel(model, container, offset) {
      const doc = container.ownerDocument || document
      const probe = doc.createRange()
      for (const seg of model.segments) {
        if (seg.node === container) {
          return seg.start + Math.max(0, Math.min(offset, seg.end - seg.start))
        }
        try {
          probe.selectNodeContents(seg.node)
          // comparePoint returns -1 if (container, offset) is before seg.node start,
          // 0 if inside seg.node, 1 if after seg.node end.
          const cmp = probe.comparePoint(container, offset)
          if (cmp < 0) return seg.start
          if (cmp === 0) return seg.start
        } catch {}
      }
      return model.text.length
    }

    function extractTableFromSelection(message, range) {
      const startEl = range.startContainer.nodeType === 1 ? range.startContainer : range.startContainer.parentElement
      const endEl = range.endContainer.nodeType === 1 ? range.endContainer : range.endContainer.parentElement
      const table = (startEl && startEl.closest('table')) || (endEl && endEl.closest('table'))
      const tablesInRange = []
      if (table && message.contains(table)) {
        tablesInRange.push(table)
      } else {
        for (const tbl of message.querySelectorAll('table')) {
          if (range.intersectsNode(tbl)) tablesInRange.push(tbl)
        }
      }
      if (tablesInRange.length === 0) return { isTable: false, tableData: null }
      const targetTable = tablesInRange[0]
      const rows = []
      const trList = targetTable.querySelectorAll('tr')
      for (const tr of trList) {
        if (!range.intersectsNode(tr) && tr !== trList[0]) continue
        const cells = []
        for (const cell of tr.querySelectorAll('th, td')) {
          cells.push((cell.innerText || cell.textContent || '').trim())
        }
        if (cells.length > 0) rows.push(cells)
      }
      if (rows.length === 0) return { isTable: false, tableData: null }
      return { isTable: true, tableData: rows }
    }

    function describeSelection(message, range) {
      const model = buildTextModel(message)
      if (model.segments.length === 0) return undefined

      let start = offsetInModel(model, range.startContainer, range.startOffset)
      let end = offsetInModel(model, range.endContainer, range.endOffset)

      const rawDisplay = range.toString().trim()
      if (end <= start) {
        if (!rawDisplay) return undefined
        const span = resolveSpan(model.text, rawDisplay, '', '', 0)
        if (span) {
          start = span.start
          end = span.end
        } else {
          return {
            start: 0,
            end: rawDisplay.length,
            quote: rawDisplay,
            prefix: '',
            suffix: '',
            ...extractTableFromSelection(message, range),
          }
        }
      }

      const modelSlice = model.text.slice(start, end)
      const quote = rawDisplay || modelSlice
      if (!quote.trim()) return undefined
      const prefix = model.text.slice(Math.max(0, start - CONTEXT_CHARS), start)
      const suffix = model.text.slice(end, end + CONTEXT_CHARS)
      const tableInfo = extractTableFromSelection(message, range)
      return {
        start,
        end,
        quote,
        prefix,
        suffix,
        ...tableInfo,
      }
    }

    function commonPrefixLen(a, b) {
      let i = 0
      while (i < a.length && i < b.length && a[i] === b[i]) i++
      return i
    }

    function commonSuffixLen(a, b) {
      let i = 0
      while (i < a.length && i < b.length && a[a.length - 1 - i] === b[b.length - 1 - i]) i++
      return i
    }

    /**
     * Resolve `quote` inside `text` to `{ start, end }` offsets in `text`.
     * Supports both exact substring match and whitespace-insensitive matching
     * (crucial when `quote` contains newlines/tabs between <p> or <td> elements
     * that do not exist in the concatenated text-node model).
     */
    function resolveSpan(text, quote, prefix, suffix, hintStart) {
      const len = quote.length
      if (len === 0 || !text) return null

      // 1. Exact offset fast-path
      if (hintStart >= 0 && text.slice(hintStart, hintStart + len) === quote) {
        return { start: hintStart, end: hintStart + len }
      }

      // 2. Exact substring search scored by surrounding context
      let best = -1
      let bestScore = -1
      for (let at = text.indexOf(quote); at !== -1; at = text.indexOf(quote, at + 1)) {
        const before = text.slice(Math.max(0, at - (prefix || '').length), at)
        const after = text.slice(at + len, at + len + (suffix || '').length)
        const score = commonSuffixLen(prefix || '', before) + commonPrefixLen(suffix || '', after) - Math.abs(at - (hintStart || 0)) * 0.001
        if (score > bestScore) {
          bestScore = score
          best = at
        }
      }
      if (best !== -1) {
        return { start: best, end: best + len }
      }

      // 3. Whitespace-insensitive match (for multi-paragraph & table selections)
      const compactQuote = quote.replace(/\s+/g, '')
      if (!compactQuote) return null
      const origIndices = []
      let compactChars = ''
      for (let i = 0; i < text.length; i++) {
        const ch = text[i]
        if (!/\s/.test(ch)) {
          origIndices.push(i)
          compactChars += ch
        }
      }
      let cBest = -1
      let cBestDist = Infinity
      for (let cAt = compactChars.indexOf(compactQuote); cAt !== -1; cAt = compactChars.indexOf(compactQuote, cAt + 1)) {
        const origStart = origIndices[cAt]
        const dist = Math.abs(origStart - (hintStart || 0))
        if (dist < cBestDist) {
          cBestDist = dist
          cBest = cAt
        }
      }
      if (cBest !== -1) {
        const origStart = origIndices[cBest]
        const origEnd = origIndices[cBest + compactQuote.length - 1] + 1
        return { start: origStart, end: origEnd }
      }
      return null
    }

    function seatMatchesItem(seat, item) {
      const model = buildTextModel(seat)
      return resolveSpan(model.text, item.quote, item.prefix || '', item.suffix || '', item.start || 0) !== null
    }

    function resolveSeatElement(item) {
      if (item.flowKey) {
        const seat = document.querySelector(`[${SEAT_ATTR}="${escapeSelector(item.flowKey)}"]`)
        if (seat && seatMatchesItem(seat, item)) return seat
        if (seat) return seat
      }
      if (item.nodeKey) {
        const candidates = document.querySelectorAll(`[${MESSAGE_ATTR}="${escapeSelector(item.nodeKey)}"]`)
        let fallback = null
        for (const c of candidates) {
          if (!fallback) fallback = c
          if (seatMatchesItem(c, item)) return c
        }
        if (fallback) return fallback
      }
      for (const seat of document.querySelectorAll(`[${SEAT_ATTR}], [${MESSAGE_ATTR}]`)) {
        if (seatMatchesItem(seat, item)) return seat
      }
      return null
    }

    function locateBookmarkRange(item, cache) {
      const seat = resolveSeatElement(item)
      if (!seat) return { seat: null, range: undefined }
      const key = item.flowKey || item.nodeKey || item.id
      let model = cache ? cache.get(key) : undefined
      if (!model) {
        model = buildTextModel(seat)
        if (cache) cache.set(key, model)
      }
      const span = resolveSpan(model.text, item.quote, item.prefix || '', item.suffix || '', item.start || 0)
      if (!span) return { seat, range: undefined }
      return { seat, range: rangeOf(model, span.start, span.end) }
    }

    /**
     * Scroll a DOM Range or Element into the vertical center of the DSH conversation scrollport.
     * Crucially dispatches a synthetic wheel intent event first so DSH's ChatViewport
     * releases `followingTail` mode and does not snap the scroll position back to the bottom.
     */
    function scrollTargetIntoView(range, fallbackEl) {
      const anchorNode = range ? range.startContainer : fallbackEl
      const el = anchorNode && anchorNode.nodeType === 1 ? anchorNode : anchorNode ? anchorNode.parentElement : fallbackEl
      if (!el) return false

      // If inside a scrollable process group body, scroll that inner container first
      const innerGroup = el.closest('[data-step-process-body]')
      if (innerGroup instanceof HTMLElement && innerGroup.scrollHeight > innerGroup.clientHeight) {
        const targetRect = (range ? range.getBoundingClientRect() : el.getBoundingClientRect())
        const groupBox = innerGroup.getBoundingClientRect()
        innerGroup.dispatchEvent(new WheelEvent('wheel', { deltaY: -1, bubbles: true }))
        innerGroup.scrollTop += targetRect.top - groupBox.top - groupBox.height / 2 + targetRect.height / 2
      }

      const scroller = el.closest('[data-conversation-scroll]') || document.querySelector('[data-conversation-scroll]')
      if (!(scroller instanceof HTMLElement)) {
        el.scrollIntoView({ block: 'center' })
        return true
      }

      // Release ChatViewport follow-tail lock
      scroller.dispatchEvent(new WheelEvent('wheel', { deltaY: -1, bubbles: true }))

      const getRect = () => {
        if (range) {
          const r = range.getBoundingClientRect()
          if (r.width > 0 || r.height > 0) return r
          const rects = range.getClientRects()
          if (rects.length > 0) return rects[0]
        }
        return (fallbackEl || el).getBoundingClientRect()
      }

      const alignNow = () => {
        const rect = getRect()
        const box = scroller.getBoundingClientRect()
        const delta = rect.top - box.top - box.height / 2 + Math.min(rect.height, box.height * 0.4) / 2
        if (Math.abs(delta) > 2) {
          scroller.scrollTop += delta
        }
      }

      alignNow()
      requestAnimationFrame(alignNow)
      return true
    }

    // ── CSS Custom Highlight Painter (Bookmarks + In-Session Search) ─────────
    const HL_NAMES = ['dsh-bm-mark', 'dsh-bm-active', 'dsh-bm-search', 'dsh-bm-search-active']

    function clearHighlights() {
      if (typeof CSS === 'undefined' || !CSS.highlights) return
      for (const n of HL_NAMES) CSS.highlights.delete(n)
    }

    function paintHighlights(items, activeId, searchRanges, activeSearchRange) {
      if (typeof CSS === 'undefined' || !CSS.highlights || typeof Highlight === 'undefined') return
      clearHighlights()
      const cache = new Map()
      const ranges = []
      let activeRange
      for (const item of items || []) {
        const { range } = locateBookmarkRange(item, cache)
        if (!range) continue
        ranges.push(range)
        if (item.id === activeId) activeRange = range
      }
      if (ranges.length > 0) {
        CSS.highlights.set('dsh-bm-mark', new Highlight(...ranges))
      }
      if (activeRange) {
        CSS.highlights.set('dsh-bm-active', new Highlight(activeRange))
      }
      if (searchRanges && searchRanges.length > 0) {
        CSS.highlights.set('dsh-bm-search', new Highlight(...searchRanges))
      }
      if (activeSearchRange) {
        CSS.highlights.set('dsh-bm-search-active', new Highlight(activeSearchRange))
      }
    }

    // ── Store ────────────────────────────────────────────────────────────────
    class BookmarkStore {
      constructor() {
        this.items = this.loadFromStorage()
        this.sessionId = undefined
        this.sessionTitles = new Map()
        this.activeId = undefined
        this.justCreatedId = undefined
        this.pendingRevealId = undefined
        this.findOpen = false
        this.findQuery = ''
        this.findIndex = 0
        this.findRanges = []
        this.inputFacts = { draft: '', phase: 'plain', occurrences: 0, actions: undefined }
        this.listeners = new Set()
        this.snapshot = this.buildSnapshot()
      }

      loadFromStorage() {
        try {
          const raw = localStorage.getItem(STORAGE_KEY)
          if (!raw) return []
          const parsed = JSON.parse(raw)
          if (!Array.isArray(parsed)) return []
          return parsed.filter(x => x && typeof x.id === 'string' && typeof x.sessionId === 'string' && typeof x.quote === 'string')
        } catch {
          return []
        }
      }

      saveToStorage() {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(this.items))
        } catch {}
      }

      buildSnapshot() {
        const currentSessionItems = this.sessionId
          ? this.items.filter(x => x.sessionId === this.sessionId)
          : []
        return {
          items: this.items,
          sessionId: this.sessionId,
          currentSessionItems,
          activeId: this.activeId,
          justCreatedId: this.justCreatedId,
          findOpen: this.findOpen,
          findQuery: this.findQuery,
          findIndex: this.findIndex,
          findCount: this.findRanges.length,
          sessionTitles: new Map(this.sessionTitles),
        }
      }

      publish() {
        this.snapshot = this.buildSnapshot()
        for (const listener of this.listeners) {
          try { listener() } catch {}
        }
      }

      subscribe = (listener) => {
        this.listeners.add(listener)
        return () => { this.listeners.delete(listener) }
      }

      getSnapshot = () => this.snapshot

      bindSession(sessionId, sessionTitle, inputFacts) {
        this.inputFacts = inputFacts || this.inputFacts
        let changed = false
        if (sessionTitle && sessionId) {
          if (this.sessionTitles.get(sessionId) !== sessionTitle) {
            this.sessionTitles.set(sessionId, sessionTitle)
            let updatedStorage = false
            this.items = this.items.map(item => {
              if (item.sessionId === sessionId && item.sessionTitle !== sessionTitle) {
                updatedStorage = true
                return { ...item, sessionTitle }
              }
              return item
            })
            if (updatedStorage) this.saveToStorage()
            changed = true
          }
        }
        if (this.sessionId !== sessionId) {
          this.sessionId = sessionId
          this.activeId = undefined
          this.justCreatedId = undefined
          this.findRanges = []
          this.findIndex = 0
          changed = true
        }
        if (changed) this.publish()
        this.repaintCurrentSession()
        if (this.pendingRevealId) {
          const targetId = this.pendingRevealId
          const target = this.items.find(x => x.id === targetId && x.sessionId === sessionId)
          if (target) {
            setTimeout(() => {
              if (this.reveal(targetId)) {
                this.pendingRevealId = undefined
              }
            }, 180)
          }
        }
      }

      computeSearchRanges() {
        if (!this.findOpen || !this.findQuery.trim()) {
          this.findRanges = []
          return
        }
        const needle = this.findQuery.trim().toLowerCase()
        const len = needle.length
        const found = []
        const seats = document.querySelectorAll(`[${SEAT_ATTR}]:not([hidden])`)
        const targets = seats.length > 0 ? seats : document.querySelectorAll(`[${MESSAGE_ATTR}]:not([hidden])`)
        for (const seat of targets) {
          const model = buildTextModel(seat)
          const hay = model.text.toLowerCase()
          let from = 0
          while (from <= hay.length - len) {
            const idx = hay.indexOf(needle, from)
            if (idx === -1) break
            const r = rangeOf(model, idx, idx + len)
            if (r) found.push(r)
            from = idx + len
          }
        }
        this.findRanges = found
        if (this.findIndex >= found.length) {
          this.findIndex = found.length > 0 ? 0 : 0
        }
      }

      repaintCurrentSession() {
        if (!this.sessionId) {
          clearHighlights()
          return
        }
        const prevCount = this.findRanges.length
        this.computeSearchRanges()
        const list = this.items.filter(x => x.sessionId === this.sessionId)
        const activeSearch = this.findRanges[this.findIndex]
        paintHighlights(list, this.activeId, this.findRanges, activeSearch)
        if (prevCount !== this.findRanges.length) {
          this.publish()
        }
        if (this.pendingRevealId) {
          const target = list.find(x => x.id === this.pendingRevealId)
          if (target) {
            const { seat, range } = locateBookmarkRange(target)
            if (range || seat) {
              const id = this.pendingRevealId
              this.pendingRevealId = undefined
              this.reveal(id)
            }
          }
        }
      }

      toggleFind(open) {
        const next = open === undefined ? !this.findOpen : Boolean(open)
        if (this.findOpen === next && next) return
        this.findOpen = next
        if (!next) {
          this.findRanges = []
        }
        this.repaintCurrentSession()
        this.publish()
      }

      setFindQuery(query) {
        this.findQuery = query
        this.findIndex = 0
        this.repaintCurrentSession()
        this.publish()
        const activeRange = this.findRanges[0]
        if (activeRange) {
          scrollTargetIntoView(activeRange, null)
        }
      }

      stepFind(delta) {
        const total = this.findRanges.length
        if (total === 0) return
        this.findIndex = (this.findIndex + delta + total) % total
        this.repaintCurrentSession()
        this.publish()
        const activeRange = this.findRanges[this.findIndex]
        if (activeRange) {
          scrollTargetIntoView(activeRange, null)
        }
      }

      add(payload) {
        const sessionId = payload.sessionId || this.sessionId || 'unknown'
        const sessionTitle = payload.sessionTitle || this.sessionTitles.get(sessionId) || ''
        const now = new Date().toISOString()
        const record = {
          id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `bm-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          sessionId,
          sessionTitle,
          nodeKey: payload.nodeKey || '',
          flowKey: payload.flowKey || '',
          isTable: Boolean(payload.isTable),
          tableData: payload.tableData || null,
          start: payload.start || 0,
          end: payload.end || 0,
          quote: payload.quote || '',
          prefix: payload.prefix || '',
          suffix: payload.suffix || '',
          note: (payload.note || '').trim(),
          createdAt: now,
          updatedAt: now,
        }
        this.items = [record, ...this.items]
        this.activeId = record.id
        this.justCreatedId = record.id
        this.saveToStorage()
        this.publish()
        this.repaintCurrentSession()
        return record
      }

      clearJustCreated(id) {
        if (this.justCreatedId === id) {
          this.justCreatedId = undefined
        }
      }

      update(id, patch) {
        const now = new Date().toISOString()
        this.items = this.items.map(item =>
          item.id === id ? { ...item, ...patch, updatedAt: now } : item
        )
        this.saveToStorage()
        this.publish()
        this.repaintCurrentSession()
      }

      remove(id) {
        this.items = this.items.filter(item => item.id !== id)
        if (this.activeId === id) this.activeId = undefined
        if (this.justCreatedId === id) this.justCreatedId = undefined
        this.saveToStorage()
        this.publish()
        this.repaintCurrentSession()
      }

      findOverlapping(sessionId, flowKey, start, end) {
        if (!sessionId) return undefined
        return this.items.find(
          item => item.sessionId === sessionId && item.flowKey === flowKey && item.start < end && start < item.end
        )
      }

      reveal(id) {
        const item = this.items.find(x => x.id === id)
        if (!item) return false
        this.activeId = id
        this.publish()
        this.repaintCurrentSession()
        const { seat, range } = locateBookmarkRange(item)
        if (!range && !seat) return false
        return scrollTargetIntoView(range, seat)
      }

      insertIntoComposer(item) {
        const { actions, draft, phase, occurrences } = this.inputFacts
        if (!actions || phase !== 'plain') return false
        const quoted = item.quote
          .split('\n')
          .map(line => `> ${line}`)
          .join('\n')
        const body = item.note ? `${quoted}\n\n${item.note}` : quoted
        if (!draft || draft.trim() === '') {
          actions.setDraft(body)
          return true
        }
        const sep = draft.endsWith('\n') ? '\n' : '\n\n'
        if (!occurrences) {
          actions.setDraft(`${draft}${sep}${body}`)
          return true
        }
        if (typeof actions.captureInsertion === 'function' && typeof actions.insertText === 'function') {
          const span = actions.captureInsertion()
          return Boolean(actions.insertText(`${sep}${body}`, span))
        }
        return false
      }

      dispose() {
        clearHighlights()
        this.listeners.clear()
      }
    }

    // ── Shared UI Sub-components ─────────────────────────────────────────────
    function TablePreview({ tableData, onClick }) {
      if (!Array.isArray(tableData) || tableData.length === 0) return null
      return h(
        'div',
        { className: 'dshbm-table-wrap', onClick },
        h(
          'table',
          { className: 'dshbm-mini-table' },
          h(
            'tbody',
            null,
            tableData.map((row, rIdx) =>
              h(
                'tr',
                { key: rIdx },
                row.map((cell, cIdx) => h(rIdx === 0 ? 'th' : 'td', { key: cIdx }, cell))
              )
            )
          )
        )
      )
    }

    function BookmarkCard({ item, isActive, autoFocusNote, onFocusedNote, t, onLocate, onInsert, onUpdate, onDelete }) {
      const [noteDraft, setNoteDraft] = useState(item.note || '')
      const inputRef = useRef(null)

      useEffect(() => {
        setNoteDraft(item.note || '')
      }, [item.note])

      useEffect(() => {
        if (autoFocusNote && inputRef.current) {
          inputRef.current.focus()
          if (onFocusedNote) onFocusedNote(item.id)
        }
      }, [autoFocusNote, item.id, onFocusedNote])

      const commitNote = () => {
        const trimmed = noteDraft.trim()
        if (trimmed !== (item.note || '')) {
          onUpdate(item.id, { note: trimmed })
        }
      }

      return h(
        'div',
        {
          className: 'dshbm-card',
          'data-active': isActive ? 'true' : undefined,
        },
        item.isTable && Array.isArray(item.tableData) && item.tableData.length > 0
          ? h(TablePreview, { tableData: item.tableData, onClick: () => onLocate(item) })
          : h(
              'div',
              {
                className: 'dshbm-quote-box',
                onClick: () => onLocate(item),
              },
              item.quote
            ),

        h('textarea', {
          ref: inputRef,
          className: 'dshbm-note-input',
          rows: Math.min(4, Math.max(1, (noteDraft.match(/\n/g) || []).length + 1)),
          value: noteDraft,
          placeholder: t('side.notePlaceholder'),
          onChange: e => setNoteDraft(e.target.value),
          onBlur: commitNote,
          onKeyDown: e => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey || !e.shiftKey)) {
              e.preventDefault()
              e.currentTarget.blur()
            }
            if (e.key === 'Escape') {
              e.stopPropagation()
              setNoteDraft(item.note || '')
              e.currentTarget.blur()
            }
          },
        }),

        h(
          'div',
          { className: 'dshbm-card-foot' },
          h(
            'span',
            { className: 'dshbm-time' },
            new Date(item.createdAt).toLocaleString([], {
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
            })
          ),
          h(
            'div',
            { className: 'dshbm-card-actions' },
            h(
              'button',
              {
                type: 'button',
                className: 'dshbm-text-btn',
                onClick: () => onLocate(item),
              },
              t('side.locate')
            ),
            onInsert &&
              h(
                'button',
                {
                  type: 'button',
                  className: 'dshbm-text-btn',
                  onClick: () => onInsert(item),
                },
                t('side.insert')
              ),
            h(
              'button',
              {
                type: 'button',
                className: 'dshbm-text-btn',
                onClick: () => onDelete(item.id),
              },
              t('side.delete')
            )
          )
        )
      )
    }

    // ── Plugin Entry ─────────────────────────────────────────────────────────
    const inject = ['slots', 'locale', 'layout', 'sidebarRightTabs', 'sidebarRight', 'uiWorkspace']

    function apply(ctx) {
      const store = new BookmarkStore()
      const tBound = ctx.locale.bind(NS)

      ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'dsh-bookmark: locale')

      ctx.effect(() => {
        const style = document.createElement('style')
        style.setAttribute('data-dsh-bookmark-style', 'true')
        style.textContent = STYLES
        document.head.appendChild(style)
        return () => { style.remove() }
      }, 'dsh-bookmark: styles')

      const openSessionBookmarkTab = () => {
        try {
          ctx.sidebarRight.openTab(TAB_KIND)
        } catch (err) {
          console.warn('[dsh-bookmark] openTab failed:', err)
        }
      }

      const openAllBookmarksPage = () => {
        try {
          ctx.layout.selectPanel(PANEL_ID)
        } catch (err) {
          console.warn('[dsh-bookmark] selectPanel failed:', err)
        }
      }

      // Keyboard shortcuts:
      // - Cmd/Ctrl + F: open in-conversation Find bar
      // - Alt + B: toggle All Bookmarks page
      ctx.effect(() => {
        const onKeyDown = (e) => {
          if (e.altKey && !e.ctrlKey && !e.metaKey && e.code === 'KeyB') {
            e.preventDefault()
            const cur = ctx.layout.panelInfo.getSnapshot().activePanelId
            ctx.layout.selectPanel(cur === PANEL_ID ? null : PANEL_ID)
            return
          }
          if ((e.metaKey || e.ctrlKey) && !e.altKey && !e.shiftKey && e.code === 'KeyF') {
            if (document.querySelector('[data-conversation-scroll]')) {
              e.preventDefault()
              store.toggleFind(true)
            }
          }
        }
        window.addEventListener('keydown', onKeyDown)
        return () => window.removeEventListener('keydown', onKeyDown)
      }, 'dsh-bookmark: shortcuts')

      // 1. Right-Sidebar Tab Type + Body + Title
      const disposeTabType = ctx.sidebarRightTabs.register({
        id: TAB_ID,
        kind: TAB_KIND,
        title: () => tBound('tab.title'),
        guide: [
          {
            id: 'bookmark',
            order: 35,
            title: () => tBound('guide.title'),
            description: () => tBound('guide.description'),
            icon: BookmarkSvg,
          },
        ],
      })

      function SessionBookmarkTabTitle({ useTabInfo }) {
        const { tab } = useTabInfo()
        const snap = useSyncExternalStore(store.subscribe, store.getSnapshot)
        const count = snap.currentSessionItems.length
        return h(
          Fragment,
          null,
          h(BookmarkSvg, { size: 14, filled: count > 0 }),
          ' ',
          tab.title,
          count > 0 ? ` (${count})` : ''
        )
      }

      function SessionBookmarkTabBody(props) {
        const { sessionId, useSessions, t } = props
        const snap = useSyncExternalStore(store.subscribe, store.getSnapshot)
        const [query, setQuery] = useState('')
        const sessionTitle = useSessions ? useSessions(s => s.byId[sessionId]?.title) : ''

        useEffect(() => {
          if (sessionId) {
            store.bindSession(sessionId, sessionTitle || '')
          }
        }, [sessionId, sessionTitle])

        const allSessionItems = useMemo(
          () => snap.items.filter(x => x.sessionId === sessionId),
          [snap.items, sessionId]
        )

        const items = useMemo(() => {
          const q = query.trim().toLowerCase()
          if (!q) return allSessionItems
          return allSessionItems.filter(x => `${x.quote}\n${x.note || ''}`.toLowerCase().includes(q))
        }, [allSessionItems, query])

        return h(
          'div',
          { className: 'dshbm-side-root', 'data-dsh-bm-ui': 'true' },
          h(
            'div',
            { className: 'dshbm-side-header' },
            h(
              'div',
              { className: 'dshbm-side-title-row' },
              h(
                'span',
                { className: 'dshbm-side-title' },
                t('side.title'),
                allSessionItems.length > 0 &&
                  h('span', { className: 'dshbm-side-count' }, String(allSessionItems.length))
              ),
              h(
                'button',
                {
                  type: 'button',
                  className: 'dshbm-text-btn',
                  onClick: openAllBookmarksPage,
                },
                `${t('side.allBtn')} ›`
              )
            ),
            allSessionItems.length > 1 &&
              h('input', {
                type: 'search',
                className: 'dshbm-input',
                value: query,
                placeholder: t('side.search'),
                onChange: e => setQuery(e.target.value),
              })
          ),
          h(
            'div',
            { className: 'dshbm-side-list' },
            items.length === 0
              ? h(
                  'div',
                  { className: 'dshbm-empty' },
                  query.trim() ? t('side.noMatch') : t('side.empty')
                )
              : items.map(item =>
                  h(BookmarkCard, {
                    key: item.id,
                    item,
                    isActive: snap.activeId === item.id,
                    autoFocusNote: snap.justCreatedId === item.id,
                    onFocusedNote: id => store.clearJustCreated(id),
                    t,
                    onLocate: bm => store.reveal(bm.id),
                    onInsert: bm => store.insertIntoComposer(bm),
                    onUpdate: (id, patch) => store.update(id, patch),
                    onDelete: id => store.remove(id),
                  })
                )
          )
        )
      }

      const disposeRightTabBody = ctx.slots.inject('sidebar.right.pane.tab', () =>
        ctx.slots.register(
          {
            name: 'sidebar.right.pane.tab',
            key: TAB_ID,
            locale: NS,
          },
          SessionBookmarkTabBody
        )
      )

      const disposeRightTabTitle = ctx.slots.inject('sidebar.right.pane.tab.title', () =>
        ctx.slots.register(
          {
            name: 'sidebar.right.pane.tab.title',
            key: TAB_ID,
            locale: NS,
          },
          SessionBookmarkTabTitle
        )
      )

      // 2. Composer Dock Pill (Bookmark + Find)
      function ComposerBookmarkPill(props) {
        const { sessionId, inputActions, useInput, useSessions, t } = props
        const draft = useInput ? useInput(s => s.draft) : ''
        const phase = useInput ? useInput(s => s.phase) : 'plain'
        const occurrences = useInput ? useInput(s => (s.occurrences ? s.occurrences.length : 0)) : 0
        const sessionTitle = useSessions ? useSessions(s => s.byId[sessionId]?.title) : ''
        const snap = useSyncExternalStore(store.subscribe, store.getSnapshot)

        useEffect(() => {
          store.bindSession(sessionId, sessionTitle || '', {
            draft,
            phase,
            occurrences,
            actions: inputActions,
          })
        }, [sessionId, sessionTitle, draft, phase, occurrences, inputActions])

        const count = snap.items.filter(x => x.sessionId === sessionId).length
        return h(
          'span',
          { className: 'dshbm-dock-group' },
          h(
            'button',
            {
              type: 'button',
              className: 'dshbm-pill',
              title: t('pill.tip'),
              onClick: openSessionBookmarkTab,
            },
            h(BookmarkSvg, { size: 13, filled: count > 0 }),
            h('span', null, t('pill.label')),
            count > 0 && h('span', { className: 'dshbm-pill-count' }, String(count))
          ),
          h(
            'button',
            {
              type: 'button',
              className: 'dshbm-pill',
              title: t('find.tip'),
              onClick: () => store.toggleFind(),
            },
            h(SearchSvg, { size: 13 }),
            h('span', null, t('find.label'))
          )
        )
      }

      const disposeDock = ctx.slots.inject('conversation.composer.dock', () =>
        ctx.slots.register(
          {
            name: 'conversation.composer.dock',
            id: 'dsh-bookmark.pill',
            order: 4,
            locale: NS,
          },
          ComposerBookmarkPill
        )
      )

      // 3. Single-Action Minimal Right-Click Menu + In-Session Find Bar + Highlight Observer
      function SelectionOverlay({ t }) {
        const snap = useSyncExternalStore(store.subscribe, store.getSnapshot)
        const [menu, setMenu] = useState(null)
        const findInputRef = useRef(null)

        useEffect(() => {
          if (snap.findOpen && findInputRef.current) {
            findInputRef.current.focus()
            findInputRef.current.select()
          }
        }, [snap.findOpen])

        useEffect(() => {
          const onContextMenu = (e) => {
            const sel = window.getSelection()
            if (!sel || sel.isCollapsed || sel.rangeCount === 0) return
            const range = sel.getRangeAt(0)
            const msg = owningMessage(range.startContainer)
            const endMsg = owningMessage(range.endContainer)
            if (!msg || !endMsg || msg !== endMsg) return
            const draft = describeSelection(msg, range)
            if (!draft) return
            e.preventDefault()
            const flowKey = msg.getAttribute(SEAT_ATTR) || ''
            const nodeKey = msg.getAttribute(MESSAGE_ATTR) || ''
            const overlap = store.findOverlapping(store.sessionId, flowKey, draft.start, draft.end)
            setMenu({
              x: Math.min(e.clientX, window.innerWidth - 160),
              y: Math.min(e.clientY, window.innerHeight - 60),
              nodeKey,
              flowKey,
              draft,
              overlap,
            })
          }

          const onPointerDown = (e) => {
            const target = e.target
            if (!(target instanceof Element)) return
            if (!target.closest('[data-dsh-bm-menu]')) {
              setMenu(null)
            }
          }

          const onKeyDown = (e) => {
            if (e.key === 'Escape') {
              setMenu(null)
              if (store.findOpen) store.toggleFind(false)
            }
          }

          document.addEventListener('contextmenu', onContextMenu)
          document.addEventListener('mousedown', onPointerDown, true)
          document.addEventListener('keydown', onKeyDown)
          return () => {
            document.removeEventListener('contextmenu', onContextMenu)
            document.removeEventListener('mousedown', onPointerDown, true)
            document.removeEventListener('keydown', onKeyDown)
          }
        }, [])

        useEffect(() => {
          let raf = 0
          const observer = new MutationObserver(mutations => {
            if (mutations.every(m => {
              const el = m.target.nodeType === 1 ? m.target : m.target.parentElement
              return el && el.closest('[data-dsh-bm-ui]')
            })) return
            if (raf !== 0) return
            raf = requestAnimationFrame(() => {
              raf = 0
              store.repaintCurrentSession()
            })
          })
          observer.observe(document.body, { subtree: true, childList: true, characterData: true })
          return () => {
            observer.disconnect()
            if (raf !== 0) cancelAnimationFrame(raf)
          }
        }, [])

        const handleAction = () => {
          const current = menu
          setMenu(null)
          window.getSelection()?.removeAllRanges()
          if (current.overlap) {
            store.remove(current.overlap.id)
            return
          }
          store.add({
            sessionId: snap.sessionId,
            nodeKey: current.nodeKey,
            flowKey: current.flowKey,
            ...current.draft,
            note: '',
          })
          openSessionBookmarkTab()
        }

        return h(
          Fragment,
          null,
          snap.findOpen &&
            h(
              'div',
              {
                className: 'dshbm-find-bar',
                'data-dsh-bm-ui': 'true',
              },
              h(SearchSvg, { size: 14 }),
              h('input', {
                ref: findInputRef,
                type: 'text',
                className: 'dshbm-find-input',
                value: snap.findQuery,
                placeholder: t('find.placeholder'),
                onChange: e => store.setFindQuery(e.target.value),
                onKeyDown: e => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    store.stepFind(e.shiftKey ? -1 : 1)
                  }
                  if (e.key === 'Escape') {
                    e.stopPropagation()
                    store.toggleFind(false)
                  }
                },
              }),
              snap.findQuery.trim() !== '' &&
                h(
                  'span',
                  { className: 'dshbm-find-count' },
                  snap.findCount > 0 ? `${snap.findIndex + 1}/${snap.findCount}` : '0/0'
                ),
              h(
                'button',
                {
                  type: 'button',
                  className: 'dshbm-find-btn',
                  disabled: snap.findCount === 0,
                  title: t('find.prev'),
                  onClick: () => store.stepFind(-1),
                },
                '↑'
              ),
              h(
                'button',
                {
                  type: 'button',
                  className: 'dshbm-find-btn',
                  disabled: snap.findCount === 0,
                  title: t('find.next'),
                  onClick: () => store.stepFind(1),
                },
                '↓'
              ),
              h(
                'button',
                {
                  type: 'button',
                  className: 'dshbm-find-btn',
                  title: t('find.close'),
                  onClick: () => store.toggleFind(false),
                },
                '×'
              )
            ),
          menu &&
            h(
              'div',
              {
                className: 'dshbm-context-menu',
                'data-dsh-bm-ui': 'true',
                'data-dsh-bm-menu': 'true',
                style: { left: `${menu.x}px`, top: `${menu.y}px` },
              },
              h(
                'button',
                {
                  type: 'button',
                  className: 'dshbm-menu-item',
                  'data-danger': menu.overlap ? 'true' : undefined,
                  onClick: handleAction,
                },
                h(BookmarkSvg, { size: 14, filled: !menu.overlap }),
                h('span', null, menu.overlap ? t('menu.remove') : t('menu.bookmark'))
              )
            )
        )
      }

      const disposeOverlay = ctx.slots.inject('shell.overlay', () =>
        ctx.slots.register(
          {
            name: 'shell.overlay',
            id: 'dsh-bookmark.overlay',
            order: 15,
            locale: NS,
          },
          SelectionOverlay
        )
      )

      // 4. Left-Sidebar Entry + Global All-Sessions Bookmark Page
      function SidebarNavIcon({ size, active }) {
        return h(BookmarkSvg, { size: size || 16, filled: Boolean(active) })
      }

      function AllBookmarksPage(props) {
        const { useSessions, t } = props
        const snap = useSyncExternalStore(store.subscribe, store.getSnapshot)
        const sessionsMap = useSessions ? useSessions(s => s.byId) : {}
        const [query, setQuery] = useState('')
        const [sortBy, setSortBy] = useState('recent')
        const [collapsedMap, setCollapsedMap] = useState({})

        const resolveTitle = useCallback(
          (sessionId, fallback) => {
            const live = sessionsMap && sessionsMap[sessionId] && sessionsMap[sessionId].title
            if (live && live.trim()) return live.trim()
            if (fallback && fallback.trim()) return fallback.trim()
            return `${t('page.untitled')} (${sessionId.slice(0, 6)})`
          },
          [sessionsMap, t]
        )

        const groups = useMemo(() => {
          const q = query.trim().toLowerCase()
          const bySession = new Map()
          for (const item of snap.items) {
            const sTitle = resolveTitle(item.sessionId, item.sessionTitle)
            if (q) {
              const haystack = `${sTitle}\n${item.quote}\n${item.note || ''}`.toLowerCase()
              if (!haystack.includes(q)) continue
            }
            let group = bySession.get(item.sessionId)
            if (!group) {
              group = {
                sessionId: item.sessionId,
                title: sTitle,
                items: [],
                latestAt: '',
              }
              bySession.set(item.sessionId, group)
            }
            group.items.push(item)
            if (item.createdAt > group.latestAt) group.latestAt = item.createdAt
          }
          const arr = [...bySession.values()]
          if (sortBy === 'title') {
            arr.sort((a, b) => a.title.localeCompare(b.title, 'zh-CN'))
          } else if (sortBy === 'count') {
            arr.sort((a, b) => b.items.length - a.items.length || b.latestAt.localeCompare(a.latestAt))
          } else {
            arr.sort((a, b) => b.latestAt.localeCompare(a.latestAt))
          }
          return arr
        }, [snap.items, query, sortBy, resolveTitle])

        const totalBookmarks = useMemo(
          () => groups.reduce((acc, g) => acc + g.items.length, 0),
          [groups]
        )

        const toggleSessionCollapse = (sessionId) => {
          setCollapsedMap(prev => ({ ...prev, [sessionId]: !prev[sessionId] }))
        }

        const setAllCollapsed = (collapsed) => {
          const next = {}
          for (const g of groups) next[g.sessionId] = collapsed
          setCollapsedMap(next)
        }

        const jumpToSession = (sessionId, bookmarkId) => {
          if (bookmarkId) {
            store.pendingRevealId = bookmarkId
            store.activeId = bookmarkId
          }
          try {
            ctx.layout.selectPanel(null)
            ctx.uiWorkspace.openSession(sessionId)
            setTimeout(() => {
              openSessionBookmarkTab()
              if (bookmarkId) store.reveal(bookmarkId)
            }, 220)
          } catch (err) {
            console.warn('[dsh-bookmark] jumpToSession failed:', err)
          }
        }

        const exportMarkdown = () => {
          const lines = [`# ${t('page.title')}`, '']
          for (const g of groups) {
            lines.push(`## ${g.title}`, '')
            for (const item of g.items) {
              lines.push(...item.quote.split('\n').map(l => `> ${l}`), '')
              if (item.note) lines.push(item.note, '')
              lines.push(`*${new Date(item.createdAt).toLocaleString()}*`, '', '---', '')
            }
          }
          const blob = new Blob([lines.join('\n')], { type: 'text/markdown;charset=utf-8' })
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `bookmarks-${new Date().toISOString().slice(0, 10)}.md`
          document.body.appendChild(a)
          a.click()
          a.remove()
          URL.revokeObjectURL(url)
        }

        return h(
          'section',
          { className: 'dshbm-page-root', 'data-dsh-bm-ui': 'true', 'aria-label': t('page.title') },
          h(
            'div',
            { className: 'dshbm-page-inner-wrap' },
            h(
              'header',
              { className: 'dshbm-page-header' },
              h(
                'div',
                { className: 'dshbm-page-title-row' },
                h('h1', null, t('page.title')),
                totalBookmarks > 0 &&
                  h('span', { className: 'dshbm-page-meta' }, `${groups.length} · ${totalBookmarks}`)
              ),
              h(
                'div',
                { style: { display: 'inline-flex', alignItems: 'center', gap: '6px' } },
                totalBookmarks > 0 &&
                  h(
                    'button',
                    {
                      type: 'button',
                      className: 'dshbm-text-btn',
                      onClick: exportMarkdown,
                    },
                    t('page.exportMd')
                  ),
                h(
                  'button',
                  {
                    type: 'button',
                    className: 'dshbm-text-btn',
                    onClick: () => ctx.layout.selectPanel(null),
                  },
                  t('page.back')
                )
              )
            ),
            h(
              'div',
              { className: 'dshbm-page-toolbar' },
              h('input', {
                type: 'search',
                className: 'dshbm-input',
                style: { flex: 1 },
                value: query,
                placeholder: t('page.search'),
                onChange: e => setQuery(e.target.value),
              }),
              h(
                'select',
                {
                  className: 'dshbm-select',
                  value: sortBy,
                  onChange: e => setSortBy(e.target.value),
                },
                h('option', { value: 'recent' }, t('page.sortRecent')),
                h('option', { value: 'title' }, t('page.sortTitle')),
                h('option', { value: 'count' }, t('page.sortCount'))
              ),
              groups.length > 0 &&
                h(
                  Fragment,
                  null,
                  h(
                    'button',
                    {
                      type: 'button',
                      className: 'dshbm-text-btn',
                      onClick: () => setAllCollapsed(false),
                    },
                    t('page.expandAll')
                  ),
                  h(
                    'button',
                    {
                      type: 'button',
                      className: 'dshbm-text-btn',
                      onClick: () => setAllCollapsed(true),
                    },
                    t('page.collapseAll')
                  )
                )
            )
          ),
          h(
            'div',
            { className: 'dshbm-page-body' },
            h(
              'div',
              { className: 'dshbm-page-list' },
              groups.length === 0
                ? h('div', { className: 'dshbm-empty' }, t('page.empty'))
                : groups.map(group => {
                    const isCollapsed = Boolean(collapsedMap[group.sessionId])
                    return h(
                      'div',
                      { key: group.sessionId, className: 'dshbm-session-group' },
                      h(
                        'div',
                        {
                          className: 'dshbm-session-head',
                          onClick: () => toggleSessionCollapse(group.sessionId),
                        },
                        h(
                          'div',
                          { className: 'dshbm-session-head-left' },
                          h(
                            'span',
                            { className: 'dshbm-chevron', 'data-open': !isCollapsed ? 'true' : undefined },
                            h(ChevronRightSvg)
                          ),
                          h('span', { className: 'dshbm-session-name' }, group.title),
                          h('span', { className: 'dshbm-session-count' }, String(group.items.length))
                        ),
                        h(
                          'button',
                          {
                            type: 'button',
                            className: 'dshbm-text-btn',
                            onClick: e => {
                              e.stopPropagation()
                              jumpToSession(group.sessionId)
                            },
                          },
                          t('page.openSession')
                        )
                      ),
                      !isCollapsed &&
                        h(
                          'div',
                          { className: 'dshbm-session-body' },
                          group.items.map(item =>
                            h(BookmarkCard, {
                              key: item.id,
                              item,
                              isActive: snap.activeId === item.id,
                              t,
                              onLocate: bm => jumpToSession(bm.sessionId, bm.id),
                              onUpdate: (id, patch) => store.update(id, patch),
                              onDelete: id => store.remove(id),
                            })
                          )
                        )
                    )
                  })
            )
          )
        )
      }

      const disposeSidebarEntry = ctx.slots.inject('sidebar.panellist', () =>
        ctx.slots.register(
          {
            name: 'sidebar.panellist',
            id: PANEL_ID,
            order: 25,
            locale: NS,
            label: () => tBound('nav.title'),
          },
          SidebarNavIcon
        )
      )

      const disposeMainPage = ctx.slots.inject('main', () =>
        ctx.slots.register(
          {
            name: 'main',
            key: PANEL_ID,
            locale: NS,
          },
          AllBookmarksPage
        )
      )

      ctx.effect(() => () => {
        try {
          if (ctx.layout.panelInfo.getSnapshot().activePanelId === PANEL_ID) {
            ctx.layout.selectPanel(null)
          }
        } catch {}
        try {
          const openTabs = ctx.sidebarRight.openTabs.getSnapshot()
          for (const [sessionId, tabs] of Object.entries(openTabs || {})) {
            if (!Array.isArray(tabs)) continue
            for (const tab of tabs) {
              if (tab && tab.kind === TAB_KIND) {
                try { ctx.sidebarRight.closeIn(sessionId, tab.id) } catch {}
              }
            }
          }
        } catch {}
        disposeMainPage()
        disposeSidebarEntry()
        disposeOverlay()
        disposeDock()
        disposeRightTabTitle()
        disposeRightTabBody()
        disposeTabType()
        store.dispose()
      }, 'dsh-bookmark: teardown')
    }

    return {
      name: 'dsh-bookmark',
      inject,
      apply,
    }
  },
})
