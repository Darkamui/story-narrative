/* global window */
import { chromium } from '@playwright/test'
import fs from 'node:fs/promises'
import process from 'node:process'

// A still from the actual story keeps the library light and its preview faithful.
const browser = await chromium.launch()
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 })
  await page.goto(process.env.STORY_URL ?? 'http://127.0.0.1:5186/stories/aluminum')
  await page.waitForFunction(() => window.__CELL_ASSET__?.mapped === 723)
  await page.evaluate(() => window.__CELL_STORY__.seek(3, .9))
  await page.waitForFunction(() => window.__CELL_RENDER__?.chapter === 3)
  await page.waitForTimeout(300)
  await page.addStyleTag({ content: '.chapter-copy, .component-legend, .leader-overlay, .anatomy-guide, .scene-caption, .model-labels, .model-label, .anatomy-views { visibility: hidden !important; }' })
  await fs.mkdir('public/images', { recursive: true })
  await page.locator('canvas').screenshot({ path: 'public/images/aluminum.jpg', type: 'jpeg', quality: 88 })
} finally {
  await browser.close()
}
