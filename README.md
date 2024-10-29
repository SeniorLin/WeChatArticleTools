# 微信公众号文章抓取工具

## 项目简介

该项目是一个用于抓取微信公众号文章链接及其内容的工具。它使用 Puppeteer 和 Axios 等库来实现网页抓取，并将抓取到的文章链接和内容保存到本地文件中。

## 功能

1. **抓取文章链接**：
   - 使用 Puppeteer 自动化浏览器操作，访问指定的公众号主页，获取文章链接。
   - 支持自动滚动页面以加载更多文章链接。
   - 过滤出新链接并将其保存到 `article_links.txt` 文件中。

2. **抓取文章内容**：
   - 从 `article_links.txt` 中读取文章链接，使用 Axios 获取文章内容。
   - 支持重试机制，最多重试 5 次以应对网络问题。
   - 抓取文章标题、内容和图片，并将其保存到本地文件中。

3. **标签抓取**：
   - 抓取文章的标签信息，并将其与文章链接一起保存。

## 依赖包

在使用本项目之前，请确保安装以下依赖包：

- `axios`: 用于发送 HTTP 请求。
- `cheerio`: 用于解析和操作 HTML 文档。
- `fs`: Node.js 的文件系统模块，用于文件读写。
- `path`: Node.js 的路径模块，用于处理文件路径。
- `puppeteer`: 用于控制无头浏览器进行网页抓取。

## 安装依赖

在项目根目录下运行以下命令以安装所需的依赖包：
```
npm install axios cheerio fs path puppeteer
```

## 使用方法

1. **抓取文章链接**：
   - 在命令行中运行以下命令，替换 `YOUR_COLLECTION_URL` 为公众号合集链接：
   ```bash
   node fetchLinks.js YOUR_COLLECTION_URL [isAll]
   ```
   - `isAll` 参数可选，填任意值，则抓取所有文章链接；不填，则只抓取一周内的文章链接。

2. **抓取文章内容**：
   - 在命令行中运行以下命令：
   ```bash
   node article.js
   ```
   - 该命令将读取 `article_links.txt` 中的链接并抓取对应的文章内容。

3. **使用 Puppeteer 抓取文章**：
   - 在命令行中运行以下命令：
   ```bash
   node articleLink.js
   ```
   - 该命令将使用 Puppeteer 抓取文章内容并保存。



## 作者：[LinSir](https://github.com/SeniorLin)

![](https://cdn.pqwcs.com/gh/ccmldl/Picture/202410201909112.png)

## 更新日志

- **功能更新**：
  - 新增标签抓取功能，抓取文章的标签信息并保存。
  - 优化了图片下载逻辑，确保图片能够正确保存。

- **已知问题**：
  - 在某些情况下，可能会因为网络问题导致抓取失败，建议检查网络连接。

## 贡献

欢迎任何形式的贡献！如果您发现了问题或有改进建议，请提交 issue 或 pull request。

## 版权

本项目遵循 MIT 许可证。详见 `LICENSE` 文件。
