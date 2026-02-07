# dual-subtitle

Extract two embedded subtitle tracks from video files and merge them into a single dual-language subtitle file. Supports batch processing for `.mp4` and `.mkv`.

**[简体中文](README.zh-CN.md)**

[![NPM](https://nodei.co/npm/dual-subtitle.png?downloads=true)](https://www.npmjs.com/package/dual-subtitle)

## Requirements

- **Node.js** (with npm): [nodejs.org](https://nodejs.org/)
- The CLI prefers your system **ffmpeg** and **ffprobe**; if missing, it falls back to bundled installers.

## Usage

```bash
# Process all .mp4 and .mkv in the current directory
npx dual-subtitle

# Or specify a directory (with or without trailing /)
npx dual-subtitle /path/to/videos
```

> Without `npx` (e.g. some Synology setups):  
> `node /path/to/dual-subtitle/index.js [directory]`

### Output

- Merged subtitle file: `<basename>.<lang1>-<lang2>.srt`  
  Example: `movie.chi-eng.srt` when auto-detecting Simplified Chinese + English.

## Flow

1. For **each video**, the tool scans embedded subtitle streams.
2. **Before running**, there is a **3-second countdown**:
   - **Do nothing**: It auto-selects **Simplified Chinese (chi)** and **English (eng)** and merges them. If either is missing, it lists tracks and asks you to enter the two **stream indices** to merge.
   - **Press any key**: Skip auto-detect; it lists all subtitle tracks and asks you to enter the two indices to merge.
3. **Batch**: If you **manually choose indices** for any file in the run, **all following files** in that run also use manual selection (no countdown, no chi/eng auto-detect).

## UI language

- **Default**: English. If the system or environment suggests Chinese (e.g. `LANG`, `LC_ALL`, or on macOS the primary system language), the UI switches to Chinese.
- **Override**: Set `DUAL_SUBTITLE_LANG=zh` or `DUAL_SUBTITLE_LANG=en` to force the language.

## About

Useful for players like Infuse that don’t support showing two subtitle tracks at once: merge two embedded tracks (e.g. Chinese + English) into one dual subtitle file.

More background (Chinese): [Zhihu](https://zhuanlan.zhihu.com/p/1915534266130997832)
