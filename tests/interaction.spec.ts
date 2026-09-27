import { expect, test } from '@playwright/test'
import { journeyStops } from '../src/stories/aluminum/data/journey'

test('complete guided journey needs no wheel input and pauses at every action', async ({ page }, info) => {
  test.setTimeout(100000)
  // Exercise animated travel in Chromium and discrete travel in other engines.
  if (info.project.name !== 'chromium') await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/stories/aluminum')
  await expect(page.locator('.journey-next')).toHaveText(/Enter the cell/)
  for (const stop of journeyStops) {
    await expect(page.locator('.journey-next')).toContainText(stop.action)
    await page.locator('.journey-next').click()
    await expect(page.locator('.journey-next')).not.toContainText('Pause here')
    const state = await page.evaluate(() => window.__CELL_STORY__!.state())
    expect(state.chapterIndex).toBe(stop.chapter)
    expect(state.chapterProgress).toBeCloseTo(stop.local, 2)
  }
  await expect(page.locator('.journey-next')).toContainText('Start again')
  await expect(page.locator('.chapter.active h1')).toHaveText('A grain becomes possibility.')
  const settled = await page.evaluate(() => scrollY)
  await page.waitForTimeout(300)
  expect(await page.evaluate(() => scrollY)).toBe(settled)
  await page.getByRole('button', { name: 'Previous action', exact: true }).click()
  await expect(page.locator('.journey-next')).toContainText('Reveal the ingot')
})

test('pause, wheel interruption, keyboard activation and chapter jumps share one playhead', async ({ page }) => {
  await page.goto('/stories/aluminum')
  await page.locator('.journey-next').focus()
  await page.keyboard.press('Enter')
  await expect(page.locator('.journey-next')).toContainText('Pause here')
  await page.waitForTimeout(250)
  await page.keyboard.press('Space')
  await expect(page.locator('.journey-next')).not.toContainText('Pause here')
  const paused = await page.evaluate(() => scrollY)
  await page.waitForTimeout(500)
  expect(await page.evaluate(() => scrollY)).toBe(paused)
  await page.locator('.journey-next').click()
  await expect(page.locator('.journey-next')).toContainText('Pause here')
  await page.mouse.move(450,400)
  await page.mouse.wheel(0,160)
  await expect(page.locator('.journey-next')).not.toContainText('Pause here')
  await page.getByRole('button', { name: 'Chapters', exact: false }).click()
  await page.getByRole('link', { name: '08 Anode effect' }).click()
  await expect(page.locator('#anode-effect')).toHaveClass(/active/)
  await page.waitForTimeout(1500)
  await expect(page.locator('#anode-effect')).toHaveClass(/active/)
})

test('layer slider, circuit selection and direct tabs remain reversible in French', async ({ page }) => {
  await page.goto('/stories/aluminum')
  await expect.poll(() => page.evaluate(() => window.__CELL_ASSET__?.mapped)).toBe(723)
  await page.evaluate(() => window.__CELL_STORY__!.seek(3,.8))
  const slider = page.getByRole('slider', { name: 'Separate the layers', exact: true })
  await slider.focus()
  await page.keyboard.press('Home')
  await expect.poll(() => page.evaluate(() => window.__CELL_STORY__!.state().explodedAmount)).toBe(0)
  await page.keyboard.press('End')
  await expect.poll(() => page.evaluate(() => window.__CELL_STORY__!.state().explodedAmount)).toBe(1)
  await page.getByRole('button', { name: 'Français', exact: true }).click()
  await expect(page.getByRole('slider', { name: 'Séparer les couches', exact: true })).toHaveValue('100')
  await expect(page.locator('.journey-next')).toContainText('Observer la coupe')
  await page.evaluate(() => window.__CELL_STORY__!.seek(5,.1))
  await page.locator('.electrical-diagram').getByRole('button', { name: /Conduction ionique/ }).click()
  await expect(page.locator('.electrical-diagram li[data-current=true]')).toContainText('Électrolyte')
  await page.evaluate(() => window.__CELL_STORY__!.seek(6,.1))
  await page.getByRole('navigation', { name: 'Mécanismes de l’électrolyse' }).getByRole('button', { name: 'Capter les gaz' }).click()
  await expect(page.locator('.mechanism-gas')).toBeVisible()
  await page.getByRole('button', { name: 'Lire le récit', exact: true }).click()
  await expect(page.locator('.journey-controls')).toHaveCount(0)
  await page.getByRole('button', { name: 'Revenir à la scène', exact: true }).click()
  await expect(page.locator('.mechanism-gas')).toBeVisible()
})

test('mobile actions fit alongside the narrative and work without WebGL', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext
    HTMLCanvasElement.prototype.getContext = function(this: HTMLCanvasElement, type: string, ...args: unknown[]) {
      return type.includes('webgl') ? null : original.apply(this,[type,...args] as Parameters<typeof original>)
    } as typeof original
  })
  await page.goto('/stories/aluminum')
  await page.getByRole('button', { name: 'Français', exact: true }).click()
  await page.locator('.journey-next').click()
  await expect(page.locator('#reveal')).toHaveClass(/active/)
  for (const chapter of [0,3,5,6,8,10,11]) {
    await page.evaluate(i => window.__CELL_STORY__!.seek(i,.9),chapter)
    await expect(page.locator('.journey-next')).toBeInViewport()
    await expect(page.locator('.chapter.active h1')).toBeInViewport()
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    const bottom = await page.locator('.chapter.active .chapter-copy').evaluate(node => node.getBoundingClientRect().bottom)
    const footer = await page.locator('.story-footer').evaluate(node => node.getBoundingClientRect().top)
    expect(bottom).toBeLessThanOrEqual(footer)
  }
})
