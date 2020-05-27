import test from 'ava';
import { BrowserObject, remote } from "webdriverio";
import * as puppeteer from 'puppeteer-core';


test('webdriver io cdp demo', async (t) => {
	const driver: BrowserObject = await remote({
		hostname: 'localhost',
		port: 4444,
		path: '/wd/hub',
		capabilities: {
			browserName: 'chrome',
		},
	});
	const debugAddress = driver.capabilities['goog:chromeOptions']?.debuggerAddress;
	const puppeteerDriver = await puppeteer.connect({browserURL: `http://${debugAddress}`});
	const pages = await puppeteerDriver.pages();
	await pages[0].coverage.startJSCoverage();

	await driver.url('https://baidu.com');
  console.log(`get title via puppeteer: ${await pages[0].title()}`);

	const coverage = await pages[0].coverage.stopJSCoverage();
	console.log(coverage);

  await driver.deleteSession();
	t.pass();
});
