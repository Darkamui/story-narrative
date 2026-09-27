/* global window */
import { chromium } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import fs from 'node:fs'
import process from 'node:process'
const directory = 'artifacts/localization'
fs.mkdirSync(directory, { recursive: true })
const browser = await chromium.launch()
const results = []
try {
  const context = await browser.newContext()
  const page = await context.newPage()
  await page.goto('http://127.0.0.1:5186/stories/aluminum')
  await page.waitForFunction(() => window.__CELL_ASSET__?.mapped === 723)
  await page.getByRole('button', { name: 'Français', exact: true }).click()
  for (const [device, width, height] of [['desktop',1280,800], ['mobile',390,844]]) {
    await page.setViewportSize({ width, height })
    for (const [chapter, local] of [[0,.8],[3,.9],[5,.9],[6,.08],[6,.25],[6,.42],[6,.59],[6,.75],[6,.92],[8,.62],[10,.55],[11,.9]]) {
      await page.evaluate(([i,p]) => window.__CELL_STORY__.seek(i,p), [chapter, local])
      await page.waitForTimeout(250)
      await page.screenshot({ path: `${directory}/${device}-${chapter}-${local}.png` })
      const svgOverflow = await page.locator('.mechanism-figure text, .interface-pair text').evaluateAll(nodes => nodes.flatMap(node => {
        const bounds = node.getBBox(), svg = node.ownerSVGElement
        return bounds.x < 0 || bounds.x + bounds.width > svg.viewBox.baseVal.width ? [node.textContent] : []
      }))
      results.push({device,chapter,local,svgOverflow})
    }
    for (const chapter of [0,3,6,8,11]) {
      await page.evaluate(i => window.__CELL_STORY__.seek(i,.6), chapter)
      await page.waitForTimeout(150)
      const { violations } = await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze()
      results.push({device,chapter,violations:violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}))})
    }
  }
  fs.writeFileSync(`${directory}/review.json`, JSON.stringify(results,null,2))
  process.stdout.write(JSON.stringify(results,null,2))
} finally { await browser.close() }
