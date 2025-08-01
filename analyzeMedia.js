import { spawn } from 'child_process';
import {config} from "./config.js";

const cmd = 'ffprobe';

const getArgs = (file) => (['-i', file, '-hide_banner', '-select_streams', 's', '-show_entries', 'stream=index,codec_name:stream_tags=language,title', '-of', 'csv=p=0']);

export const analyzeMedia = (file) => {
    return new Promise((resolve, reject) => {
        const proc = spawn(cmd, getArgs(config.workdir + file));

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
                resolve(stdoutData);
            } else {
                reject(new Error(`Process exited with code ${code}: ${stderrData}`));
            }
        });

        proc.on('error', function(err) {
            reject(err);
        });
    });
};
