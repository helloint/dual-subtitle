import fs from 'fs';
import {config} from "./config.js";

/**
 * 合并两个 SRT 字幕文件
 * @param {string} mainSrtPath 主字幕文件路径
 * @param {string} secondarySrtPath 副字幕文件路径
 * @param {string} outputPath 输出文件路径
 */
export const mergeSrtFiles = (mainSrtPath, secondarySrtPath, outputPath) => {
    // 解析 SRT 文件
    const parseSrt = (content) => {
        const blocks = content.split(/\r?\n\r?\n/).filter(b => b.trim());
        return blocks.map(block => {
            const lines = block.split(/\r?\n/);
            const number = parseInt(lines[0]);
            const time = lines[1];
            const text = lines.slice(2).join(' ').replace(/\s+/g, ' ').trim();

            // 解析时间戳
            const timeMatch = time.match(/(\d{2}):(\d{2}):(\d{2}),(\d{3})/g);
            const [start, end] = timeMatch;

            return {
                number,
                time,
                text,
                start: convertTimeToMs(start),
                end: convertTimeToMs(end),
                originalTime: time // 保留原始时间字符串
            };
        });
    };

    // 将时间字符串转换为毫秒
    const convertTimeToMs = (timeStr) => {
        const [h, m, s, ms] = timeStr.split(/:|,/).map(Number);
        return h * 3600000 + m * 60000 + s * 1000 + ms;
    };

    // 读取并解析两个字幕文件
    const mainContent = fs.readFileSync(`${config.workdir}${mainSrtPath}`, 'utf-8');
    const secondaryContent = fs.readFileSync(`${config.workdir}${secondarySrtPath}`, 'utf-8');

    const mainSubtitles = parseSrt(mainContent);
    const secondarySubtitles = parseSrt(secondaryContent);

    // 创建副字幕的副本以便修改
    const availableSecondary = [...secondarySubtitles];
    const mergedSubtitles = [];

    // 首先处理所有主字幕
    for (const mainSub of mainSubtitles) {
        let mergedSub = {...mainSub};

        // 查找匹配的副字幕（开始时间差≤1000ms）
        const matchIndex = availableSecondary.findIndex(secSub =>
            Math.abs(mainSub.start - secSub.start) <= 1000
        );

        if (matchIndex !== -1) {
            // 合并文本（主字幕文本 + 换行 + 副字幕文本）
            mergedSub.text = `${mainSub.text}\n${availableSecondary[matchIndex].text}`;

            // 移除已匹配的副字幕
            availableSecondary.splice(matchIndex, 1);
        }

        mergedSubtitles.push(mergedSub);
    }

    // 添加未匹配的副字幕（使用副字幕的原始时间）
    for (const secSub of availableSecondary) {
        mergedSubtitles.push(secSub);
    }

    // 按开始时间排序
    mergedSubtitles.sort((a, b) => a.start - b.start);

    // 生成合并后的 SRT 内容
    let outputContent = '';
    mergedSubtitles.forEach((sub, index) => {
        outputContent += `${index + 1}\n`;
        outputContent += `${sub.originalTime}\n`; // 使用原始时间字符串
        outputContent += `${sub.text}\n\n`;
    });

    // 写入输出文件
    fs.writeFileSync(`${config.workdir}${outputPath}`, outputContent.trim());
    console.log(`生成双语字幕文件：${outputPath}`);
}
