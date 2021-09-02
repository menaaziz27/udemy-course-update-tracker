const CronJob = require('cron').CronJob;
const puppeteer = require('puppeteer');
const nodemailer = require('nodemailer');

const URL = 'https://www.udemy.com/course/nodejs-the-complete-guide/';
const COURSE_PERIOD = "40h 31m";

const configBrowser = async () => {
	const browser = await puppeteer.launch({ headless: false });
	const page = await browser.newPage();
	await page.goto(URL);
	return page;
};

const checkUpdate = async page => {
	// await page.goto(URL, {
  //           timeout: 20000,
  //           waitUntil: ['load', 'domcontentloaded', 'networkidle0', 'networkidle2']
  //       });
	const spanText = await page.evaluate(
		() => document.querySelector('.curriculum--content-length--1XzLS').textContent
	);
	const updatedCoursePeriod = spanText.split('•')[2].trim().substring(0,7);

	// if both strings are not equal (course has been updated)
	if (!updatedCoursePeriod.localeCompare(COURSE_PERIOD)) {
		sendNotification(updatedCoursePeriod);
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
    let lecturesAdded = lectures - COURSE_PERIOD;
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
