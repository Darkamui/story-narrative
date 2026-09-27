/* global window */
import { chromium } from '@playwright/test'
import fs from 'node:fs'
import process from 'node:process'
fs.mkdirSync('artifacts/milestone-4', { recursive: true })
const browser = await chromium.launch()
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
  page.on('pageerror', error => process.stdout.write(`ERROR ${error.message}\n`))
  await page.goto('http://127.0.0.1:5186/stories/aluminum')
  await page.waitForFunction(() => window.__CELL_ASSET__?.mapped === 723)
  const capture = async (chapter, local, name) => {
    await page.evaluate(([i, t]) => window.__CELL_STORY__.seek(i, t), [chapter, local])
    await page.waitForTimeout(450)
    await page.screenshot({ path: `artifacts/milestone-4/${name}.png` })
    process.stdout.write(`${name}: ${JSON.stringify(await page.evaluate(() => window.__CELL_PROCESS__))}\n`)
  }
  for (const t of [0.1, 0.5, 0.9]) await capture(5, t, `current-${t}`)
  for (let i = 0; i < 6; i++) await capture(6, (i + 0.65) / 6, `process-${i}`)
  await capture(7, 0.9, 'normal')
  await capture(9, 0.9, 'metal')
  await page.setViewportSize({ width: 390, height: 844 })
  await page.waitForTimeout(400)
  await capture(5, 0.5, 'mobile-current')
  for (let i = 0; i < 6; i++) await capture(6, (i + 0.65) / 6, `mobile-process-${i}`)
} finally { await browser.close() }
