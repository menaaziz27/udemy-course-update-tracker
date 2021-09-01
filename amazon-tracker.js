const cheerio = require('cheerio');
const CronJob = require('cron').CronJob;
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
	const currentPrice = Number(price.replace(/[^0-9.-]+/g, ''));
	console.log(currentPrice);

	if (currentPrice < 400) {
		console.log('send not');
		sendNotification(price);
		console.log('send not');
	}
};

const sendNotification = async price => {
	let transporter = nodemailer.createTransport({
		service: 'outlook',
		secure: false,
		auth: {
			user: 'mayna.eaziz658@fci.s-mu.edu.eg',
			pass: 'Iloveme22@@',
		},
	});

	let textToSend = 'Price dropped to ' + price;
	let htmlText = `<a href=\"${url}\">Link</a>`;

	let info = await transporter.sendMail({
		from: `"Price Tracker" <mayna.eaziz658@fci.s-mu.edu.eg>`,
		to: 'menaaziz27@gmail.com',
		subject: 'Price dropped to ' + price,
		text: textToSend,
		html: htmlText,
	});

	console.log('Message sent: %s', info.messageId);
};

const startTracking = async () => {
	const page = await configBrowser();

	const job = new CronJob(
		'*/30 * * * * *',
		() => {
			checkPrice(page);
		},
		null,
		true,
		null,
		null,
		true
	);
	job.start();
};

startTracking();
