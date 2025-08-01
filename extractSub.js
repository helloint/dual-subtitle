import { spawn } from 'child_process';
import {config} from "./config.js";
import {removeExtension} from "./utils.js";

const cmd = 'ffmpeg';

const getArgs = (file, subIdx, main, secondary) => (['-y', '-i', file, '-map', `0:${subIdx[0]}`, '-c', 'copy', main, '-map', `0:${subIdx[1]}`, '-c', 'copy', secondary]);

export const extractSub = (filename, subIdx) => {
    return new Promise((resolve, reject) => {
        const mainSrt = `${removeExtension(filename)}.chs.srt`;
        const secondarySrt = `${removeExtension(filename)}.eng.srt`;
        const proc = spawn(cmd, getArgs(config.workdir + filename, subIdx, config.workdir + mainSrt, config.workdir + secondarySrt));

        let stdoutData = '';
        let stderrData = '';

        proc.stdout.on('data', function(data) {
            stdoutData += data.toString();
        });

        proc.stderr.setEncoding("utf8");
        proc.stderr.on('data', function(data) {
            stderrData += data;
        });

        proc.on('close', function(code) {
            // console.error('stderr:', stderrData);
            if (code === 0) {
                resolve([mainSrt, secondarySrt]);
            } else {
                reject(new Error(`Process exited with code ${code}: ${stderrData}`));
            }
        });

        proc.on('error', function(err) {
            reject(err);
        });
    });
};
