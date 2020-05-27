import test from 'ava';
import { BrowserObject, remote } from "webdriverio";
import * as puppeteer from 'puppeteer-core';
import * as fs from 'fs';
import * as bluebird from "bluebird";


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
	await pages[0].coverage.startJSCoverage({ resetOnNavigation: false });

	// do something with webdriver.io or puppeteer
	await driver.url('https://jupiter.fiji.gliprc.com');
	await bluebird.delay(5e3);
	console.log(`get title via puppeteer: ${await pages[0].title()}`);

	// puppeteer: stop coverage collection
	// TODO: handle remap
	const coverage = await pages[0].coverage.stopJSCoverage();
	fs.writeFileSync('v8-coverage.json', JSON.stringify(coverage, null, 2));


	// clean up
	await driver.deleteSession();
	t.pass();
});
