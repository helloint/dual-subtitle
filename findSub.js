import readline from 'readline';

// 默认要查找并合成的字幕：简体中文 + 英语。可扩展为更多 code。
const DEFAULT_TARGETS = [
    { code: 'chi', label: '简体中文', finder: findChiSub },
    { code: 'eng', label: '英语', finder: findEngSub },
];

export const findSub = async (subTitles) => {
    const prefix = '将自动查找简体中文和英语字幕并合成，按任意键可中断并手动选择。';
    const interrupted = await waitForInterruptWithCountdown(3000, prefix);

    if (interrupted) {
        console.log('\n已中断自动流程，请手动选择要合并的 2 个字幕。');
        return await manualSelectSubs(subTitles);
    }

    console.log('\n自动查找简体中文和英语字幕...');
    const [target1, target2] = DEFAULT_TARGETS;
    let sub1 = target1.finder(subTitles);
    let sub2 = target2.finder(subTitles);

    if (sub1) {
        console.log(`找到${target1.label}字幕，索引为：${sub1.index}`);
    } else {
        console.log(`没有找到${target1.label}字幕`);
    }
    if (sub2) {
        console.log(`找到${target2.label}字幕，索引为：${sub2.index}`);
    } else {
        console.log(`没有找到${target2.label}字幕`);
    }

    if (!sub1 || !sub2) {
        console.log('可用字幕列表：');
        subTitles.forEach((s) => {
            console.log(`索引=${s.index}, code=${s.code}, name="${s.name}", duration=${s.duration}, frames=${s.frames}`);
        });
        if (!sub1) sub1 = await promptForSubIndex(subTitles, target1.label);
        if (!sub2) sub2 = await promptForSubIndex(subTitles, target2.label, sub1.index);
    }

    console.log(`最终选择的${target1.label}字幕索引：${sub1.index}，帧：${sub1.frames ?? '-'}`);
    console.log(`最终选择的${target2.label}字幕索引：${sub2.index}，帧：${sub2.frames ?? '-'}`);
    console.log('时长：', sub1.duration);
    return [sub1, sub2];
};

/**
 * 等待指定毫秒，期间显示倒计时（数字每秒更新），任意键中断。
 * @param {number} ms 总等待时间（毫秒）
 * @param {string} prefix 倒计时前的提示文案（同一行）
 * @returns {Promise<boolean>} 是否被按键中断
 */
const waitForInterruptWithCountdown = (ms, prefix) => {
    return new Promise((resolve) => {
        if (!process.stdin.isTTY) {
            setTimeout(() => resolve(false), ms);
            return;
        }
        const stdin = process.stdin;
        const wasRaw = stdin.isRaw || false;
        if (!wasRaw) stdin.setRawMode(true);
        stdin.resume();
        stdin.setEncoding('utf8');

        const totalSec = Math.ceil(ms / 1000);
        let leftSec = totalSec;

        const formatCountdown = (sec) => {
            // 使用高亮颜色和箭头让数字更醒目
            const YELLOW = '\x1b[33m';
            const BOLD = '\x1b[1m';
            const RESET = '\x1b[0m';
            return `${prefix}  ${YELLOW}${BOLD}>>> ${sec} <<<${RESET}`;
        };

        const writeLine = () => {
            readline.cursorTo(process.stdout, 0);
            readline.clearLine(process.stdout, 1);
            process.stdout.write(formatCountdown(leftSec));
        };

        writeLine();

        let tickId;
        tickId = setInterval(() => {
            leftSec -= 1;
            if (leftSec <= 0) {
                clearInterval(tickId);
                cleanup();
                readline.cursorTo(process.stdout, 0);
                readline.clearLine(process.stdout, 1);
                process.stdout.write('\n');
                resolve(false);
                return;
            }
            writeLine();
        }, 1000);

        const cleanup = () => {
            if (tickId) clearInterval(tickId);
            stdin.removeListener('data', onKeyPress);
            if (!wasRaw) stdin.setRawMode(false);
            stdin.pause();
        };

        const onKeyPress = (key) => {
            if (key === '\u0003') {
                cleanup();
                process.exit(0);
            }
            cleanup();
            resolve(true);
        };
        stdin.on('data', onKeyPress);
    });
};

const manualSelectSubs = async (subTitles) => {
    console.log('\n所有可用字幕信息如下：');
    subTitles.forEach((s, idx) => {
        console.log(`[${idx}] 索引=${s.index}, code=${s.code}, name="${s.name}", duration=${s.duration}, frames=${s.frames}`);
    });
    const sub1 = await promptForSubIndex(subTitles, '第一个');
    const sub2 = await promptForSubIndex(subTitles, '第二个', sub1.index);
    console.log(`最终选择的第一个字幕：索引=${sub1.index}, code=${sub1.code}, name="${sub1.name}"`);
    console.log(`最终选择的第二个字幕：索引=${sub2.index}, code=${sub2.code}, name="${sub2.name}"`);
    console.log('时长：', sub1.duration);
    return [sub1, sub2];
};

const promptForSubIndex = (subTitles, label, excludeIndex = null) => {
    return new Promise((resolve) => {
        const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
        const excludeHint = excludeIndex !== null ? `（不能选择索引 ${excludeIndex}）` : '';
        const ask = () => {
            rl.question(`请输入${label}字幕的索引${excludeHint}（按回车退出）: `, (answer) => {
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
                if (excludeIndex !== null && target.index === excludeIndex) {
                    console.log('不能选择与第一个字幕相同的索引，请重新输入。');
                    ask();
                    return;
                }
                rl.close();
                resolve({
                    index: target.index,
                    duration: target.duration,
                    frames: target.frames,
                    code: target.code,
                    name: target.name,
                });
            });
        };
        ask();
    });
};

// ---------- 按 language code 的查找策略（可扩展） ----------

/**
 * 简体中文字幕：code=chi，多条时优先 name 含「简体」或 "simplified"
 */
function findChiSub(subTitles) {
    const list = subTitles.filter((s) => s.code === 'chi');
    if (list.length === 0) return null;
    if (list.length === 1) return toSub(list[0]);
    const preferred = list.find((s) => s.name.includes('简体') || s.name.includes('simplified'));
    return preferred ? toSub(preferred) : null;
}

/**
 * 英语字幕：code=eng，过滤空字幕（帧数过少），多条时优先非 SDH
 */
function findEngSub(subTitles) {
    const list = subTitles.filter((s) => s.code === 'eng');
    if (list.length === 0) return null;
    const nonEmpty = list.filter((s) => {
        const frames = Number(s.frames);
        if (!frames) return true;
        return frames >= 100;
    });
    const pool = nonEmpty.length > 0 ? nonEmpty : list;
    const nonSDH = pool.filter((s) => !s.name.includes('sdh'));
    const final = nonSDH.length > 0 ? nonSDH : pool;
    return final[0] ? toSub(final[0]) : null;
}

function toSub(s) {
    return {
        index: s.index,
        duration: s.duration,
        frames: s.frames,
        code: s.code,
        name: s.name,
    };
}