export default {
  noVideoFiles: 'No .mp4 or .mkv files found in the current directory.',
  processingFile: ({ file }) => `Processing: ${file}`,
  usingLocalFfprobe: 'Using local ffprobe',
  usingLocalFfmpeg: 'Using local ffmpeg',
  gettingSubtitleInfo: 'Getting subtitle info...',
  // Use %d placeholder so console.log can highlight numeric args
  foundSubtitleCount: 'Found %d subtitle track(s).',

  // findSub
  autoCountdownPrefix: 'Auto-detect Simplified Chinese (chi) + English (eng) and merge. Press any key to interrupt for manual selection.',
  interruptedManual: 'Auto flow interrupted. Please manually select 2 subtitle tracks to merge.',
  autoFindingChiEng: 'Auto-detecting Simplified Chinese (chi) and English (eng)...',
  foundLangSub: ({ label }) => `Found ${label} subtitle. Index: %d`,
  notFoundLangSub: ({ label }) => `No ${label} subtitle found`,
  availableSubtitleList: 'Available subtitle tracks:',
  subtitleListItem: 'index=%d, code=%s, name="%s", duration=%d, frames=%d',
  finalSelectedLang: ({ label }) => `Selected ${label}: index=%d, frames=%s`,
  duration: 'Duration: %d',

  manualAllAvailable: 'All available subtitle tracks:',
  manualSelectedFirst: 'Selected #1: index=%d, code=%s, name="%s"',
  manualSelectedSecond: 'Selected #2: index=%d, code=%s, name="%s"',

  promptIndex: ({ label, excludeIndex }) => {
    const excludeHint = excludeIndex !== null && excludeIndex !== undefined ? ` (cannot select index ${excludeIndex})` : '';
    return `Enter ${label} subtitle index${excludeHint} (press Enter to exit): `;
  },
  exited: 'Exited.',
  invalidInteger: 'Please enter a valid integer index.',
  indexNotFound: 'No subtitle found for that index. Please try again.',
  sameAsFirst: 'Cannot select the same index as the first subtitle. Please try again.',

  // extractSub
  extractingStart: 'Extracting subtitle files...',
  extractingProgress: ({ progressPercent, remaining }) => `Extracting... ${progressPercent || 0}% | ETA: ${remaining}`,
  extractingDone: 'Subtitle extraction completed.',
  extractingError: ({ err }) => `Subtitle extraction error: ${err}`,
};
