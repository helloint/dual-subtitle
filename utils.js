import fs from 'fs';
import readline from 'readline';
import {config} from "./config.js";

export const removeExtension = (filename) => {
    const lastDotIndex = filename.lastIndexOf('.');
    return lastDotIndex === -1 ? filename : filename.slice(0, lastDotIndex);
}

export const deleteFile = (filename) => {
    fs.unlinkSync(config.workdir + filename);
}

/**
 * 等待指定毫秒，期间显示倒计时（数字每秒更新），任意键中断。
 * @param {number} ms 总等待时间（毫秒）
 * @param {string} prefix 倒计时前的提示文案（同一行）
 * @returns {Promise<boolean>} 是否被按键中断
 */
export const waitForInterruptWithCountdown = (ms, prefix) => {
    return new Promise((resolve) => {
        if (!process.stdin.isTTY) {
            setTimeout(() => resolve(false), ms);
            return;
        }
        const stdin = process.stdin;
        const wasRaw = stdin.isRaw || false;
        if (!wasRaw) stdin.setRawMode(true);
        stdin.resume();
        stdin.setEncoding('utf8');

        const totalSec = Math.ceil(ms / 1000);
        let leftSec = totalSec;

        const formatCountdown = (sec) => {
            // 使用高亮颜色和箭头让数字更醒目
            const YELLOW = '\x1b[33m';
            const BOLD = '\x1b[1m';
            const RESET = '\x1b[0m';
            return `${prefix}  ${YELLOW}${BOLD}>>> ${sec} <<<${RESET}`;
        };

        const writeLine = () => {
            readline.cursorTo(process.stdout, 0);
            readline.clearLine(process.stdout, 0);
            process.stdout.write(formatCountdown(leftSec));
        };

        writeLine();

        let tickId;
        tickId = setInterval(() => {
            leftSec -= 1;
            if (leftSec <= 0) {
                clearInterval(tickId);
                cleanup();
                readline.cursorTo(process.stdout, 0);
                readline.clearLine(process.stdout, 0);
                resolve(false);
                return;
            }
            writeLine();
        }, 1000);

        const cleanup = () => {
            if (tickId) clearInterval(tickId);
            stdin.removeListener('data', onKeyPress);
            if (!wasRaw) stdin.setRawMode(false);
            stdin.pause();
        };

        const onKeyPress = (key) => {
            if (key === '\u0003') {
                cleanup();
                process.exit(0);
            }
            cleanup();
            resolve(true);
        };
        stdin.on('data', onKeyPress);
    });
};
