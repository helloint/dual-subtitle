export default {
  noVideoFiles: '当前目录下未找到 .mp4 或 .mkv 视频文件。',
  processingFile: ({ file }) => `正在处理：${file}`,
  usingLocalFfprobe: '使用本地ffprobe',
  usingLocalFfmpeg: '使用本地ffmpeg',
  gettingSubtitleInfo: '获取字幕信息...',
  // 使用 %d 占位符，搭配 console.log 的多参数高亮数字
  foundSubtitleCount: '找到 %d 条字幕。',

  // findSub
  autoCountdownPrefix: '将自动查找简体中文(chi)和英语(eng)字幕并合成，按任意键可中断并手动选择。',
  interruptedManual: '\n已中断自动流程，请手动选择要合并的 2 个字幕。',
  autoFindingChiEng: '\n自动查找简体中文和英语字幕...',
  foundLangSub: ({ label }) => `找到${label}字幕，索引为：%d`,
  notFoundLangSub: ({ label }) => `没有找到${label}字幕`,
  availableSubtitleList: '可用字幕列表：',
  subtitleListItem: '索引=%d, code=%s, name="%s", duration=%d, frames=%d',
  finalSelectedLang: ({ label }) => `最终选择的${label}字幕索引：%d，帧：%s`,
  duration: '时长：%d',

  manualAllAvailable: '\n所有可用字幕信息如下：',
  manualSelectedFirst: '最终选择的第一个字幕：索引=%d, code=%s, name="%s"',
  manualSelectedSecond: '最终选择的第二个字幕：索引=%d, code=%s, name="%s"',

  promptIndex: ({ label, excludeIndex }) => {
    const excludeHint = excludeIndex !== null && excludeIndex !== undefined ? `（不能选择索引 ${excludeIndex}）` : '';
    return `请输入${label}字幕的索引${excludeHint}（按回车退出）: `;
  },
  exited: '已退出。',
  invalidInteger: '请输入有效的整数索引。',
  indexNotFound: '未找到该索引对应的字幕，请重新输入。',
  sameAsFirst: '不能选择与第一个字幕相同的索引，请重新输入。',

  // extractSub
  extractingStart: '正在提取字幕文件...',
  extractingProgress: ({ progressPercent, remaining }) =>
    `字幕提取中，进度：${progressPercent || 0}% | 预计剩余：${remaining}`,
  extractingDone: '\n字幕提取完成。',
  extractingError: ({ err }) => `字幕提取出错：${err}`,
};

