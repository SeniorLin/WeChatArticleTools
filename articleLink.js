// article.js
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');


async function fetchArticle(url) {
    try {
        console.log(`==========${formatDate()}==========`);
        console.log(`开始抓取文章: ${url}`);

        let html = '';
        const maxRetries = 5; // 最大重试次数
        let attempts = 0;

        const browser = await puppeteer.launch();
        while (attempts < maxRetries) {
            const page = await browser.newPage();
            await page.goto(url, { waitUntil: 'networkidle2' });
            // 获取当前页面的 HTML 源码
            html = await page.content();
            if (!html.includes('环境异常')) {
                break; // 如果成功获取内容，退出循环
            }
            attempts++;
            console.log(`尝试抓取文章，第 ${attempts} 次...`);
            await new Promise(resolve => setTimeout(resolve, 1000)); // 等待1秒后重试
        }
        await browser.close();
        
        if (!html) {
            console.error('无法抓取此文章，已达到最大重试次数。');
            return; // 退出函数
        }

        html = html.replace(/<\/p>/g, '\n</p>').replace(/<\/span>/g, '\n</span>');
        const $ = cheerio.load(html);

        // 1. 抓取文章标题
        const title = $('h1').text().trim();
        console.log(`文章标题: ${title}`);
        let dirname = `article_${Date.now()}`;
        const imgDir = path.join(__dirname, 'backup', dirname);

        // 3. 抓取图片并保存
        const images = [];
        $('img').each((index, element) => {
            let imgUrl = $(element).attr('data-src');
            if (!imgUrl) {
                return;
            }

            // 检查文章目录是否存在，不存在则创建
            if (!fs.existsSync(imgDir)) {
                fs.mkdirSync(imgDir, { recursive: true });
            }

            if (!imgUrl.startsWith('http')) {
                imgUrl = new URL(imgUrl, url).href; // 转换为绝对路径
            }
            console.log(`正在下载第${index}张图片...`);
            const imgName = `${index}.jpg`; // 使用索引命名
            const imgPath = path.join(imgDir, imgName);
            images.push(imgPath);
            // 下载图片
            axios({
                method: 'get',
                url: imgUrl,
                responseType: 'stream'
            }).then(response => {
                response.data.pipe(fs.createWriteStream(imgPath));
            }).catch(err => {
                console.error(`下载图片失败: ${imgUrl}`, err);
            });
        });

        // 4. 抓取文章内容并处理成纯文本
        // console.log(`正在抓取文章内容...`);
        // const content = $('#js_content').text().trim();

        // 5.获取文章标签
        const tags = [];
        $('span.article-tag__item').each((index, element) => {
            const tag = $(element).text().trim();
            tags.push(tag);
        });
        console.log(`文章标签: ${tags}`);

        // 6. 保存链接和标签
        const contentPath = path.join(path.join(__dirname, 'articles', `${dirname}.txt`));
        fs.writeFileSync(contentPath, `${url} ${tags.join(' ')}`);
        console.log(`文章内容已保存到 ${contentPath}`);
    } catch (error) {
        console.error('抓取文章失败:', error);
    }
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

// const articleUrl = process.argv[2];

// if (!articleUrl) {
//     console.log('请输入文章链接');
//     process.exit(1);
// }

// 读取现有链接
function readExistingLinks() {
    const outputPath = path.join(__dirname, 'article_links.txt');
    if (fs.existsSync(outputPath)) {
        const data = fs.readFileSync(outputPath, 'utf-8');
        return data.split('\n').filter(link => link.trim() !== ''); // 返回非空链接
    }
    return [];
}

async function main() {
    const links = readExistingLinks();

    // 判断 links 中是否有以 === 开头的元素
    const link_indexs = links.map((link, index) => link.startsWith('===') ? index : -1).filter(index => index !== -1);
    const indexOfLastEquals = link_indexs[link_indexs.length - 1];
    let linksToFetch;
    if (indexOfLastEquals !== -1) {
        // 获取最后一个 === 开头后面的元素
        linksToFetch = links.slice(indexOfLastEquals + 1);
    } else {
        // 如果没有 === 开头的元素，获取全部链接
        linksToFetch = links;
    }

    // 循环调用 fetchArticle
    for (const articleUrl of linksToFetch) {
        await fetchArticle(articleUrl);
    }

    console.log('所有文章抓取完成，程序结束。');
}

main();
