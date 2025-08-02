# 一键批量提取流媒体视频的中英字幕，并自动合并为双语字幕。
[![NPM](https://nodei.co/npm/dual-subtitle.png?downloads=true)](https://www.npmjs.com/package/dual-subtitle)

## 依赖
需要本地有`Node.js`环境(包括`npm`)

* 安装【[Node.js/npm环境](https://nodejs.org/zh-cn/)】

## 使用

1. 进入视频所在目录
2. 命令行执行：`npx dual-subtitle`

注：有些环境（比如群晖）如果没有npx，可以试试用`npm exec dual-subtitle`代替。

生成的字幕文件会以`.chs-eng.srt`结尾。

## 介绍
此工具主要是为了满足在Infuse上看流媒体视频时，能够显示双语字幕的需求。Infuse本身并不支持同时显示2条不同语言的字幕。

更多介绍，可以访问知乎文章：https://zhuanlan.zhihu.com/p/1915534266130997832
