#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import subtitleMerge from "subtitle-merge";
import { config } from './config.js';
import { findSub } from './findSub.js';
import { analyzeMedia } from "./analyzeMedia.js";
import { extractSub } from "./extractSub.js";
import { deleteFile, removeExtension } from "./utils.js";
import { t } from './i18n.js';

const main = async () => {
    const mediaFiles = fs.readdirSync(config.workdir).filter((file) => config.exts.includes(path.extname(file)));

    for (const file of mediaFiles) {
        console.log(t('processingFile', { file }));
        const subTitles = await analyzeMedia(file);
        const targetSubs = await findSub(subTitles);
        const srts = await extractSub(file, targetSubs);
        
        // 使用字幕的 code 来生成输出文件名
        const code1 = targetSubs[0].code || `sub${targetSubs[0].index}`;
        const code2 = targetSubs[1].code || `sub${targetSubs[1].index}`;
        const outputSrt = `${config.workdir}${removeExtension(file)}.${code1}-${code2}.srt`;
        
        subtitleMerge(config.workdir + srts[0], config.workdir + srts[1], outputSrt);
        deleteFile(srts[0]);
        deleteFile(srts[1]);
    }
}

main();
