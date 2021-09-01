const puppeteer = require('puppeteer');

(async () => {
	const browser = await puppeteer.launch({ headless: false });
	const page = await browser.newPage();
	await browser.newPage();
	await page.goto(
		'https://www.amazon.com/s?k=nodejs&i=stripbooks-intl-ship&ref=nb_sb_noss_1'
	);
	await page.screenshot({ path: 'google.png' });

	const result = await page.evaluate(() => {
		const headersFromWeb = document.querySelectorAll(
			'.a-size-medium.a-color-base.a-text-normal'
		);

		const headerList = [...headersFromWeb];
		return headerList.map(header => header.innerText);
	});

	console.log(result);

	await browser.close();
})();
