/* global window */
import { chromium } from '@playwright/test'
import fs from 'node:fs'
import process from 'node:process'

fs.mkdirSync('artifacts/milestone-3', { recursive: true })
const browser = await chromium.launch()
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
  page.on('pageerror', error => process.stdout.write(`ERROR: ${error.message}\n`))
  await page.goto('http://127.0.0.1:5186/stories/aluminum')
  await page.waitForFunction(() => window.__CELL_ASSET__?.mapped === 723)
  const capture = async (chapter, local, name) => {
    await page.evaluate(([i, t]) => window.__CELL_STORY__.seek(i, t), [chapter, local])
    await page.waitForTimeout(350)
    await page.screenshot({ path: `artifacts/milestone-3/${name}.png` })
  }
  for (const t of [0.15, 0.4, 0.6, 0.9]) await capture(3, t, `anatomy-${t}`)
  await page.getByRole('button', { name: 'Inner layers', exact: true }).click()
  await page.waitForTimeout(300)
  await page.screenshot({ path: 'artifacts/milestone-3/inner-layers.png' })
  process.stdout.write(JSON.stringify(await page.locator('.component-legend button').allTextContents()) + '\n')
  for (const t of [0.25, 0.48, 0.6, 0.9]) await capture(4, t, `section-${t}`)
  await page.setViewportSize({ width: 390, height: 844 })
  await page.waitForTimeout(500)
  await capture(3, 0.9, 'mobile-anatomy')
  await page.getByRole('button', { name: 'Inner layers', exact: true }).click()
  await page.waitForTimeout(300)
  await page.screenshot({ path: 'artifacts/milestone-3/mobile-inner-layers.png' })
  await capture(4, 0.9, 'mobile-section')
} finally { await browser.close() }
