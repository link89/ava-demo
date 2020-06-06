# ava-demo

## 01. code coverage collection and transform

### Summary
This case is about
* how to collect code coverage data on a `selenium` based test automation project via `cdp`
* how to covert v8-format coverage data to istanbul-format

### Run demo
This demo depends on `selenium`. You can install `selenium-standalone` and start a selenium server with it before you execute the example.

Execute the example

`npx ava --timeout=2m 01-webdriver-and-puppeteer.test.ts`

The v8-format coverage data will be in `v8-coverage.json`, convert it to istanbul format via following command.

`npx ts-node bin/to-istanbul-cov.ts cache output v8-coverage.json`

You will get istanbul-format coverage data under `output` folder. Now you can generate html format report by following command

`npx nyc report -t output --reporter html --report-dir output-html`

You can start a http server to view the report in browser

`npx http-server output-html`