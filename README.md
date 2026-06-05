# 汉英本地翻译 (Local Translation)

**🈚 完全离线、无限制的中英双向词典** — 不依赖任何在线 API，无需联网，查询零延迟。

- **汉→英**：基于 CC-CEDICT 开源词典（~12 万词条）
- **英→汉**：基于 ECDICT 开源词典（~77 万词条）
- **编程优化**：驼峰/下划线命名翻译、编程术语精确映射

---

## 📸 功能概览

> 💡 放几张截图会大大提升安装量。按以下提示截图后替换此区域。

| 场景 | 截图建议 |
|------|----------|
| **选中翻译** | 选中一段中文，状态栏右下角显示英文翻译 |
| **QuickPick 面板** | `Ctrl+Shift+T` 打开的详细翻译面板 |
| **Hover 悬停** | 鼠标悬停单词弹出翻译 |
| **批量翻译标识符** | 翻译后的新标签页展示结果 |

---

## ✨ 功能

| 功能 | 触发方式 | 说明 |
|------|----------|------|
| 🚀 **选中即时翻译** | 选中文本 | 状态栏实时显示翻译 |
| 🔍 **详细查询面板** | `Ctrl+Shift+T` | 逐词释义展开、反向复查 |
| 💬 **Hover 悬停翻译** | 鼠标悬停 | 需在设置中开启 |
| 📦 **批量翻译标识符** | 命令面板 | 一键翻译文件中所有中文标识符 |
| 🔀 **中英混合翻译** | 自动检测 | 分别翻译中英文片段后组合输出 |
| ⚡ **编程术语优化** | 内置词典 | `「获取」→「get」` `「字符串」→「string」` |

---

## 🚀 快速上手

### 选中翻译

选中中文或英文 → 状态栏右侧自动显示翻译。

### 详细查询

按 `Ctrl+Shift+T`（Mac: `Cmd+Shift+T`）打开 QuickPick 面板：

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

---

## ⌨️ 快捷键

| 命令 | Windows/Linux | Mac |
|------|---------------|-----|
| 翻译选中文本 | `Ctrl+Shift+T` | `Cmd+Shift+T` |

---

## ❓ 常见问题

**Q: 状态栏一直显示 "Loading dictionaries…"？**

词典数据量较大，首次加载需要几秒。加载完成后即可秒级响应。

**Q: 翻译结果不准确？**

打开 QuickPick 面板（`Ctrl+Shift+T`），利用**反向复查**：点击英文释义 → 反向查中文，人工验证。

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
