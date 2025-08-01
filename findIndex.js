export const findIndex = (info) => {
    const subTitles = info.streams.filter((stream) => stream.codec_type === 'subtitle').map(stream => ({
        index: stream.index,
        code: stream.tags.language.toLowerCase(),
        name: stream.tags.title ? stream.tags.title.toLowerCase() : ''
    }));

    const chsIdx = findChiSub(subTitles);
    const engIdx = findEngSub(subTitles);

    if (chsIdx === undefined) {
        console.log('没有找到简体中文字幕');
    } else {
        console.log('找到简体中文字幕，索引为：', chsIdx);
    }

    if (engIdx === undefined) {
        console.log('没有找到英语中文字幕');
    } else {
        console.log('找到英语字幕，索引为：', engIdx);
    }

    if (chsIdx === undefined || engIdx === undefined) {
        throw new Error('字幕查找失败，中断执行');
    }

    return [chsIdx, engIdx];
}

/**
 * 目前看到的数据可能有：
 * chi,简体
 * chi,Simplified Chinese
 * 查找策略是：先找 'chi', 如果数量大于1，则进一步找 "简体"
 */
const findChiSub = (subTitles) => {
    const chineseSubtitles = subTitles.filter(subTitle => subTitle.code === 'chi');

    if (chineseSubtitles.length === 0) {
        return undefined;
    }

    if (chineseSubtitles.length === 1) {
        return chineseSubtitles[0].index;
    }

    // If multiple Chinese subtitles, look for Simplified Chinese
    const simplifiedChinese = chineseSubtitles.find(subTitle =>
        subTitle.name.includes('简体') ||
        subTitle.name.includes('simplified')
    );

    return simplifiedChinese?.index;
}

/**
 * 目前看到的数据可能有：
 * 9,subrip,eng
 * 10,subrip,eng,SDH
 * 23,subrip,eng,English[CC]
 * 如果同时有SDH和非SDH版本，选非SDH版本。
 */
const findEngSub = (subTitles) => {
    const englishSubs = subTitles.filter(sub => sub.code === 'eng');

    if (englishSubs.length === 0) return undefined;
    if (englishSubs.length === 1) return englishSubs[0].index;

    // Filter out SDH subtitles if there are multiple English options
    const nonSDHSubs = englishSubs.filter(sub =>
        !sub.name.includes('sdh')
    );

    // Return first non-SDH sub if available, otherwise first English sub
    return (nonSDHSubs[0] || englishSubs[0])?.index;
};
