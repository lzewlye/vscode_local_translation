/**
 * Custom dictionaries — always take priority over CC-CEDICT / ECDICT.
 *
 * 自定义词典在查词时优先级最高，确保编程术语翻译精确。
 * zh→en：中文编程术语 → 英文标识符
 * en→zh：英文编程术语 → 中文翻译
 *
 * Stop words / skip words 用于过滤常见虚词，减少界面干扰。
 */

// ==================== zh→en custom mappings ====================

/** 中文编程术语 → 英文标识符（优先级高于 CC-CEDICT 主词典） */
export const zhEnNames: { [key: string]: string } = {
    "文本": "text", "字符串": "string", "数字": "number", "整数": "integer",
    "数组": "array", "对象": "object", "函数": "function", "方法": "method",
    "类": "class", "接口": "interface", "文件": "file", "路径": "path",
    "名称": "name", "类型": "type", "值": "value", "键": "key",
    "时间": "time", "日期": "date", "事件": "event", "异常": "exception",
    "错误": "error", "长度": "length", "大小": "size", "计数": "count",
    "索引": "index", "默认": "default", "参数": "parameter",
    "输入": "input", "输出": "output", "获取": "get", "设置": "set",
    "添加": "add", "删除": "remove", "创建": "create", "更新": "update",
    "查找": "find", "搜索": "search", "排序": "sort", "过滤": "filter",
    "映射": "map", "转换": "convert", "新": "new", "旧": "old",
    "开始": "start", "结束": "end", "打开": "open", "关闭": "close",
    "读取": "read", "写入": "write", "保存": "save", "加载": "load",
    "发送": "send", "接收": "receive", "请求": "request", "响应": "response",
    "状态": "status", "配置": "config", "选项": "option", "数据": "data",
    "列表": "list", "元素": "element", "节点": "node", "树": "tree",
    "图": "graph", "表": "table", "列": "column", "行": "row",
    "颜色": "color", "宽度": "width", "高度": "height",
    "显示": "display", "隐藏": "hide", "返回": "return", "结果": "result",
    "消息": "message", "日志": "log", "模板": "template", "样式": "style",
    "主题": "theme", "语言": "language", "版本": "version",
    "权限": "permission", "用户": "user", "密码": "password",
    "邮箱": "email", "地址": "address", "电话": "phone", "链接": "link",
    "图片": "image", "视频": "video", "音频": "audio", "模式": "mode",
    "视图": "view", "控件": "widget", "按钮": "button", "菜单": "menu",
    "窗口": "window", "对话框": "dialog", "光标": "cursor",
    "鼠标": "mouse", "键盘": "keyboard", "屏幕": "screen",
    "内存": "memory", "缓存": "cache", "线程": "thread", "进程": "process",
    "服务": "service", "服务器": "server", "客户端": "client",
    "数据库": "database", "网络": "network", "端口": "port",
    "协议": "protocol", "证书": "certificate",
    "编码": "encode", "解码": "decode", "加密": "encrypt", "解密": "decrypt",
    "哈希": "hash", "签名": "signature",
};

/** 中文短语 → 英文标识符（多词组合的整体翻译，覆盖逐词拼接结果） */
export const zhEnPhrases: { [key: string]: string } = {
    "获取数据": "getData", "设置数据": "setData",
    "用户名称": "userName", "用户密码": "userPassword",
    "文件名": "fileName", "文件路径": "filePath",
    "开始时间": "startTime", "结束时间": "endTime",
    "创建时间": "createTime", "更新时间": "updateTime",
    "事件处理": "eventHandler", "错误消息": "errorMessage",
    "状态码": "statusCode", "请求头": "requestHeader", "响应体": "responseBody",
    "打开文件": "openFile", "保存文件": "saveFile",
    "发送消息": "sendMessage", "接收数据": "receiveData",
    "新建文件": "newFile", "删除文件": "deleteFile",
};

/**
 * 中文停用词 — 常见的虚词、助词，在逐词翻译时通常不携带核心语义。
 * QuickPick 中这些词不再被隐藏（alwaysShow=true），保留此集合供将来扩展。
 */
export const zhStopWords: Set<string> = new Set([
    "的", "了", "是", "在", "和", "与", "或", "及",
    "之", "为", "而", "且", "就", "都", "也", "还",
    "被", "把", "从", "对", "向", "给", "让", "用",
]);

// ==================== en→zh custom mappings ====================

/** 英文编程术语 → 中文翻译（优先级高于 ECDICT 主词典） */
export const enZhNames: { [key: string]: string } = {
    "text": "文本", "get": "获取", "util": "功用", "hash": "哈希",
    "set": "置", "is": "为", "exception": "例外", "key": "键",
    "type": "类型", "name": "名称", "listener": "监听器",
    "class": "类", "method": "方法", "time": "时间", "event": "事件",
    "file": "文件", "new": "新", "add": "添加", "stream": "流",
    "default": "默认", "count": "计数", "focus": "聚焦",
    "value": "值", "input": "输入", "date": "日期", "long": "长整型",
    "size": "大小", "thread": "线程", "path": "路径",
    "parameter": "参数", "remove": "删除",
    "string": "字符串", "number": "数字", "array": "数组",
    "object": "对象", "index": "索引", "data": "数据",
    "list": "列表", "node": "节点", "user": "用户",
    "status": "状态", "config": "配置", "option": "选项",
};

/** 英文短语 → 中文翻译 */
export const enZhPhrases: { [key: string]: string } = {
    "get started": "启动",
};

/**
 * 英文跳过词 — 这些词在 en→zh 翻译中保留原文不翻译。
 * 通常为常见介词、冠词等虚词。
 */
export const enZhSkipWords: { [key: string]: boolean } = {
    "to": false, "of": false, "bean": false,
};
