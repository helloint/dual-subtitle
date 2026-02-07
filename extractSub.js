import readline from 'readline';
import { execSync } from 'child_process';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import ffmpeg from 'fluent-ffmpeg';
import { config } from "./config.js";
import { removeExtension } from "./utils.js";
import { t } from './i18n.js';

const getFFmpegPath = () => {
    try {
        // 检查系统是否安装了 ffprobe
        execSync('ffmpeg -version', { stdio: 'ignore' });
        // 如果能执行到这里，说明系统已安装
        console.log(t('usingLocalFfmpeg'));
        return 'ffmpeg'; // 返回系统命令
    } catch (e) {
        return ffmpegInstaller.path;
    }
}

const formatSeconds = (totalSeconds) => {
    if (!isFinite(totalSeconds) || totalSeconds < 0) totalSeconds = 0;
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);
    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

/**
 * "timemark":"00:06:52.07"
 * @param timemark
 * @returns {number}
 */
const timemarkToSeconds = (timemark) => {
    const [hms, ms] = timemark.split('.');
    const [h, m, s] = hms.split(':');
    return (+h * 3600) + (+m * 60) + (+s) + (+ms / 100);
}

export const extractSub = (filename, targetSubs) => {
    return new Promise((resolve, reject) => {
        // 使用字幕的 code 或 index 来生成文件名
        const code1 = targetSubs[0].code || `sub${targetSubs[0].index}`;
        const code2 = targetSubs[1].code || `sub${targetSubs[1].index}`;
        const mainSrt = `${removeExtension(filename)}.${code1}.srt`;
        const secondarySrt = `${removeExtension(filename)}.${code2}.srt`;
        const duration = targetSubs[0].duration;
        let startTs = 0;

        ffmpeg.setFfmpegPath(getFFmpegPath());
        ffmpeg(config.workdir + filename)
            .output(config.workdir + mainSrt)
            .outputOptions(['-map', `0:${targetSubs[0].index}`, '-c', 'copy'])
            .output(config.workdir + secondarySrt)
            .outputOptions(['-map', `0:${targetSubs[1].index}`, '-c', 'copy'])
            .run()
            .on('start', function (str) {
                console.log(t('extractingStart'), str);
                startTs = Date.now();
            })
            .on('progress', function (progress) {
                const fraction = Math.max(0, Math.min(1, timemarkToSeconds(progress.timemark) / duration));
                const progressPercent = Math.round((fraction) * 100);
                const elapsedSec = startTs ? (Date.now() - startTs) / 1000 : 0;
                const remainingSec = fraction > 0 ? elapsedSec * (1 - fraction) / fraction : 0;
                readline.cursorTo(process.stdout, 0);
                process.stdout.write(
                    t('extractingProgress', {
                        progressPercent,
                        remaining: formatSeconds(remainingSec),
                    }),
                );
            })
            .on('end', function (str) {
                console.log(t('extractingDone'));
                resolve([mainSrt, secondarySrt]);
            })
            .on('error', function (err) {
                console.log(t('extractingError', { err }));
                reject(err);
            });
    });
};
