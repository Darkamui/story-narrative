import { test, expect } from '@playwright/test'

test('tapping and casting equipment scrub reversibly through all stages', async ({page}) => {
  await page.goto('/stories/aluminum#tapping')
  await expect.poll(()=>page.evaluate(()=>window.__CELL_ENDING__?.chapter)).toBe(10)
  const samples=[]
  for(const [c,count] of [[10,3],[11,4]]) for(let i=0;i<count;i++) {
    const p=(i+.7)/count
    await page.evaluate(([c,p])=>window.__CELL_STORY__!.seek(c,p),[c,p])
    await expect.poll(()=>page.evaluate(()=>window.__CELL_ENDING__?.beat)).toBe(i)
    await expect(page.locator('.ending-key li')).toHaveCount(6)
    await expect(page.locator('.chapter.active h1')).toBeInViewport()
    samples.push({c,p,state:await page.evaluate(()=>window.__CELL_ENDING__)})
  }
  for(const {c,p,state} of samples.reverse()) {
    await page.evaluate(([c,p])=>window.__CELL_STORY__!.seek(c,p),[c,p])
    await expect.poll(()=>page.evaluate(()=>window.__CELL_ENDING__)).toEqual(state)
  }
  await page.locator('.ending-key').getByRole('button',{name:/Tapping tube/}).click()
  await expect(page.locator('.ending-part-note')).toContainText('submerged in metal')
})

test('ending asset can fail and retry without blocking the narrative',async({page})=>{
  await page.route('**/assets/ending.glb',r=>r.fulfill({status:503,body:'Unavailable'}))
  await page.goto('/stories/aluminum#tapping')
  await expect(page.getByRole('button',{name:'Retry equipment'})).toBeVisible()
  await expect(page.locator('.chapter.active h1')).toHaveText('Reach beneath the bath.')
  await page.unroute('**/assets/ending.glb')
  await page.getByRole('button',{name:'Retry equipment'}).click()
  await expect.poll(()=>page.evaluate(()=>window.__CELL_ENDING__?.chapter)).toBe(10)
  await expect(page.getByRole('button',{name:'Retry equipment'})).toBeHidden()
})

test('mobile ending keeps all stages and complete reading content',async({page})=>{
  await page.setViewportSize({width:390,height:844})
  await page.emulateMedia({reducedMotion:'reduce'})
  await page.goto('/stories/aluminum#casting')
  const nav=page.getByRole('navigation',{name:'Material journey stages'})
  for(const name of ['Prepare','Fill','Cool','Reveal']) {
    await nav.getByRole('button',{name,exact:false}).click()
    await expect(page.locator('.chapter.active h1')).toBeInViewport()
    await expect(page.locator('.ending-key')).toBeInViewport()
  }
  await expect(page.locator('.chapter.active h1')).toHaveText('A grain becomes possibility.')
  await page.getByRole('button',{name:'Read the story',exact:true}).click()
  await expect(page.locator('.ending-reading article')).toHaveCount(7)
  await expect(page.locator('#casting')).toContainText('not a depiction of a demoulding mechanism')
})
