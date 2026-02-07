# dual-subtitle

一键批量提取视频内嵌字幕中的两条轨道，并合并为双语字幕文件。

[![NPM](https://nodei.co/npm/dual-subtitle.png?downloads=true)](https://www.npmjs.com/package/dual-subtitle)

## 依赖

- 需要本地安装 **Node.js**（含 npm）：[Node.js 官网](https://nodejs.org/zh-cn/)
- 本工具会优先使用系统自带的 `ffmpeg` / `ffprobe`；若未安装，会通过依赖包自动使用内置版本。

## 使用

```bash
# 在当前目录下处理所有 .mp4 / .mkv
npx dual-subtitle

# 指定目录（末尾可带或不带 /）
npx dual-subtitle /path/to/videos
```

> 若无 `npx`（如部分群晖环境），可用：`node /path/to/dual-subtitle/index.js [目录]`

### 输出文件

- 合并后的字幕文件名为：`<原文件名>.<语言1>-<语言2>.srt`
- 例如自动匹配到简体中文 + 英语时，生成：`movie.chi-eng.srt`

## 运行流程

1. **每个视频文件**会先扫描内嵌字幕轨道。
2. **启动前有 3 秒倒计时**：  
   - 不按键：自动按「简体中文(chi) + 英语(eng)」查找并合成；若缺某一条，会列出字幕并提示输入要合并的两条**索引**。  
   - **按任意键**：跳过自动查找，直接列出所有字幕，由你依次输入两条要合并的字幕索引。
3. **批量处理**：若在**第一个**（或任意一个）文件中进行了「手动选择索引」，则**本轮后续所有文件**都会直接进入手动选择流程，不再倒计时、也不再自动匹配 chi/eng。

## 界面语言

- **默认**：根据系统语言自动选择中文或英文（会读取环境变量 `LANG` / `LC_ALL` 等；在 macOS 上还会读取系统首选语言）。
- **强制指定**：  
  `DUAL_SUBTITLE_LANG=zh` 或 `DUAL_SUBTITLE_LANG=en` 可覆盖自动检测。

## 简介

主要用于在 Infuse 等播放器上观看流媒体时，将两条内嵌字幕（如中英）合并成一条双语字幕轨道，以解决播放器无法同时显示两条字幕的问题。

更多说明见知乎文章：<https://zhuanlan.zhihu.com/p/1915534266130997832>
