import readline from 'readline';
import { execSync } from 'child_process';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import ffmpeg from 'fluent-ffmpeg';
import {config} from "./config.js";
import {removeExtension} from "./utils.js";

const getFFmpegPath = () => {
    try {
        // 检查系统是否安装了 ffprobe
        execSync('ffmpeg -version', { stdio: 'ignore' });
        // 如果能执行到这里，说明系统已安装
        console.log('使用本地ffmpeg');
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
        const mainSrt = `${removeExtension(filename)}.chs.srt`;
        const secondarySrt = `${removeExtension(filename)}.eng.srt`;
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
                console.log('正在提取字幕文件...', str);
                startTs = Date.now();
            })
            .on('progress', function (progress) {
                const fraction = Math.max(0, Math.min(1, timemarkToSeconds(progress.timemark) / duration));
                const progressPercent = Math.round((fraction) * 100);
                const elapsedSec = startTs ? (Date.now() - startTs) / 1000 : 0;
                const remainingSec = fraction > 0 ? elapsedSec * (1 - fraction) / fraction : 0;
                readline.cursorTo(process.stdout, 0);
                process.stdout.write(`字幕提取中，进度：${(progressPercent || 0)}% | 预计剩余：${formatSeconds(remainingSec)}`);
            })
            .on('end', function (str) {
                console.log('\n字幕提取完成。');
                resolve([mainSrt, secondarySrt]);
            })
            .on('error', function (err) {
                console.log('字幕提取出错：', err);
                reject(err);
            });
    });
};
