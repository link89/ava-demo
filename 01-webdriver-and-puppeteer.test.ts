import test from 'ava';
import { BrowserObject, remote } from "webdriverio";
import * as puppeteer from 'puppeteer-core';


test('webdriver io cdp demo', async (t) => {
	// start webdriver
	const driver: BrowserObject = await remote({
		hostname: 'localhost',
		port: 4444,
		path: '/wd/hub',
		capabilities: {
			browserName: 'chrome',
		},
	});

	// connect with puppeteer
	const debugAddress = driver.capabilities['goog:chromeOptions']?.debuggerAddress;
	const puppeteerDriver = await puppeteer.connect({ browserURL: `http://${debugAddress}` });

	// puppeteer: start to collect js coverage
	const pages = await puppeteerDriver.pages();
	await pages[0].coverage.startJSCoverage();

	// do something with webdriver.io or puppeteer
	await driver.url('https://baidu.com');
	console.log(`get title via puppeteer: ${await pages[0].title()}`);

	// puppeteer: stop coverage collection
	const coverage = await pages[0].coverage.stopJSCoverage();
	console.log(coverage);

	// clean up
	await driver.deleteSession();
	t.pass();
});
