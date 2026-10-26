export type BenchmarkCategory = 'en-word' | 'identifier' | 'zh-name' | 'edge';

export interface BenchmarkProvenance {
    source: string;
    license: string;
    url?: string;
}

export interface BenchmarkCase {
    id: string;
    category: BenchmarkCategory;
    input: string;
    accepted: string[];
    expectedTokens?: string[];
    critical: boolean;
    provenance: BenchmarkProvenance;
}

const vscodeLoc: BenchmarkProvenance = {
    source: 'VS Code English strings and Simplified Chinese language pack; expected terms reviewed by this project',
    license: 'MIT',
    url: 'https://github.com/microsoft/vscode-loc',
};

const mdn: BenchmarkProvenance = {
    source: 'MDN glossary headings; expected Chinese terms reviewed by this project; no prose copied',
    license: 'CC-BY-SA-2.5-or-later',
    url: 'https://github.com/mdn/content/tree/main/files/en-us/glossary',
};

const project: BenchmarkProvenance = {
    source: 'Project-authored regression and developer naming cases',
    license: 'MIT',
};

type TermSpec = readonly [string, readonly string[], BenchmarkProvenance?];

const programmingTerms: readonly TermSpec[] = [
    ['text', ['文本']], ['file', ['文件']], ['folder', ['文件夹', '目录']],
    ['path', ['路径']], ['name', ['名称', '名字']], ['type', ['类型']],
    ['value', ['值']], ['key', ['键']], ['index', ['索引']],
    ['array', ['数组']], ['object', ['对象']], ['string', ['字符串']],
    ['number', ['数字', '数']], ['boolean', ['布尔']], ['function', ['函数']],
    ['method', ['方法']], ['class', ['类']], ['interface', ['接口']],
    ['module', ['模块']], ['package', ['包']], ['library', ['库']],
    ['framework', ['框架']], ['component', ['组件']], ['variable', ['变量']],
    ['constant', ['常量']], ['parameter', ['参数']], ['argument', ['参数', '实参']],
    ['return', ['返回']], ['result', ['结果']], ['error', ['错误']],
    ['exception', ['异常', '例外']], ['warning', ['警告']], ['message', ['消息']],
    ['log', ['日志']], ['debug', ['调试']], ['breakpoint', ['断点']],
    ['stack', ['栈', '堆栈']], ['heap', ['堆']], ['thread', ['线程']],
    ['process', ['进程']], ['memory', ['内存']], ['cache', ['缓存']],
    ['buffer', ['缓冲', '缓冲区']], ['stream', ['流']], ['event', ['事件']],
    ['listener', ['监听器']], ['handler', ['处理程序', '处理器']], ['callback', ['回调']],
    ['promise', ['承诺', '期约']], ['async', ['异步']], ['await', ['等待']],
    ['request', ['请求']], ['response', ['响应']], ['header', ['头', '标头']],
    ['body', ['主体', '正文']], ['payload', ['有效载荷', '负载']], ['client', ['客户端']],
    ['server', ['服务器']], ['network', ['网络']], ['protocol', ['协议']],
    ['port', ['端口']], ['socket', ['套接字']], ['connection', ['连接']],
    ['timeout', ['超时']], ['retry', ['重试']], ['proxy', ['代理']],
    ['router', ['路由器']], ['route', ['路由']], ['endpoint', ['端点']],
    ['api', ['接口', 'API']], ['database', ['数据库']], ['query', ['查询']],
    ['table', ['表']], ['row', ['行']], ['column', ['列']],
    ['record', ['记录']], ['schema', ['模式', '架构']], ['transaction', ['事务']],
    ['commit', ['提交']], ['rollback', ['回滚']], ['repository', ['仓库', '存储库']],
    ['branch', ['分支']], ['merge', ['合并']], ['rebase', ['变基']],
    ['clone', ['克隆']], ['push', ['推送']], ['pull', ['拉取']],
    ['fetch', ['获取']], ['diff', ['差异']], ['patch', ['补丁']],
    ['conflict', ['冲突']], ['terminal', ['终端']], ['shell', ['外壳', '命令行']],
    ['command', ['命令']], ['task', ['任务']], ['build', ['构建']],
    ['compile', ['编译']], ['bundle', ['包', '捆绑']], ['deploy', ['部署']],
    ['release', ['发布']], ['extension', ['扩展']], ['plugin', ['插件']],
    ['editor', ['编辑器']], ['workspace', ['工作区']], ['window', ['窗口']],
    ['panel', ['面板']], ['sidebar', ['侧边栏']], ['toolbar', ['工具栏']],
    ['status', ['状态']], ['setting', ['设置']], ['configuration', ['配置']],
    ['theme', ['主题']], ['icon', ['图标']], ['cursor', ['光标']],
    ['selection', ['选择']], ['clipboard', ['剪贴板']], ['hover', ['悬停']],
    ['preview', ['预览']], ['markdown', ['标记语言', 'Markdown']], ['syntax', ['语法']],
    ['token', ['令牌', '标记']], ['parser', ['解析器']], ['compiler', ['编译器']],
    ['interpreter', ['解释器']], ['runtime', ['运行时']], ['dependency', ['依赖']],
    ['version', ['版本']], ['environment', ['环境']], ['platform', ['平台']],
    ['architecture', ['架构']], ['algorithm', ['算法']], ['data', ['数据']],
    ['structure', ['结构']], ['tree', ['树']], ['graph', ['图']],
    ['node', ['节点']], ['queue', ['队列']], ['map', ['映射']],
    ['set', ['集合', '设置']], ['hash', ['哈希']], ['sort', ['排序']],
    ['filter', ['过滤']], ['search', ['搜索']], ['test', ['测试']],
    ['mock', ['模拟']], ['stub', ['存根']], ['fixture', ['夹具', '固定数据']],
    ['assertion', ['断言']], ['coverage', ['覆盖率']], ['benchmark', ['基准']],
];

interface IdentifierBase {
    tokens: string[];
    accepted: string[];
}

const identifierBases: IdentifierBase[] = [
    { tokens: ['get', 'user', 'name'], accepted: ['获取用户名称'] },
    { tokens: ['set', 'file', 'path'], accepted: ['设置文件路径', '置文件路径'] },
    { tokens: ['parse', 'json', 'data'], accepted: ['解析JSON数据', '解析json数据'] },
    { tokens: ['handle', 'request', 'error'], accepted: ['处理请求错误'] },
    { tokens: ['create', 'cache', 'key'], accepted: ['创建缓存键'] },
    { tokens: ['update', 'user', 'profile'], accepted: ['更新用户配置', '更新用户资料'] },
    { tokens: ['remove', 'event', 'listener'], accepted: ['删除事件监听器'] },
    { tokens: ['load', 'config', 'file'], accepted: ['加载配置文件'] },
    { tokens: ['save', 'editor', 'state'], accepted: ['保存编辑器状态'] },
    { tokens: ['send', 'http', 'request'], accepted: ['发送HTTP请求', '发送http请求'] },
    { tokens: ['receive', 'api', 'response'], accepted: ['接收接口响应', '接收API响应'] },
    { tokens: ['build', 'syntax', 'tree'], accepted: ['构建语法树'] },
    { tokens: ['find', 'active', 'editor'], accepted: ['查找活动编辑器'] },
    { tokens: ['open', 'terminal', 'panel'], accepted: ['打开终端面板'] },
    { tokens: ['close', 'database', 'connection'], accepted: ['关闭数据库连接'] },
    { tokens: ['validate', 'input', 'value'], accepted: ['验证输入值'] },
    { tokens: ['format', 'error', 'message'], accepted: ['格式化错误消息'] },
    { tokens: ['retry', 'failed', 'task'], accepted: ['重试失败任务'] },
    { tokens: ['sort', 'result', 'list'], accepted: ['排序结果列表'] },
    { tokens: ['filter', 'hidden', 'files'], accepted: ['过滤隐藏文件'] },
];

const identifierSpecials: IdentifierBase[] = [
    { tokens: ['HTTP', 'Server'], accepted: ['HTTP服务器'] },
    { tokens: ['JSON', 'Parser'], accepted: ['JSON解析器'] },
    { tokens: ['parse', 'JSON'], accepted: ['解析JSON'] },
    { tokens: ['IPv', 'Address'], accepted: ['IP地址'] },
    { tokens: ['UTF', 'Decoder'], accepted: ['UTF解码器'] },
    { tokens: ['OAuth', 'Client'], accepted: ['OAuth客户端'] },
    { tokens: ['VS', 'Code', 'Extension'], accepted: ['VS Code扩展'] },
    { tokens: ['XML', 'Http', 'Request'], accepted: ['XML HTTP请求'] },
    { tokens: ['URL', 'Path'], accepted: ['URL路径'] },
    { tokens: ['API', 'Response'], accepted: ['API响应'] },
    { tokens: ['get', 'HTTP', 'Status'], accepted: ['获取HTTP状态'] },
    { tokens: ['create', 'UUID'], accepted: ['创建UUID'] },
    { tokens: ['sha', 'Hash'], accepted: ['SHA哈希'] },
    { tokens: ['user', 'FA', 'Status'], accepted: ['用户双因素认证状态'] },
    { tokens: ['version', 'Config'], accepted: ['版本配置'] },
    { tokens: ['on', 'Did', 'Change', 'Text'], accepted: ['文本变更时'] },
    { tokens: ['cache', 'Key'], accepted: ['缓存键'] },
    { tokens: ['private', 'Value'], accepted: ['私有值'] },
    { tokens: ['dirname'], accepted: ['目录名'] },
    { tokens: ['React', 'DOM', 'Node'], accepted: ['React DOM节点'] },
];

const namingVerbs: readonly (readonly [string, string])[] = [
    ['获取', 'get'], ['设置', 'set'], ['添加', 'add'], ['删除', 'remove'],
    ['创建', 'create'], ['更新', 'update'], ['查找', 'find'], ['搜索', 'search'],
    ['排序', 'sort'], ['过滤', 'filter'], ['映射', 'map'], ['转换', 'convert'],
    ['打开', 'open'], ['关闭', 'close'], ['读取', 'read'], ['写入', 'write'],
    ['保存', 'save'], ['加载', 'load'], ['发送', 'send'], ['接收', 'receive'],
];

const namingObjects: readonly (readonly [string, readonly string[]])[] = [
    ['用户名称', ['user', 'name']],
    ['文件路径', ['file', 'path']],
    ['错误消息', ['error', 'message']],
    ['数据列表', ['data', 'list']],
    ['缓存键', ['cache', 'key']],
];

const edgeSpecs: readonly (readonly [string, readonly string[], (readonly string[])?])[] = [
    ['', ['']], [' ', ['']], ['   ', ['']], ['---', ['---']], ['...', ['...']],
    ['123', ['123']], ['___', ['___']], ['$', ['$']], ['🙂', ['🙂']], ['unknownwordxyz', ['unknownwordxyz']],
    ['使用Python', ['usePython'], ['使用', 'Python']],
    ['读取JSON数据', ['readJSONdata'], ['读取', 'JSON', '数据']],
    ['保存HTTP响应', ['saveHTTPresponse'], ['保存', 'HTTP', '响应']],
    ['打开VSCode窗口', ['openVSCodewindow'], ['打开', 'VS', 'Code', '窗口']],
    ['创建UUID值', ['createUUIDvalue'], ['创建', 'UUID', '值']],
    ['user名称', ['userName'], ['user', '名称']],
    ['file路径', ['filePath'], ['file', '路径']],
    ['error消息', ['errorMessage'], ['error', '消息']],
    ['缓存cache', ['cachecache'], ['缓存', 'cache']],
    ['解析JSON', ['parseJSON'], ['解析', 'JSON']],
    ['中文-with-English', ['中文withEnglish'], ['中文', 'with', 'English']],
    ['get用户Name', ['getUserName'], ['get', '用户', 'Name']],
    ['HTTP请求2', ['HTTPRequest'], ['HTTP', '请求']],
    ['版本v1配置', ['versionvConfig'], ['版本', 'v', '配置']],
    ['snake_case变量', ['snakecaseVariable'], ['snake', 'case', '变量']],
    ['camelCase变量', ['camelCaseVariable'], ['camel', 'Case', '变量']],
    ['重复repeat重复', ['repeat'], ['重复', 'repeat', '重复']],
    ['前缀API后缀', ['prefixAPIsuffix'], ['前缀', 'API', '后缀']],
    ['读取 file', ['readfile'], ['读取', 'file']],
    ['写入\tlog', ['writelog'], ['写入', 'log']],
    ...Array.from({ length: 20 }, (_, index) => {
        const count = index + 1;
        const input = Array.from({ length: count }, () => 'file').join(' ');
        return [input, ['文件'], Array.from({ length: count }, () => 'file')] as const;
    }),
];

function camel(tokens: readonly string[]): string {
    return tokens.map((token, index) => index === 0
        ? token.toLowerCase()
        : token.charAt(0).toUpperCase() + token.slice(1).toLowerCase()).join('');
}

function pascal(tokens: readonly string[]): string {
    return tokens.map(token => token.charAt(0).toUpperCase() + token.slice(1).toLowerCase()).join('');
}

const identifierVariants = [
    (tokens: string[]) => camel(tokens),
    (tokens: string[]) => pascal(tokens),
    (tokens: string[]) => tokens.join('_'),
    (tokens: string[]) => tokens.join('-'),
];

const criticalEnWords = new Set([
    'text', 'file', 'path', 'name', 'type', 'value', 'key', 'index', 'array', 'object',
    'string', 'number', 'method', 'class', 'event', 'error', 'message', 'status', 'database', 'query',
]);

const enWordCases: BenchmarkCase[] = programmingTerms.map((spec, index) => ({
    id: `en-word-${String(index + 1).padStart(3, '0')}`,
    category: 'en-word',
    input: spec[0],
    accepted: [...spec[1]],
    critical: criticalEnWords.has(spec[0]),
    provenance: spec[2] || (index < 120 ? vscodeLoc : mdn),
}));

const regularIdentifierCases: BenchmarkCase[] = identifierBases.flatMap((base, baseIndex) =>
    identifierVariants.map((variant, variantIndex) => ({
        id: `identifier-${String(baseIndex * identifierVariants.length + variantIndex + 1).padStart(3, '0')}`,
        category: 'identifier' as const,
        input: variant(base.tokens),
        accepted: [...base.accepted],
        expectedTokens: [...base.tokens],
        critical: baseIndex < 2 || (baseIndex === 6 && variantIndex < 2),
        provenance: project,
    }))
);

const specialIdentifierInputs = [
    'HTTPServer', 'JSONParser', 'parseJSON', 'IPv6Address', 'UTF8Decoder',
    'OAuth2Client', 'VSCodeExtension', 'XMLHttpRequest', 'URLPath', 'APIResponse',
    'getHTTPStatus', 'createUUID', 'sha256Hash', 'user2FAStatus', 'version1Config',
    'onDidChangeText', '$cacheKey', '_privateValue', '__dirname', 'ReactDOMNode',
];

const specialIdentifierCases: BenchmarkCase[] = identifierSpecials.map((base, index) => ({
    id: `identifier-${String(81 + index).padStart(3, '0')}`,
    category: 'identifier',
    input: specialIdentifierInputs[index],
    accepted: [...base.accepted],
    expectedTokens: [...base.tokens],
    critical: false,
    provenance: project,
}));

const zhNameCases: BenchmarkCase[] = namingVerbs.flatMap(([zhVerb, enVerb], verbIndex) =>
    namingObjects.map(([zhObject, enObject], objectIndex) => {
        const index = verbIndex * namingObjects.length + objectIndex;
        return {
            id: `zh-name-${String(index + 1).padStart(3, '0')}`,
            category: 'zh-name' as const,
            input: `${zhVerb}${zhObject}`,
            accepted: [camel([enVerb, ...enObject])],
            expectedTokens: [enVerb, ...enObject],
            critical: index < 10,
            provenance: project,
        };
    })
);

const edgeCases: BenchmarkCase[] = edgeSpecs.map((spec, index) => ({
    id: `edge-${String(index + 1).padStart(3, '0')}`,
    category: 'edge',
    input: spec[0],
    accepted: [...spec[1]],
    expectedTokens: spec[2] ? [...spec[2]] : undefined,
    critical: false,
    provenance: project,
}));

export const benchmarkCases: BenchmarkCase[] = [
    ...enWordCases,
    ...regularIdentifierCases,
    ...specialIdentifierCases,
    ...zhNameCases,
    ...edgeCases,
];
