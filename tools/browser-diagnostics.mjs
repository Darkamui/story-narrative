/* global window */
import { chromium } from '@playwright/test'
import process from 'node:process'
const browser = await chromium.launch({ headless: true, args: ['--enable-webgl', '--ignore-gpu-blocklist'] })
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
page.on('console', message => process.stdout.write(`${message.type()}: ${message.text()}\n`))
page.on('pageerror', error => process.stdout.write(`ERROR: ${error.stack}\n`))
await page.goto('http://127.0.0.1:5186/stories/aluminum')
await page.waitForTimeout(4000)
process.stdout.write(`Canvas count: ${await page.locator('canvas').count()}\n`)
for (const index of [0, 1, 3, 5, 8, 11]) {
  await page.evaluate(i => window.__CELL_STORY__.seek(i, 0.9), index)
  await page.waitForTimeout(100)
  process.stdout.write(`${JSON.stringify(await page.evaluate(() => { const s = window.__CELL_RENDER__; return { chapter: s?.chapter, frame: s?.frame, calls: s?.calls, triangles: s?.triangles } }))}\n`)
}
await browser.close()
