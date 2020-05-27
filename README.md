# ava-demo

## 01. webdriver.io and puppeteer

### Summary
Integrate with webdriver.io and collect coverage data with puppeteer.

### Run demo
Install `selenium-standalone` and start a selenium server with it.

Then execute

`npx ava --timeout=2m 01-webdriver-and-puppeteer.test.ts`

The coverage report will be in `output/istanbul`, merge with following command:

`npx nyc merge output/istanbul output/merge/coverage.json`

The remap source-map by

` npx remap-istanbul -i coverage-merged.json -o output/final/coverage.json`

Generate report by

` npx nyc report -t output/final --reporter html --report-dir output-html`