export const findSub = (subTitles) => {
    console.log('查找简体和英语字幕...');
    const chsSub = findChiSub(subTitles);
    const engSub = findEngSub(subTitles);

    if (chsSub === null || engSub === null) {
        if (chsSub === null) {
            console.log('没有找到简体中文字幕');
        }

        if (engSub === null) {
            console.log('没有找到英语字幕');
        }

        throw new Error('字幕查找失败，中断执行');
    }

    console.log('找到简体中文字幕，索引为：', chsSub.index);
    console.log('找到英语字幕，索引为：', engSub.index);
    console.log('时长：', chsSub.duration);

    return [chsSub, engSub];
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
        return null;
    }

    if (chineseSubtitles.length === 1) {
        return {
            index: chineseSubtitles[0].index,
            duration: chineseSubtitles[0].duration
        };
    }

    // If multiple Chinese subtitles, look for Simplified Chinese
    const targetSub = chineseSubtitles.find(subTitle =>
        subTitle.name.includes('简体') ||
        subTitle.name.includes('simplified')
    );

    return targetSub ? {
        index: targetSub.index,
        duration: targetSub.duration
    } : null;
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

    if (englishSubs.length === 0) return null;
    if (englishSubs.length === 1) return {
        index: englishSubs[0].index,
        duration: englishSubs[0].duration,
    };

    // Filter out SDH subtitles if there are multiple English options
    const nonSDHSubs = englishSubs.filter(sub =>
        !sub.name.includes('sdh')
    );

    // Return first non-SDH sub if available, otherwise first English sub
    const targetSub = nonSDHSubs[0] || englishSubs[0];
    return targetSub ? {
        index: targetSub.index,
        duration: targetSub.duration
    } : null;
};
