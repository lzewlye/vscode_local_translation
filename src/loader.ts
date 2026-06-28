/**
 * Dictionary data loader.
 *
 * 加载策略：
 * - zh→en (CC-CEDICT, ~12 万条)：异步 import() 加载 4 个 TypeScript 分片。
 *   加载完成后调用 initSegmenter() 构建分词 Trie。
 * - en→zh (ECDICT, ~77 万条)：同步 require() 加载 16 个预编译 JS 分片。
 *   在模块初始化时即完成，确保首次查询立即可用。
 */
import * as seg from './translator/segmenter';

// ==================== zh→en dictionary (CC-CEDICT) ====================

export const zhEnDict: { [key: string]: string } = {};
export let zhEnReady = false;
export let zhEnPromise: Promise<void>;

const ZH_EN_SHARDS = 4;

async function loadZhEn() {
    try {
        for (let i = 0; i < ZH_EN_SHARDS; i++) {
            const mod: any = await import('./dictData/zhEn/zhEn' + i);
            const data = mod.数据;
            for (const key of Object.keys(data)) {
                zhEnDict[key] = data[key];
            }
        }
        // 词典加载完毕后立即初始化分词器 Trie
        seg.initSegmenter(Object.keys(zhEnDict));
        zhEnReady = true;
    } catch (err) {
        console.error('Failed to load zh→en dictionary:', err);
    }
}

zhEnPromise = loadZhEn();

// ==================== en→zh dictionary (ECDICT) ====================

export const enZhDict: { [key: string]: string } = {};
export const enZhForms: { [key: string]: string } = {};
export let enZhReady = false;

/** 同步加载 ECDICT 数据，模块初始化时立即完成 */
function loadEnZh() {
    try {
        for (let i = 0; i < 16; i++) {
            const mod: any = require('./dictData/enZh/enZh' + i);
            const data = mod.数据;
            for (const key of Object.keys(data)) {
                enZhDict[key] = data[key];
            }
        }
        const formsMod: any = require('./dictData/enZh/forms');
        for (const key of Object.keys(formsMod.数据)) {
            enZhForms[key] = formsMod.数据[key];
        }
        enZhReady = true;
    } catch (err) {
        console.error('Failed to load en→zh dictionary:', err);
    }
}

loadEnZh();
