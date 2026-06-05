# Development Guide

**localTranslation** — local bidirectional Chinese-English dictionary VS Code extension. Forked from [vscode_english_chinese_dictionary](https://github.com/program-in-chinese/vscode_english_chinese_dictionary).

## Debugging

1. Install dependencies: `npm install`
2. Compile: `npm run compile`
3. Press **F5** in VS Code — an Extension Development Host window opens
4. Select text in the dev window to translate

## Project Structure

```
src/
├── extension.ts          Entry point
├── dictionary.ts         Dual-engine lookup (language detection + routing)
├── loader.ts             Dictionary loading (CC-CEDICT + ECDICT)
├── fileTranslator.ts     Batch identifier translation
├── utils.ts              Utilities
├── translator/
│   ├── segmenter.ts      Chinese word segmentation (Trie + bidirectional MM)
│   ├── enZhProcessor.ts  English word processing (camelCase, word forms, POS)
│   ├── customDict.ts     Custom dictionaries (both directions)
│   ├── constants.ts      POS tags and separators
│   └── types.ts          TypeScript interfaces
└── dictData/
    ├── zhEn/
    │   └── zhEn0~3.ts    CC-CEDICT shards (zh→en, ~120K entries)
    └── enZh/
        ├── enZh0~15.js   ECDICT shards (en→zh, ~770K entries)
        └── forms.js      ECDICT word form data
```

## Updating the zh→en Dictionary

CC-CEDICT data source:

```bash
# 1. Download latest CC-CEDICT
# From https://www.mdbg.net/chinese/dictionary?page=cc-cedict
# Extract cedict_ts.u8 to scripts/tools/

# 2. Regenerate shard files
node scripts/convertDict.js

# 3. Compile
npm run compile
```

## Publishing

```
vsce publish
```

See [official docs](https://code.visualstudio.com/api/working-with-extensions/publishing-extension).

## Architecture

### Layered Design

```
┌─────────────────────────────────────────────────┐
│                  User Interface                 │
│  extension.ts                                   │
│  StatusBar │ QuickPick │ Hover Provider │ Cmd   │
└────────────────────┬────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────┐
│                 Translate Dispatch              │
│  dictionary.ts                                  │
│  detectLang() → zhToEn() / enToZh()             │
│  Phrase match │ Word-by-word │ Aggregation      │
└────────┬───────────────────────────┬────────────┘
         │                           │
┌────────▼──────────┐   ┌────────────▼────────────┐
│   zh→en Pipeline  │   │    en→zh Pipeline       │
│  segmenter.ts     │   │  enZhProcessor.ts       │
│  Trie + Bidirect. │   │  Split │ Lemma │ POS    │
│  MM Segmentation  │   │  customDict.ts          │
│  customDict.ts    │   │                         │
└────────┬──────────┘   └────────────┬────────────┘
         │                           │
┌────────▼───────────────────────────▼────────────┐
│                  Data Loading                   │
│  loader.ts                                      │
│  CC-CEDICT (async import) │ ECDICT (sync req.)  │
└────────────────────┬────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────┐
│                  Dictionary Data                │
│  dictData/zhEn/zhEn*.ts  │  dictData/enZh/*.js       │
│  ~120K entries      │  ~770K entries + forms    │
└─────────────────────────────────────────────────┘
```

### Data Flow Example

Translating the phrase `"获取用户名称"`:

```
"获取用户名称"
    │
    ▼
detectLang() ──→ 'zh'
    │
    ▼
segmenter.tokenize()
    ├── Split by whitespace → ["获取用户名称"]
    ├── Extract Chinese chars → "获取用户名称"
    ├── Forward max match  → ["获取", "用户", "名称"]
    ├── Backward max match → ["获取", "用户", "名称"]
    └── selectBest() → ["获取", "用户", "名称"]
    │
    ▼
Word lookup (priority high → low):
    ① customDict.zhEnNames → "获取"→"get"       (custom dict)
    ② zhEnDict (CC-CEDICT) → "用户"→"user"     (main dict)
    ③ zhEnDict (CC-CEDICT) → "名称"→"name"     (main dict)
    │
    ▼
Phrase match:
    customDict.zhEnPhrases["获取用户名称"] → "getUserName"  ✓
    │
    ▼
Translation {
  original: "获取用户名称",
  definition: "getUserName",
  entries: [
    { word: "获取", definition: "get" },
    { word: "用户", definition: "user" },
    { word: "名称", definition: "name" }
  ]
}
```

### Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| **Bidirectional MM segmentation** | Dictionary-driven, simpler than HMM/CRF; effective for programming identifiers. Fewer word count wins ties; fewer single-char words breaks ties. |
| **Custom dictionary priority** | Programming term mappings (e.g. `"字符串"→"string"`) take precedence over CC-CEDICT general definitions. |
| **Hybrid async + sync loading** | zh→en (~120K) loads async to avoid blocking startup; en→zh (~770K) loads sync so first queries work immediately. |
| **Conservative lemmatization** | Only plural/present participle reduced; past tense etc. left as-is to avoid meaning drift. |
| **POS preference** | en→zh path prefers `[计]` (computing) tags, then specified POS pairings, finally first entry. |

## License

Extension code: **MIT**

Dictionary data:

| Dictionary | Source | License |
|------------|--------|---------|
| zh→en (CC-CEDICT) | [cc-cedict.org](https://cc-cedict.org/wiki/) | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) |
| en→zh (ECDICT) | [skywind3000/ECDICT](https://github.com/skywind3000/ECDICT) | [MIT](https://github.com/skywind3000/ECDICT/blob/master/LICENSE) (Copyright © 2017 Linwei) |
