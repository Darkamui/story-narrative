import { test, expect } from '@playwright/test'

test('slow cell loading times out while the opening and retry stay usable',async({page})=>{
  await page.route('**/assets/cell.glb',async route=>{await new Promise(resolve=>setTimeout(resolve,13500));await route.abort().catch(()=>{})})
  await page.goto('/stories/aluminum')
  await expect(page.locator('#grain h1')).toBeVisible()
  await expect(page.getByRole('button',{name:'Retry model'})).toBeVisible({timeout:16000})
  await page.unroute('**/assets/cell.glb')
  await page.getByRole('button',{name:'Retry model'}).click()
  await expect.poll(()=>page.evaluate(()=>window.__CELL_ASSET__?.meshes)).toBe(723)
})

test('keyboard menu, tablet wheel input and viewport resizing remain usable',async({page})=>{
  await page.goto('/stories/aluminum')
  await page.getByRole('button',{name:'Chapters'}).focus()
  await page.keyboard.press('Enter')
  await page.getByRole('link',{name:'03 Exploded anatomy'}).focus()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('button',{name:'Chapters'})).toBeFocused()
  await page.setViewportSize({width:1024,height:768})
  await page.getByRole('button',{name:'Next chapter'}).click()
  await expect(page.locator('#reveal')).toHaveClass(/active/)
  const before=await page.evaluate(()=>scrollY)
  await page.mouse.move(520,550)
  await page.mouse.wheel(0,300)
  await expect.poll(()=>page.evaluate(()=>scrollY)).toBeGreaterThan(before)
  await page.evaluate(()=>window.__CELL_STORY__!.seek(6,.55))
  await page.setViewportSize({width:390,height:844})
  await page.evaluate(()=>window.__CELL_STORY__!.seek(6,.55))
  await expect(page.locator('.chapter.active h1')).toBeInViewport()
  await expect(page.locator('.process-tabs')).toBeVisible()
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)
})

test('WebGL loss leaves the ending and complete reading version available',async({page})=>{
  await page.addInitScript(()=>{
    const original=HTMLCanvasElement.prototype.getContext
    HTMLCanvasElement.prototype.getContext=function(this:HTMLCanvasElement,type:string,...args:unknown[]){
      if(type.includes('webgl'))return null
      return original.apply(this,[type,...args] as Parameters<typeof original>)
    } as typeof original
  })
  await page.goto('/stories/aluminum#casting')
  await expect(page.locator('.ending-fallback')).toContainText('Prepared melt')
  await page.getByRole('navigation',{name:'Material journey stages'}).getByRole('button',{name:/Reveal/}).click()
  await expect(page.locator('.chapter.active h1')).toHaveText('A grain becomes possibility.')
  await page.getByRole('button',{name:'Read the story',exact:true}).click()
  await expect(page.locator('.ending-reading article')).toHaveCount(7)
})
