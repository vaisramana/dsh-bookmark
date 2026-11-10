# dsh-bookmark

**中文文档** | [English](./README.md)

面向 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)（DSH）的极简风会话书签（Bookmark）与高亮批注插件。

## 功能特性

- **极简右键 `Bookmark`** — 在对话中划选任意文本、跨段落内容或表格（`<table>`），右键点击 `Bookmark`，一步完成原文高亮并收入当前会话的右侧书签栏；对已有书签右键可直接移除。
- **无感内联注释** — 新建书签后自动展开右侧面板并聚焦注释输入框；随时点击任意书签下的注释行即可编辑，失焦或按 `Enter` 自动保存，无需弹窗或繁琐确认按钮。
- **原生无损高亮** — 基于浏览器原生 [CSS Custom Highlight API](https://developer.mozilla.org/en-US/docs/Web/API/CSS_Custom_Highlight_API)（`::highlight(dsh-bm-mark)`）绘制柔和底色，配合偏移量 + 前后文模糊自愈定位，不向 Markdown DOM 插入节点，不干扰流式渲染与表格布局。
- **会话右侧书签栏** — 集成于 DSH 原生右侧边栏（`sidebar.right.pane.tab`），也可通过输入框上方的「书签」胶囊一键唤起。支持点击卡片平滑滚动定位到对话原文、一键引用（原文 + 注释）至输入框。
- **全局书签汇总页（按会话分组折叠）** — 通过左侧导航栏「书签」入口、右侧栏顶部「全部会话 ›」或快捷键 `Alt + B` 打开。所有书签按所属会话分组排列（支持按最近添加、会话名称、书签数量排序），同会话书签可点击折叠/展开，支持全文检索、跨会话一键跳转定位原文及导出 Markdown。

## 安装方式

### 1. 桌面端 / Web 端插件管理界面安装

在 DeepSeek Harness 的 **插件（Plugins）** 页面安装框中填入：

```text
github:vaisramana/dsh-bookmark
```

### 2. 使用 DSH CLI 安装

```bash
# 安装到 desktop profile
dsh plugin --profile desktop add github:vaisramana/dsh-bookmark

# 或安装到 web profile
dsh plugin --profile web add github:vaisramana/dsh-bookmark
```

### 3. 从本地源码目录安装

```bash
git clone git@github.com:vaisramana/dsh-bookmark.git
cd dsh-bookmark
dsh plugin --profile desktop add "file:$PWD"
```

## 使用指南

1. **添加书签**：在对话消息中选中文本或表格 → 右键点击 **Bookmark**。
2. **添加/修改注释**：右侧会话书签栏会自动展开并聚焦到该条目的「添加注释…」行，直接输入后按 `Enter` 或点击空白处即自动保存。
3. **定位与引用**：点击书签卡片中的摘录内容（或底部「定位」）可平滑滚动至对话原文并加深高亮；点击「引用」可将摘录与注释一并填入当前聊天输入框。
4. **跨会话总览**：点击左侧导航栏的 **书签**（或按快捷键 `Alt + B`）进入「全部书签」页：
   - 点击任意会话标题行即可**折叠 / 展开**该会话下的书签；
   - 点击单条书签可**跨会话跳转并自动滚动定位**到当时的上下文位置；
   - 点击右上角「导出」可将全部书签导出为 Markdown 文件。

## 目录结构与设计说明

```text
dsh-bookmark/
├── package.json        # DSH bundle 与 client 插件声明
├── cordis.patch.yml    # Profile 补丁（挂载 dsh-bookmark）
├── index.js            # Host 侧入口（零副作用）
├── client.js           # 浏览器侧实现（右键菜单、CSS.highlights、右侧栏与全局汇总页）
├── icon.svg            # 线性书签图标
└── locale/
    ├── zh.json         # 中文插件元数据
    └── en.json         # 英文插件元数据
```

- **数据存储**：书签保存在浏览器本地 `localStorage["dsh-bookmark/v1/items"]`，卸载插件不会清除已有数据；书签内容默认不进入模型上下文，仅在你主动点击「引用」时写入输入框。
- **零外部运行时依赖**：仅使用宿主注入的 `react` 与 `--dsw-alias-*` 原生主题变量，自动适配浅色与深色模式。

## 许可证

[MIT](./LICENSE)
