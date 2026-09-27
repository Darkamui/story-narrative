import lighthouse from 'lighthouse'
import desktopConfig from 'lighthouse/core/config/desktop-config.js'
import * as chromeLauncher from 'chrome-launcher'
import fs from 'node:fs/promises'
import process from 'node:process'
import path from 'node:path'
import { chromium } from '@playwright/test'
await fs.mkdir('artifacts/milestone-8',{recursive:true})
await fs.mkdir('artifacts/milestone-8/lighthouse-profile',{recursive:true})
const chrome=await chromeLauncher.launch({chromePath:process.env.CHROME_PATH ?? chromium.executablePath(),userDataDir:path.resolve('artifacts/milestone-8/lighthouse-profile'),chromeFlags:['--headless','--enable-webgl','--ignore-gpu-blocklist']})
try {
 for(const preset of ['desktop','mobile']) {
  const r=await lighthouse('http://127.0.0.1:4186/stories/aluminum',{port:chrome.port,output:['html','json'],logLevel:'error',onlyCategories:['performance','accessibility','best-practices','seo']},preset==='desktop'?desktopConfig:undefined)
  for(const [i,extension] of ['html','json'].entries())await fs.writeFile(`artifacts/milestone-8/lighthouse-${preset}.${extension}`,r.report[i])
  process.stdout.write(JSON.stringify({preset,scores:Object.fromEntries(Object.entries(r.lhr.categories).map(([k,v])=>[k,v.score])),metrics:Object.fromEntries(['first-contentful-paint','largest-contentful-paint','total-blocking-time','cumulative-layout-shift','speed-index'].map(k=>[k,r.lhr.audits[k].displayValue]))})+'\n')
 }
}finally{await chrome.kill()}
