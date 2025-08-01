export const findIndex = (text) => {
    const lines = text.split('\n');
    const result = [];

    for (const line of lines) {
        const parts = line.split(',');
        if (parts.length >= 3) { // 至少要有3部分：id,格式,语言代码
            const id = parts[0];
            const langCode = parts[2].toLowerCase();
            const langName = parts[3] ? parts[3].toLowerCase() : '';

            // 检查简体中文：代码为chi且名称包含"简体"或"simplified"
            const isSimplifiedChinese = langCode === 'chi' && (
                langName.includes('简体') ||
                langName.includes('simplified') ||
                langName === '简体' // 只有"简体"的情况
            );

            // 检查英语：代码为eng或名称包含"english"
            const isEnglish = langCode === 'eng' ||
                langName.includes('english') ||
                langName === 'sdh' || // eng,SDH
                langName === '';     // 只有eng代码的情况

            if (isSimplifiedChinese || isEnglish) {
                result.push(parseInt(id));
            }
        }
    }

    // 按中文在前，英文在后排序
    return result.sort((a, b) => {
        const lineA = lines.find(l => l.startsWith(a + ','));
        const lineB = lines.find(l => l.startsWith(b + ','));
        const isChineseA = lineA.includes('chi');
        const isChineseB = lineB.includes('chi');

        if (isChineseA && !isChineseB) return -1;
        if (!isChineseA && isChineseB) return 1;
        return a - b;
    });
}
