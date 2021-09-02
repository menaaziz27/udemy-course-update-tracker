const CronJob = require('cron').CronJob;
const puppeteer = require('puppeteer');
const nodemailer = require('nodemailer');

let URL = 'https://www.udemy.com/course/nodejs-the-complete-guide/';
const TOTAL_NUM_OF_LECTURES = 36;

const configBrowser = async () => {
	const browser = await puppeteer.launch({ headless: false });
	const page = await browser.newPage();
	await page.goto(URL);
	return page;
};

const checkUpdate = async page => {
	await page.goto(URL, {
            timeout: 20000,
            waitUntil: ['load', 'domcontentloaded', 'networkidle0', 'networkidle2']
        });
	const spanText = await page.evaluate(
		() => document.querySelector('.curriculum--content-length--1XzLS').textContent
	);
	const lecturesNumber = Number(spanText.split(' ')[0]);
	if (lecturesNumber !== TOTAL_NUM_OF_LECTURES) {
		sendNotification(lecturesNumber);
	}
};

const sendNotification = async lectures => {
	let transporter = nodemailer.createTransport({
		service: 'outlook',
		secure: false,
		auth: {
			user: process.env.MY_EMAIL,
			pass: process.env.MY_PASSWORD,
		},
	});
    let lecturesAdded = lectures - TOTAL_NUM_OF_LECTURES;
	let textToSend = `Course updated to ${lectures} lectures. (${lecturesAdded} added!)`;
	let htmlText = `<a href=\"${URL}\">Link</a><br>`;

	let info = await transporter.sendMail({
		from: `Course Update Tracker ${process.env.MY_EMAIL}`,
		to: process.env.RECIEVER,
		subject: textToSend,
		text: textToSend,
		html: htmlText,
	});

	console.log(`Message sent: ${info.messageId}`);
};

const startTracking = async () => {
	
	const page = await configBrowser();
	
	// At 01:00 am everyday
	const job = new CronJob(
		'0 1 * * *', 
		() => {
			checkUpdate(page);
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
