import { execSync } from 'child_process';
import ffprobe from "ffprobe";
import ffprobeInstaller from '@ffprobe-installer/ffprobe';
import {config} from "./config.js";

const getFFprobePath = () => {
    try {
        // 检查系统是否安装了 ffprobe
        execSync('ffprobe -version', { stdio: 'ignore' });
        // 如果能执行到这里，说明系统已安装
        console.log('使用本地ffprobe');
        return 'ffprobe'; // 返回系统命令
    } catch (e) {
        return ffprobeInstaller.path;
    }
}

export const analyzeMedia = (file) => {
    console.log(`获取字幕信息...`);
    const ffprobePath = getFFprobePath();

    /*
    TODO: 读取帧率输出
    ffprobe -v error -select_streams v -of default=noprint_wrappers=1:nokey=1 -show_entries stream=r_frame_rate input.mkv | awk -F/ '{ print ($1 / $2) }'
    输出：23.976
    */

    return new Promise((resolve, reject) => {
        ffprobe(config.workdir + file, { path: ffprobePath })
            .then(function (info) {
                const subTitles = info.streams.filter((stream) => stream.codec_type === 'subtitle').map(stream => ({
                    index: stream.index,
                    code: stream.tags.language.toLowerCase(),
                    name: stream.tags.title ? stream.tags.title.toLowerCase() : '',
                    duration: Math.round(stream.duration),
                    frames: Number(stream.tags.NUMBER_OF_FRAMES) || 0
                }));
                console.log('找到', subTitles.length, '条字幕。');
                resolve(subTitles);
            })
            .catch(function (err) {
                reject(err);
            });
    });
};
