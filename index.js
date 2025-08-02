#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import {config} from './config.js';
import {findIndex} from './findIndex.js';
import {analyzeMedia} from "./analyzeMedia.js";
import {extractSub} from "./extractSub.js";
import {mergeSrtFiles} from "./mergeSub.js";
import {deleteFile, removeExtension} from "./utils.js";

const main = async () => {
    const mediaFiles = fs.readdirSync(config.workdir).filter((file) => config.exts.includes(path.extname(file)));

    for (const file of mediaFiles) {
        console.log(`正在处理：${file}`);
        const mediaInfo = await analyzeMedia(file);
        const subIndex = findIndex(mediaInfo);
        const srts = await extractSub(file, subIndex);
        mergeSrtFiles(srts[0], srts[1], `${removeExtension(file)}.${config.srtTag}.srt`);
        deleteFile(srts[0]);
        deleteFile(srts[1]);
    }
}

main();
