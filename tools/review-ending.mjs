/* global window */
import { chromium } from '@playwright/test'
import fs from 'node:fs'
import process from 'node:process'
fs.mkdirSync('artifacts/milestone-6', { recursive: true })
const browser = await chromium.launch()
try {
  for (const [name, width, height] of [['desktop',1440,1000],['laptop',1280,800],['mobile',390,844]]) {
    const page = await browser.newPage({ viewport: { width,height } })
    page.on('pageerror',e=>process.stderr.write(e.message+'\n'))
    await page.goto('http://127.0.0.1:5186/stories/aluminum#tapping')
    await page.waitForFunction(() => window.__CELL_ENDING__?.chapter === 10)
    for (const [chapter,count] of [[10,3],[11,4]]) for (let i=0;i<count;i++) {
      await page.evaluate(([c,p])=>window.__CELL_STORY__.seek(c,p),[chapter,(i+.7)/count])
      await page.waitForTimeout(350)
      await page.screenshot({ path:`artifacts/milestone-6/${name}-${chapter}-${i}.png` })
    }
    await page.close()
  }
} finally { await browser.close() }
