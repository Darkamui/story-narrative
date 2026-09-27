/* global window */
import { chromium } from '@playwright/test'
import fs from 'node:fs'
import process from 'node:process'

fs.mkdirSync('artifacts/milestone-2', { recursive: true })
const browser = await chromium.launch()
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
  page.on('pageerror', error => process.stdout.write(`ERROR: ${error.message}\n`))
  await page.goto('http://127.0.0.1:5186/stories/aluminum')
  await page.waitForFunction(() => window.__CELL_ASSET__?.mapped === 723)
  for (const chapter of [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 11]) {
    await page.evaluate(i => window.__CELL_STORY__.seek(i, i === 0 ? 0 : 0.9), chapter)
    await page.waitForTimeout(220)
    await page.screenshot({ path: `artifacts/milestone-2/desktop-${chapter}.png` })
    process.stdout.write(`${JSON.stringify(await page.evaluate(() => { const r = window.__CELL_RENDER__; return { chapter: r.chapter, calls: r.calls, triangles: r.triangles } }))}\n`)
  }
  await page.setViewportSize({ width: 390, height: 844 })
  for (const chapter of [0, 1, 3, 6]) {
    await page.evaluate(i => window.__CELL_STORY__.seek(i, i === 0 ? 0 : 0.9), chapter)
    await page.waitForTimeout(220)
    await page.screenshot({ path: `artifacts/milestone-2/mobile-${chapter}.png` })
  }
} finally { await browser.close() }
