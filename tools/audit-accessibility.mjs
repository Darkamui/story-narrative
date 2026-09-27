/* global window */
import { chromium } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import fs from 'node:fs'
import process from 'node:process'
fs.mkdirSync('artifacts/milestone-8', {recursive:true})
const browser=await chromium.launch()
const results=[]
try {
 const context=await browser.newContext({viewport:{width:1440,height:1000}})
 const page=await context.newPage()
 await page.goto('http://127.0.0.1:5186/stories/aluminum')
 await page.waitForFunction(()=>window.__CELL_ASSET__?.meshes===723)
 for(const c of [0,1,3,4,5,6,7,8,9,10,11]) {
  await page.evaluate(c=>window.__CELL_STORY__.seek(c,c===11?.95:.55),c)
  await page.waitForTimeout(250)
  const {violations}=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze()
  results.push({chapter:c,violations:violations.map(v=>({id:v.id,impact:v.impact,description:v.description,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}))})
 }
 await page.getByRole('button',{name:'Read the story',exact:true}).click()
 await page.waitForTimeout(250)
 const {violations}=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze()
 results.push({mode:'reading',violations})
 await page.getByRole('button',{name:'Return to scene',exact:true}).click()
 await page.setViewportSize({width:390,height:844})
 for(const c of [0,3,6,8,10,11]) {
  await page.evaluate(c=>window.__CELL_STORY__.seek(c,.55),c)
  await page.waitForTimeout(300)
  const {violations}=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze()
  results.push({chapter:c,mode:'mobile',violations:violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}))})
 }
 fs.writeFileSync('artifacts/milestone-8/axe.json',JSON.stringify(results,null,2))
 process.stdout.write(JSON.stringify(results.map(r=>({chapter:r.chapter,mode:r.mode,violations:r.violations.map(v=>({id:v.id,nodes:v.nodes.length,examples:v.nodes.slice(0,3)}))})),null,2))
}finally{await browser.close()}
