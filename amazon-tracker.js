const cheerio = require('cheerio');
const cron = require('cron');
const puppeteer = require('puppeteer');
const nodemailer = require('nodemailer');

let url = 'https://www.amazon.com/Samsung-970-EVO-500GB-MZ-V7E500BW/dp/B07C8Y31G1/';

const configBrowser = async () => {
	const browser = await puppeteer.launch({ headless: false });
	const page = await browser.newPage();
	await page.goto(url);
	return page;
};

const checkPrice = async page => {
	// await page.reload();
	const price = await page.evaluate(
		() => document.querySelector('#priceblock_ourprice').textContent
	);
	console.log(price);
	// const $ = cheerio.load(html);
	// $('#priceblock_ourprice', html).each(node => {
	// 	let price = $(this);
	// 	console.log(node);
	// });
};

const monitor = async () => {
	const page = await configBrowser();
	await checkPrice(page);
};

monitor();
