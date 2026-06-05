/**
 * CC-CEDICT dictionary conversion script.
 *
 * Usage: node scripts/convertDict.js
 * Input:  scripts/cedict_ts.u8
 * Output: src/dictData/zhEn0.ts ~ src/dictData/zhEn3.ts
 *
 * CC-CEDICT format: 傳統 简体 [pinyin] /def1/def2/.../
 * This script uses simplified Chinese as the dictionary key
 * and English definitions as values.
 * Data license: CC BY-SA 4.0
 */

const fs = require('fs');
const path = require('path');

// Config
const inputFile = path.join(__dirname, 'cedict_ts.u8');
const outputDir = path.join(__dirname, '..', 'src', 'dictData');
const shardCount = 4;

// Core data structure: { simplifiedChinese: "def1\\ndef2\\n..." }
const dict = new Map();

// Parse CC-CEDICT file
function parseDictFile() {
    const content = fs.readFileSync(inputFile, 'utf-8');
    const lines = content.split('\n');
    let skipped = 0;
    let parsed = 0;

    for (let line of lines) {
        line = line.trim();

        // Skip empty lines and comments
        if (!line || line.startsWith('#')) {
            skipped++;
            continue;
        }

        // Format: 傳統 简体 [pinyin] /def1/def2/.../
        const result = parseLine(line);
        if (result) {
            parsed++;
            const { simplified, definition } = result;

            // Merge definitions for duplicate keys (some words have multiple entries)
            if (dict.has(simplified)) {
                const existingDef = dict.get(simplified);
                const newDefs = definition.split('\\n').filter(d => !existingDef.includes(d));
                if (newDefs.length > 0) {
                    dict.set(simplified, existingDef + '\\n' + newDefs.join('\\n'));
                }
            } else {
                dict.set(simplified, definition);
            }
        } else {
            skipped++;
        }
    }

    console.log(`Total lines: ${lines.length}`);
    console.log(`Skipped: ${skipped} (comments / empty / parse error)`);
    console.log(`Parsed: ${parsed} entries`);
    console.log(`Unique: ${dict.size} entries`);
}

function parseLine(line) {
    try {
        // Format: 傳統 简体 [pinyin] /def1/def2/.../
        // Some lines lack the traditional field (trad == simp), separated by space

        // Locate [pinyin]
        const pinyinStart = line.indexOf('[');
        const pinyinEnd = line.indexOf(']');

        if (pinyinStart === -1 || pinyinEnd === -1) {
            return null;
        }

        // Chinese field is before pinyin
        const chineseField = line.substring(0, pinyinStart).trim();
        // Definition field is after ]
        const definitionField = line.substring(pinyinEnd + 1).trim();

        if (!chineseField || !definitionField) {
            return null;
        }

        // Split traditional and simplified
        const words = chineseField.split(/\s+/);
        let simplified;
        if (words.length >= 2) {
            simplified = words[1];  // Separate traditional and simplified
        } else {
            simplified = words[0];  // Traditional and simplified are identical
        }

        // Skip pure numbers / punctuation / non-Chinese
        if (!/[一-鿿]/.test(simplified)) {
            return null;
        }

        // Parse definitions: /def1/def2/.../
        const definitions = [];
        const defMatches = definitionField.matchAll(/\/([^/]*)/g);
        for (const m of defMatches) {
            const def = m[1].trim();
            if (def && !def.startsWith('CL:') && !def.startsWith('variant of')) {
                definitions.push(def);
            }
        }

        if (definitions.length === 0) {
            return null;
        }

        return {
            simplified: simplified,
            definition: definitions.join('\\n')
        };
    } catch (e) {
        return null;
    }
}

// Sort by Unicode and split into shards
function generateShards() {
    const sorted = Array.from(dict.entries()).sort((a, b) => a[0].localeCompare(b[0], 'zh'));
    const shardSize = Math.ceil(sorted.length / shardCount);

    console.log(`\nShards: ${shardCount}, ~${shardSize} entries each`);

    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    for (let i = 0; i < shardCount; i++) {
        const start = i * shardSize;
        const end = Math.min(start + shardSize, sorted.length);
        const shardData = sorted.slice(start, end);

        let output = 'export const 数据 = {\n';
        for (const [key, def] of shardData) {
            // Escape double quotes and backslashes
            const escapedKey = key.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
            const escapedDef = def.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
            output += `  "${escapedKey}": "${escapedDef}",\n`;
        }
        output += '};\n';

        const outputFile = path.join(outputDir, 'zhEn', `zhEn${i}.ts`);
        fs.writeFileSync(outputFile, output, 'utf-8');
        console.log(`Generated: ${outputFile} (${shardData.length} entries)`);
    }
}

// Main
console.log('=== CC-CEDICT Dictionary Converter ===\n');
console.log(`Input: ${inputFile}`);

if (!fs.existsSync(inputFile)) {
    console.error(`Error: input file not found: ${inputFile}`);
    console.error('Download CC-CEDICT from https://www.mdbg.net/chinese/dictionary?page=cc-cedict');
    process.exit(1);
}

parseDictFile();
generateShards();
console.log('\nDone!');
