import readline from 'readline';
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

        ffmpeg.setFfmpegPath(getFFmpegPath());
        ffmpeg(config.workdir + filename)
            .output(config.workdir + mainSrt)
            .outputOptions(['-map', `0:${targetSubs[0].index}`, '-c', 'copy'])
            .output(config.workdir + secondarySrt)
            .outputOptions(['-map', `0:${targetSubs[1].index}`, '-c', 'copy'])
            .run()
            .on('start', function (str) {
                console.log('转换任务开始～', str);
            })
            .on('progress', function (progress) {
                const progressPercent = Math.round((timemarkToSeconds(progress.timemark) / duration) * 100);
                readline.cursorTo(process.stdout, 0);
                process.stdout.write(`进行中，完成${(progressPercent || 0)}%`);
            })
            .on('end', function (str) {
                console.log('转换任务完成！');
                resolve([mainSrt, secondarySrt]);
            })
            .on('error', function (err) {
                console.log('转换任务出错：', err);
                reject(err);
            });
    });
};
