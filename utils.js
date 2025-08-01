import fs from 'fs';
import {config} from "./config.js";

export const removeExtension = (filename) => {
    const lastDotIndex = filename.lastIndexOf('.');
    return lastDotIndex === -1 ? filename : filename.slice(0, lastDotIndex);
}

export const deleteFile = (filename) => {
    fs.unlinkSync(config.workdir + filename);
}
