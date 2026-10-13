#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import readline from 'readline';
import subtitleMerge from "subtitle-merge";
import { config } from './config.js';
import { findSub } from './findSub.js';
import { analyzeMedia } from "./analyzeMedia.js";
import { extractSub } from "./extractSub.js";
import { deleteFile, removeExtension, waitForInterruptWithCountdown } from "./utils.js";
import { t } from './i18n.js';

const main = async () => {
    const mediaFiles = fs.readdirSync(config.workdir).filter((file) => config.exts.includes(path.extname(file)));

    if (mediaFiles.length === 0) {
        console.log(t('noVideoFiles'));
        return;
    }

    const targetFiles = await selectMediaFiles(mediaFiles);

    for (const file of targetFiles) {
        console.log(t('processingFile', { file }));
        const subTitles = await analyzeMedia(file);
        const targetSubs = await findSub(subTitles);
        const srts = await extractSub(file, targetSubs);
        
        // 使用字幕的 code 生成输出文件名；流里是 chi 时对外输出为 chs（简体中文）
        const toOutputCode = (code) => (code === 'chi' ? 'chs' : code);
        const code1 = toOutputCode(targetSubs[0].code) || `sub${targetSubs[0].index}`;
        const code2 = toOutputCode(targetSubs[1].code) || `sub${targetSubs[1].index}`;
        const outputSrt = `${config.workdir}${removeExtension(file)}.${code1}-${code2}.srt`;
        
        subtitleMerge(config.workdir + srts[0], config.workdir + srts[1], outputSrt);
        deleteFile(srts[0]);
        deleteFile(srts[1]);
    }
}

/**
 * 多个视频时先倒计时提示：超时默认处理全部；按键中断则列出视频，由用户输入序号选择。
 */
const selectMediaFiles = async (mediaFiles) => {
    if (mediaFiles.length <= 1) return mediaFiles;

    const interrupted = await waitForInterruptWithCountdown(
        3000,
        t('multiVideoCountdownPrefix', { count: mediaFiles.length }),
    );
    if (!interrupted) return mediaFiles;

    console.log(t('videoList'));
    mediaFiles.forEach((file, idx) => {
        console.log(t('videoListItem'), idx + 1, file);
    });
    return await promptForVideoIndexes(mediaFiles);
};

/**
 * 支持输入多个序号，用逗号或空格分隔，如 "1,3" / "1 3"
 */
const promptForVideoIndexes = (mediaFiles) => {
    return new Promise((resolve) => {
        const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
        const ask = () => {
            rl.question(t('promptVideoIndex', { max: mediaFiles.length }), (answer) => {
                const trimmed = answer.trim();
                if (trimmed === '') {
                    console.log(t('exited'));
                    rl.close();
                    process.exit(0);
                }
                const values = trimmed.split(/[\s,，]+/).filter(Boolean).map(Number);
                const valid = values.every((v) => Number.isInteger(v) && v >= 1 && v <= mediaFiles.length);
                if (!valid) {
                    console.log(t('invalidVideoIndex', { max: mediaFiles.length }));
                    ask();
                    return;
                }
                rl.close();
                resolve([...new Set(values)].map((v) => mediaFiles[v - 1]));
            });
        };
        ask();
    });
};

main();
