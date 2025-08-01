const config = {
    workdir: './',
    exts: ['.mp4', '.mkv'],
    srtTag: 'chs-eng',
};

if (process.argv.length > 2) {
    config.workdir = process.argv[2];
}

export { config };
