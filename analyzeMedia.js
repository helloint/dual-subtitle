import ffprobe from "ffprobe";
import ffprobeStatic from "ffprobe-static";
import {config} from "./config.js";

export const analyzeMedia = (file) => {
    return new Promise((resolve, reject) => {
        ffprobe(config.workdir + file, { path: ffprobeStatic.path })
            .then(function (info) {
                // console.log(info);
                resolve(info);
            })
            .catch(function (err) {
                // console.error(err);
                reject(err);
            });
    });
};
