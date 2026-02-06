const config = {
    workdir: './',
    exts: ['.mp4', '.mkv'],
};

if (process.argv.length > 2) {
    config.workdir = process.argv[2].endsWith('/') ? process.argv[2] : process.argv[2] + '/';
}

export { config };
