/* global window */
import { chromium } from '@playwright/test'
import fs from 'node:fs'
fs.mkdirSync('artifacts/milestone-5', { recursive: true })
const browser = await chromium.launch()
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
  await page.goto('http://127.0.0.1:5186/stories/aluminum')
  await page.waitForFunction(() => window.__CELL_ASSET__?.meshes === 723)
  const capture = async (p, name) => {
    await page.evaluate(p => window.__CELL_STORY__.seek(8, p), p)
    await page.waitForTimeout(400)
    await page.waitForFunction(() => window.getComputedStyle(window.document.querySelector('.chapter.active .chapter-copy')).opacity === '1')
    await page.screenshot({ path: `artifacts/milestone-5/${name}.png` })
  }
  for (const [p, name] of [[0.08, 'baseline'], [0.31, 'onset'], [0.57, 'effect'], [0.96, 'return']]) await capture(p, name)
  await page.setViewportSize({ width: 1280, height: 800 })
  await capture(0.57, 'laptop-effect')
  await page.setViewportSize({ width: 390, height: 844 })
  for (const [p, name] of [[0.08, 'mobile-baseline'], [0.57, 'mobile-effect'], [0.96, 'mobile-return']]) await capture(p, name)
} finally { await browser.close() }
