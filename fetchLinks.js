const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

async function fetchArticleLinks(url) {
    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'networkidle2' });

        // 自动滑动到页面底部
        await autoScroll(page);

        // 获取当前页面的 HTML 源码
        const html = await page.content();

        // 处理 HTML 源码，提取文章链接和创建时间
        const uniqueLinks = await extractLinks(html);

        // 读取现有链接
        const existingLinks = readExistingLinks();

        // 过滤出不在现有链接中的新链接
        const newLinks = uniqueLinks.filter(link => !existingLinks.includes(link));

        // 将新链接写入文件
        if (newLinks.length > 0) {
            writeLinksToFile(newLinks);
            console.log('新链接已写入文件:', newLinks);
        } else {
            console.log('没有新链接需要写入。');
        }

        await browser.close();
    } catch (error) {
        console.error('获取文章链接失败:', error);
    }
}

// 自动滑动到页面底部
async function autoScroll(page) {
    const flag = isAll;
    await page.evaluate(async (flag) => {
        const distance = 100; // 每次滑动的距离
        const delay = 100; // 每次滑动的间隔
        const maxScrolls = 20; // 最大滑动次数，防止无限循环
        let scrollCount = 0;

        while (scrollCount < maxScrolls) {
            // 如果flag为false, 滑动3次左右差不多了，不行再去掉
            if (!flag && scrollCount > 3) {
                break;
            }

            const scrollHeight = document.body.scrollHeight;
            window.scrollBy(0, distance);
            scrollCount++;

            // 等待新的内容加载
            await new Promise(resolve => setTimeout(resolve, delay));

            // 如果已经滑到底部，退出循环
            if (window.innerHeight + window.scrollY >= scrollHeight) {
                break;
            }
        }
    }, flag);
}

// 提取文章链接和创建时间
async function extractLinks(html) {
    const $ = cheerio.load(html);
    const links = [];
    let stopProcessing = false; // 标志变量

    $('li').each((index, element) => {
        if (stopProcessing) {
            return;
        }

        const href = $(element).attr('data-link');
        const createTime = $(element).find("span.js_article_create_time").text().trim();

        // 如果isAll为false，且文章创建时间已超过一周，结束抓取
        if (!isAll && createTime === "1周前") {
            console.log("文章创建时间已超过一周，结束抓取。");
            stopProcessing = true;
            return;
        }

        if (href && href.includes('mp.weixin.qq.com')) {
            links.push(href);
            console.log(`文章链接: ${href}, 创建时间: ${createTime}`);
        }
    });

    // 去重
    return [...new Set(links)].reverse();
}

// 判断字符串中是否有中文
function containsChinese(str) {
    // return true;
    const regex = /[\u4e00-\u9fa5]/; // 匹配中文字符的正则表达式
    return regex.test(str);
}

// 读取现有链接
function readExistingLinks() {
    const outputPath = path.join(__dirname, 'article_links.txt');
    if (fs.existsSync(outputPath)) {
        const data = fs.readFileSync(outputPath, 'utf-8');
        return data.split('\n').filter(link => link.trim() !== ''); // 返回非空链接
    }
    return [];
}

// 将新链接写入文件
function writeLinksToFile(links) {
    const outputPath = path.join(__dirname, 'article_links.txt');
    fs.appendFileSync(outputPath, `==========${formatDate()}==========\n` + links.join('\n') + '\n', 'utf-8'); // 追加写入
}

function formatDate() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

const homepageUrl = process.argv[2];
const isAll = process.argv[3] !== undefined && process.argv[3] !== '';

if (!homepageUrl) {
    console.log('请输入公众号主页链接');
    process.exit(1);
}

fetchArticleLinks(homepageUrl);
