# 一键批量提取流媒体视频的中英字幕，并自动合并为双语字幕。

## 依赖
需要本地先安装好`FFmpeg`(包含`ffmpeg`, `ffprobe`这两个命令)，以及有`Node.js`环境(包括`npm`)

* 安装【[Node.js/npm环境](https://nodejs.org/zh-cn/)】
* 安装【[FFmpeg](http://ffmpeg.org/download.html)】

计划在下个版本里去掉FFmpeg，改为依赖npm的ffmpeg，简化使用。

## 使用

1. 进入视频所在目录
2. 命令行执行：`npx dual-subtitle`

字幕文件会以`.chs-eng.srt`结尾

## 介绍
此工具主要是为了满足在Infuse上看流媒体视频时，能够显示双语字幕的需求。Infuse本身并不支持同时显示2条不同语言的字幕。

更多介绍，可以访问知乎文章：https://zhuanlan.zhihu.com/p/1915534266130997832
