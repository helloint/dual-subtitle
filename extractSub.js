import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import ffmpeg from 'fluent-ffmpeg';
import {config} from "./config.js";
import {removeExtension} from "./utils.js";

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

export const extractSub = (filename, subIdx) => {
    return new Promise((resolve, reject) => {
        const mainSrt = `${removeExtension(filename)}.chs.srt`;
        const secondarySrt = `${removeExtension(filename)}.eng.srt`;

        ffmpeg(config.workdir + filename)
            .output(config.workdir + mainSrt)
            .outputOptions(['-map', `0:${subIdx[0]}`, '-c', 'copy'])
            .output(config.workdir + secondarySrt)
            .outputOptions(['-map', `0:${subIdx[1]}`, '-c', 'copy'])
            .run()
            .on('start', function (str) {
                console.log('转换任务开始～', str);
            })
            .on('progress', function (progress) {
                console.log(`进行中，完成${(progress.percent || 0)}%`);
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
