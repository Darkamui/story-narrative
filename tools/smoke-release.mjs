/* global window */
import { chromium, firefox, webkit, expect } from '@playwright/test'
import fs from 'node:fs/promises'
import process from 'node:process'
await fs.mkdir('artifacts/milestone-8',{recursive:true})
const results=[]
for(const [name,engine,options] of [['chromium',chromium,{}],['edge',chromium,{channel:'msedge'}],['firefox',firefox,{}],['webkit',webkit,{}]]) {
 const browser=await engine.launch(options)
 try {
  const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[]
  page.on('pageerror',e=>errors.push(e.message))
  await page.goto('http://127.0.0.1:4186/stories/aluminum#anatomy')
  await expect(page.locator('#anatomy')).toHaveClass(/active/)
  await expect(page.locator('.component-legend button')).toHaveCount(13)
  await page.getByRole('button',{name:'Inner layers',exact:true}).click()
  await expect(page.locator('.component-legend button')).toHaveCount(11)
  await page.getByRole('button',{name:'Chapters'}).click()
  await page.getByRole('link',{name:'11 Transformation'}).click()
  await page.getByRole('navigation',{name:'Material journey stages'}).getByRole('button',{name:/Reveal/}).click()
  await expect(page.locator('.chapter.active h1')).toHaveText('A grain becomes possibility.')
  await expect(page.locator('.ending-anchors')).toBeVisible()
  await page.waitForTimeout(300)
  await page.screenshot({path:`artifacts/milestone-8/production-${name}.png`})
  await page.getByRole('button',{name:'Read the story',exact:true}).click()
  await expect(page.locator('.ending-reading article')).toHaveCount(7)
  await page.getByRole('button',{name:'Français',exact:true}).click()
  await expect(page.locator('html')).toHaveAttribute('lang','fr')
  await expect(page.locator('#casting h1')).toHaveText('Un grain devient un monde de possibles.')
  await expect(page.locator('.comparison-reading table')).toContainText('Composition des gaz')
  await expect(page.getByRole('button',{name:'Revenir à la scène',exact:true})).toBeVisible()
  expect(await page.evaluate(()=>!!window.__CELL_STORY__||!!window.__CELL_ENDING__||!!window.__CELL_ASSET__||!!window.__CELL_RENDER__)).toBe(false)
  expect(errors).toEqual([])
  results.push({name,passed:true})
 }finally{await browser.close()}
}
await fs.writeFile('artifacts/milestone-8/production-smoke.json',JSON.stringify(results,null,2))
process.stdout.write(JSON.stringify(results))
