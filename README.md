# dsh-bookmark

[中文文档](./README.zh.md) | **English**

Minimalist session bookmarks, text/table highlights, and cross-session bookmark view for [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) (DSH).

## Features

- **Single-action Right-Click `Bookmark`** — Select any text passage, multi-paragraph block, or table (`<table>`) in a conversation and right-click `Bookmark`. It highlights the selection in place and adds it to the session's right-sidebar Bookmark tab.
- **In-Conversation Find (`⌘ + F` / `Ctrl + F`)** — Press `⌘ + F` (or click the `Find` pill above the composer) to open a Safari-style floating find bar that highlights all matches in the current conversation and jumps between them with `Enter` / `Shift + Enter`.
- **Inline Notes** — Each bookmark card includes a borderless inline note field. Type a note immediately after bookmarking or click any card's note line later; saves automatically on blur or `Enter`.
- **Non-destructive Highlights** — Uses the browser's native [CSS Custom Highlight API](https://developer.mozilla.org/en-US/docs/Web/API/CSS_Custom_Highlight_API) (`::highlight(dsh-bm-mark)`) with offset + surrounding context recovery. Never mutates React-managed Markdown DOM.
- **Session Right-Sidebar Panel** — Docked in DSH's native right sidebar (`sidebar.right.pane.tab`) and accessible from the composer pill (`Bookmarks`). Click any bookmark to scroll to and highlight the passage in the conversation, or quote it into the input box.
- **All-Sessions Collapsible Page** — Accessible from the left sidebar (`Bookmarks`) or via `Alt + B`. Groups all bookmarks by session (sortable by recent time, session title, or count), supports collapsible session sections, full-text search, cross-session jump-and-locate, and Markdown export.

## Installation

### Desktop App (GUI)

Open **Plugins** in DeepSeek Harness and install from GitHub or a local checkout:

```text
github:vaisramana/dsh-bookmark
```

### CLI

```bash
# Install into Desktop profile
dsh plugin --profile desktop add github:vaisramana/dsh-bookmark

# Or install into Web profile
dsh plugin --profile web add github:vaisramana/dsh-bookmark
```

### From Local Directory

```bash
git clone git@github.com:vaisramana/dsh-bookmark.git
cd dsh-bookmark
dsh plugin --profile desktop add "file:$PWD"
```

## Usage

1. **Create a Bookmark**: Select any text or table inside a message → right-click → click **Bookmark**.
2. **Add / Edit a Note**: The right sidebar opens automatically with the note input focused. Press `Enter` or click outside to save.
3. **Locate or Quote**: Click the quoted passage (or **Locate**) to scroll smoothly to the highlighted text in the conversation; click **Quote** to insert the passage and note into the chat input.
4. **Browse All Sessions**: Click **Bookmarks** in the left sidebar (or press `Alt + B`, or click **All Sessions ›** in the right sidebar) to view all bookmarks grouped by session. Click any session header to collapse or expand its bookmarks.

## Architecture & Data Storage

| File | Responsibility |
| :--- | :--- |
| `index.js` | Host bundle entry (no-op; all state is browser-local) |
| `client.js` | Browser module (`window.__ModuleLoader__.load`), registering `sidebar.right.pane.tab`, `conversation.composer.dock`, `shell.overlay`, `sidebar.panellist`, and `main` |
| `cordis.patch.yml` | Profile bundle patch inserting the `dsh-bookmark` row |
| `locale/*.json` | Bundle metadata (`meta.title`, `meta.description`) in Chinese and English |

- **Storage**: Stored locally in `localStorage["dsh-bookmark/v1/items"]`. Never modifies session logs or model context unless explicitly quoted into the composer.
- **Zero Runtime Dependencies**: Uses only host-provided `react` and `--dsw-alias-*` theme tokens.

## License

[MIT](./LICENSE)
