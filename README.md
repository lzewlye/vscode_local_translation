# 汉英本地翻译 (Local Translation)

**🈚 完全离线、无限制的中英双向词典** — 不依赖任何在线 API，无需联网，查询零延迟。

- **汉→英**：基于 CC-CEDICT 开源词典（~12 万词条）
- **英→汉**：基于 ECDICT 开源词典（~77 万词条）
- **编程优化**：一键翻译中文变量名、驼峰/下划线命名、编程术语精确映射

---

## ✨ 功能

| 功能 | 触发方式 | 说明 |
|------|----------|------|
| 🚀 **快速翻译变量名** | `Ctrl+Shift+T` | 选中中文 → 一键替换为英文驼峰/下划线变量名 |
| 📋 **选中即时翻译** | 选中文本 | 状态栏实时显示翻译 |
| 🔍 **详细查询面板** | 命令面板 | 逐词释义展开、反向复查 |
| 💬 **Hover 悬停翻译** | 鼠标悬停 | 需在设置中开启 |
| 📦 **批量翻译标识符** | 命令面板 | 一键翻译文件中所有中文标识符 |
| 🔀 **中英混合翻译** | 自动检测 | 分别翻译中英文片段后组合输出 |
| ⚡ **编程术语优化** | 内置词典 | `「获取」→「get」` `「字符串」→「string」` |

---

## 🚀 快速上手

### 快速翻译中文变量名（推荐）

1. 选中中文文本，如 `获取用户名称`
2. 按 `Ctrl+Shift+T`（Mac: `Cmd+Shift+T`）
3. 文本被替换为 `getUserName` ✨

支持三种命名风格，在设置中切换：

| 设置值 | 示例输出 |
|--------|---------|
| `camelCase`（默认） | `getUserName` |
| `PascalCase` | `GetUserName` |
| `snake_case` | `get_user_name` |

### 详细查询

`Ctrl+Shift+P` 打开命令面板 → 运行 **「中文本地翻译」** 打开 QuickPick 面板：

- **逐词查看**：每个词的翻译一目了然
- **释义展开**：点击单词查看完整释义
- **反向复查**：点击英文释义反向查中文，验证翻译质量

### Hover 悬停翻译

```json
{
  "localTranslation.enableHover": true
}
```

开启后，鼠标悬停即可看到翻译。

### 批量翻译标识符

1. `Ctrl+Shift+P` 打开命令面板
2. 搜索运行 **「批量翻译标识符」**
3. 在新标签页查看翻译结果

---

## ⚙️ 配置

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `localTranslation.enableHover` | `boolean` | `false` | 开启 Hover 悬停翻译 |
| `localTranslation.maxWords` | `number` | `20` | 最大可翻译词数（1~200），超出截断 |
| `localTranslation.variableNamingStyle` | `string` | `camelCase` | 变量名命名风格：`camelCase` / `PascalCase` / `snake_case` |

---

## ⌨️ 快捷键

| 命令 | Windows/Linux | Mac |
|------|---------------|-----|
| 翻译中文变量名 | `Ctrl+Shift+T` | `Cmd+Shift+T` |
| 中文本地翻译（QuickPick） | 无默认快捷键 | 无默认快捷键 |
| 批量翻译标识符 | 无默认快捷键 | 无默认快捷键 |

---

## ❓ 常见问题

**Q: 状态栏一直显示 "Loading dictionaries…"？**

词典数据量较大，首次加载需要几秒。加载完成后即可秒级响应。

**Q: 翻译结果不准确？**

打开 QuickPick 面板（命令面板 →「中文本地翻译」），利用**反向复查**：点击英文释义 → 反向查中文，人工验证。

**Q: 如何只翻译部分中文？**

选中文本后按 `Ctrl+Shift+T`，仅含中文的文本会被翻译成英文变量名。纯英文不生效。

**Q: 支持哪些语言？**

目前仅支持 **简体中文 ↔ 英文** 双向翻译。

---

## 🛠 开发

```bash
npm install
npm run compile
# F5 启动调试
```

更多细节（项目架构、数据流、设计决策）见 [DEVELOPMENT.md](./DEVELOPMENT.md)。

---

## 📜 许可证

本插件代码采用 [MIT](LICENSE) 许可证。

所含词典数据分别来自以下开源项目，均按其原始许可证分发：

| 词典 | 来源 | 许可证 |
|------|------|--------|
| 汉→英 | [CC-CEDICT](https://cc-cedict.org/wiki/) | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) |
| 英→汉 | [ECDICT](https://github.com/skywind3000/ECDICT) | [MIT](https://github.com/skywind3000/ECDICT/blob/master/LICENSE)（Copyright © 2017 Linwei） |

## 🙏 致谢

感谢 [CC-CEDICT](https://cc-cedict.org/wiki/) 和 [ECDICT](https://github.com/skywind3000/ECDICT) 提供的优秀开源词典数据。
