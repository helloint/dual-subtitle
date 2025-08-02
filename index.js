#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import subtitleMerge from "subtitle-merge";
import {config} from './config.js';
import {findSub} from './findSub.js';
import {analyzeMedia} from "./analyzeMedia.js";
import {extractSub} from "./extractSub.js";
import {deleteFile, removeExtension} from "./utils.js";

const main = async () => {
    const mediaFiles = fs.readdirSync(config.workdir).filter((file) => config.exts.includes(path.extname(file)));

    for (const file of mediaFiles) {
        console.log(`正在处理：${file}`);
        const subTitles = await analyzeMedia(file);
        const targetSubs = findSub(subTitles);
        const srts = await extractSub(file, targetSubs);
        subtitleMerge(config.workdir + srts[0], config.workdir + srts[1], `${config.workdir}${removeExtension(file)}.${config.srtTag}.srt`);
        deleteFile(srts[0]);
        deleteFile(srts[1]);
    }
}

main();
