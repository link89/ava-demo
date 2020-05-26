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

	await driver.url('https://cn.bing.com')
	const pages = await puppeteerDriver.pages();
	console.log(`get title via puppeteer: ${await pages[0].title()}`);

	t.pass();
});
