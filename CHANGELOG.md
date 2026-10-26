# 更新日志

## 1.1.1

- 建立 400 条人工审核金标集、固定种子属性测试、2,000 词条抽查和 10,000 次热查询性能基线
- 修复三种 `variableNamingStyle` 配置未实际生效的问题
- 修复中英混合翻译丢失英文原词，以及批量替换误解析正则特殊字符的问题
- 迁移到 `@vscode/test-electron`，并增加 VSIX 词典完整性、唯一性和 22 MiB 体积检查
- 修复 VSIX 重复打包 ECDICT 源文件的问题

## 1.1.0

- 🆕 快速翻译中文变量名：选中中文 → `Ctrl+Shift+T` → 一键替换为英文变量名
- 支持三种命名风格（设置 `localTranslation.variableNamingStyle`）：
  - `camelCase` 小驼峰（默认）
  - `PascalCase` 大驼峰
  - `snake_case` 下划线
- `Ctrl+Shift+T` 重新分配给快速翻译；QuickPick 面板不再绑定默认快捷键

## 1.0.2

- 限制最大翻译词数，防止一次性选取过多内容导致翻译缓慢（默认 20，可在设置中修改 `localTranslation.maxWords`）
- 超限时 QuickPick 面板、状态栏、批量翻译均显示截断提示
- 批量翻译标识符超出上限时弹出警告，引导用户缩小范围或调整配置

## 1.0.1

- 更新 README 文档，完善使用说明
- 修复特定内容翻译错误

## 1.0.0

- 基于 CC-CEDICT（~12 万词条）重写，实现汉译英功能
- 内置 Trie + 双向最大匹配中文分词算法
- 自定义编程术语词典（~100 常用词条）
- 支持中英文混合文本翻译
- Hover 悬停翻译
- 批量翻译中文标识符
- 状态栏加载状态提示
- 快捷键 Ctrl+Shift+T / Cmd+Shift+T 快速翻译
