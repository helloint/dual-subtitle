import readline from 'readline';

export const findSub = async (subTitles) => {
    console.log('查找简体和英语字幕...');
    let chsSub = findChiSub(subTitles);
    let engSub = findEngSub(subTitles);

    if (chsSub) {
        console.log('找到简体中文字幕，索引为：', chsSub.index);
    } else {
        console.log('没有找到简体中文字幕');
    }

    if (engSub) {
        console.log('找到英语字幕，索引为：', engSub.index);
    } else {
        console.log('没有找到英语字幕');
    }

    if (!chsSub || !engSub) {
        console.log('所有可用字幕信息如下：');
        subTitles.forEach((s) => {
            console.log(`索引=${s.index}, code=${s.code}, name="${s.name}", duration=${s.duration}, frames=${s.frames}`);
        });

        if (!chsSub) {
            chsSub = await promptForSubIndex(subTitles, '中文');
        }

        if (!engSub) {
            engSub = await promptForSubIndex(subTitles, '英文');
        }
    }

    console.log('最终选择的简体中文字幕索引为：', chsSub.index);
    console.log('最终选择的英语字幕索引为：', engSub.index);
    console.log('时长：', chsSub.duration);

    return [chsSub, engSub];
};

const promptForSubIndex = (subTitles, label) => {
    return new Promise((resolve) => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        const ask = () => {
            rl.question(`请输入${label}字幕的索引（按回车退出）: `, (answer) => {
                const trimmed = answer.trim();
                if (trimmed === '') {
                    console.log('已退出。');
                    rl.close();
                    process.exit(0);
                }
                const value = Number(trimmed);
                if (!Number.isInteger(value)) {
                    console.log('请输入有效的整数索引。');
                    ask();
                    return;
                }
                const target = subTitles.find((s) => s.index === value);
                if (!target) {
                    console.log('未找到该索引对应的字幕，请重新输入。');
                    ask();
                    return;
                }
                rl.close();
                resolve({
                    index: target.index,
                    duration: target.duration
                });
            });
        };

        ask();
    });
};

/**
 * 目前看到的数据可能有：
 * chi,简体
 * chi,Simplified Chinese
 * 查找策略是：先找 'chi', 如果数量大于1，则进一步找 "简体"
 */
const findChiSub = (subTitles) => {
    // TBD: Consider to include 'chs' later
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
 * 选择策略：
 * 1. 过滤掉空字幕（只有当 NUMBER_OF_FRAMES 存在且 < 10 时才过滤）
 * 2. 如果同时有SDH和非SDH版本，选非SDH版本
 * 3. 按原始顺序选择第一个可用的字幕
 */
const findEngSub = (subTitles) => {
    const englishSubs = subTitles.filter(sub => sub.code === 'eng');

    if (englishSubs.length === 0) return null;

    // 过滤掉空字幕
    const nonEmpty = englishSubs.filter(sub => {
        const frames = Number(sub.frames);
        if (!frames) return true;
        return frames >= 10;
    });

    const candidatePool = nonEmpty.length > 0 ? nonEmpty : englishSubs;

    if (candidatePool.length === 0) return null;

    // 多个英文字幕时，优先去除 SDH
    const nonSDHSubs = candidatePool.filter(sub => !sub.name.includes('sdh'));
    const finalPool = nonSDHSubs.length > 0 ? nonSDHSubs : candidatePool;

    // 按原始顺序选择第一个可用的字幕
    const targetSub = finalPool[0];

    return targetSub ? {
        index: targetSub.index,
        duration: targetSub.duration
    } : null;
};
