import { expect, test } from '@playwright/test'

test('full narrative, fast seeks, reverse scrolling and screenshots', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto('/stories/aluminum')
  await expect(page.locator('canvas')).toBeVisible()
  await expect.poll(() => page.evaluate(() => window.__CELL_RENDER__?.frame ?? 0)).toBeGreaterThan(1)
  await expect.poll(() => page.evaluate(() => window.__CELL_ASSET__?.mapped)).toBe(723)
  await page.screenshot({ path: 'test-results/00-grain.png' })
  const samples: number[] = []
  const transforms: Record<string, number[]>[] = []
  for (let index = 0; index < 12; index++) {
    await page.evaluate(i => window.__CELL_STORY__!.seek(i, 0.9), index)
    await expect.poll(() => page.evaluate(() => window.__CELL_STORY__!.state().chapterIndex)).toBe(index)
    await page.waitForTimeout(130)
    await expect(page.locator('.chapter.active h1')).toBeInViewport()
    if (index > 0 && index < 10) await expect(page.getByRole('complementary', { name: 'Cell components' })).toBeVisible()
    samples.push(await page.evaluate(() => window.__CELL_STORY__!.state().explodedAmount))
    await expect.poll(() => page.evaluate(() => window.__CELL_RENDER__?.chapter)).toBe(index)
    transforms.push(await page.evaluate(() => window.__CELL_RENDER__!.positions))
    if ([1, 3, 5, 8, 11].includes(index)) await page.screenshot({ path: `test-results/chapter-${index}.png` })
  }
  for (let index = 11; index >= 0; index--) {
    await page.evaluate(i => window.__CELL_STORY__!.seek(i, 0.9), index)
    await expect.poll(() => page.evaluate(() => window.__CELL_STORY__!.state().chapterIndex)).toBe(index)
    expect(await page.evaluate(() => window.__CELL_STORY__!.state().explodedAmount)).toBeCloseTo(samples[index], 6)
    await expect.poll(() => page.evaluate(() => window.__CELL_RENDER__?.chapter)).toBe(index)
    expect(await page.evaluate(() => window.__CELL_RENDER__!.positions)).toEqual(transforms[index])
  }
  expect(errors).toEqual([])
})

test('all assemblies and individual parts are identifiable', async ({ page }) => {
  await page.goto('/stories/aluminum')
  await expect.poll(() => page.evaluate(() => window.__CELL_ASSET__?.meshes)).toBe(723)
  await page.evaluate(() => window.__CELL_STORY__!.seek(3, 0.9))
  const key = page.getByRole('complementary', { name: 'Cell components' })
  await expect(key.getByRole('button')).toHaveCount(13)
  await page.locator('#legend-anodes').click()
  await expect(page.getByRole('complementary', { name: 'Selected component' })).toBeVisible()
  const parts = page.getByRole('combobox', { name: 'Individual part' })
  await expect(parts.locator('option')).toHaveCount(253)
  await parts.selectOption('05_ANODES_block_008')
  await expect(page.locator('.selected-part-name')).toContainText('Block 9')
  await page.screenshot({ path: 'test-results/selected-anode.png' })
  await page.getByRole('button', { name: 'Close component details' }).click()
  await expect(page.getByRole('complementary', { name: 'Selected component' })).toBeHidden()
})

test('inner anatomy exposes individual courses and returns to the complete atlas', async ({ page }) => {
  await page.goto('/stories/aluminum')
  await expect.poll(() => page.evaluate(() => window.__CELL_ASSET__?.meshes)).toBe(723)
  await page.evaluate(() => window.__CELL_STORY__!.seek(3, 0.9))
  await page.getByRole('button', { name: 'Inner layers', exact: true }).click()
  const key = page.getByRole('complementary', { name: 'Cell components' })
  await expect(key.getByRole('button')).toHaveCount(11)
  await expect(page.getByRole('button', { name: 'Inner layers', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await page.locator('#legend-02c').click()
  await expect(page.getByRole('combobox', { name: 'Individual part' })).toHaveValue('02_REFRACTORY_firebrick_001')
  await page.getByRole('button', { name: 'Close component details' }).click()
  await page.getByRole('button', { name: 'Whole cell', exact: true }).click()
  await expect(key.getByRole('button')).toHaveCount(13)
  await page.getByRole('button', { name: 'Inner layers', exact: true }).click()
  await page.evaluate(() => window.__CELL_STORY__!.seek(4, 0.6))
  await expect(key.getByRole('button')).toHaveCount(13)
  const state = await page.evaluate(() => window.__CELL_STORY__!.state())
  expect(state.explodedAmount).toBe(0)
  expect(state.sectionAmount).toBeCloseTo(0.5, 3)
  await page.evaluate(() => window.__CELL_STORY__!.seek(3, 0.9))
  await expect(page.getByRole('button', { name: 'Whole cell', exact: true })).toHaveAttribute('aria-pressed', 'true')
})

test('section asset failure has the same recoverable loading path', async ({ page }) => {
  await page.route('**/assets/section-caps.glb', route => route.fulfill({ status: 503, body: 'Unavailable' }))
  await page.goto('/stories/aluminum')
  await expect(page.getByRole('button', { name: 'Retry model' })).toBeVisible()
  await page.unroute('**/assets/section-caps.glb')
  await page.getByRole('button', { name: 'Retry model' }).click()
  await expect.poll(() => page.evaluate(() => window.__CELL_ASSET__?.meshes)).toBe(723)
})

test('six process mechanisms scrub forward and reverse with distinct diagrams', async ({ page }) => {
  await page.goto('/stories/aluminum')
  await expect.poll(() => page.evaluate(() => window.__CELL_ASSET__?.meshes)).toBe(723)
  const names = ['Feed', 'Dissolve', 'React', 'Consume carbon', 'Collect gas', 'Retain heat']
  const snapshots = []
  for (let index = 0; index < names.length; index++) {
    await page.evaluate(i => window.__CELL_STORY__!.seek(6, (i + 0.65) / 6), index)
    await expect.poll(() => page.evaluate(() => window.__CELL_PROCESS__?.mode)).toBe(index)
    await expect(page.getByRole('navigation', { name: 'Electrolysis mechanisms' }).getByRole('button', { name: names[index], exact: false })).toHaveAttribute('aria-current', 'step')
    await expect(page.locator('.mechanism-figure svg')).toBeVisible()
    snapshots.push(await page.evaluate(() => window.__CELL_PROCESS__))
  }
  for (let index = 5; index >= 0; index--) {
    await page.evaluate(i => window.__CELL_STORY__!.seek(6, (i + 0.65) / 6), index)
    await expect.poll(() => page.evaluate(() => window.__CELL_PROCESS__?.mode)).toBe(index)
    expect(await page.evaluate(() => window.__CELL_PROCESS__)).toEqual(snapshots[index])
  }
  await page.getByRole('navigation', { name: 'Electrolysis mechanisms' }).getByRole('button', { name: 'React', exact: false }).click()
  await expect(page.locator('.mechanism-react figcaption')).toContainText('2 Al₂O₃ + 3 C → 4 Al + 3 CO₂')
  await page.getByRole('button', { name: 'Read the story', exact: true }).click()
  await expect(page.locator('.process-reading article')).toHaveCount(6)
  await expect(page.locator('.process-reading').getByText('Open a path through the crust.', { exact: true })).toBeVisible()
})

test('reduced-motion mobile users can select every process mechanism', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/stories/aluminum')
  await expect.poll(() => page.evaluate(() => window.__CELL_ASSET__?.meshes)).toBe(723)
  await page.evaluate(() => window.__CELL_STORY__!.seek(6, 0.02))
  const tabs = page.getByRole('navigation', { name: 'Electrolysis mechanisms' })
  for (const name of ['Dissolve', 'React', 'Consume carbon', 'Collect gas', 'Retain heat', 'Feed']) {
    const button = tabs.getByRole('button', { name, exact: false })
    await button.click()
    await expect(button).toHaveAttribute('aria-current', 'step')
    await expect(page.locator('.mechanism-figure')).toBeInViewport()
    await expect(page.locator('.chapter.active h1')).toBeInViewport()
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
})

test('model failure offers retry while opening and text still work', async ({ page }) => {
  await page.route('**/assets/cell.glb', route => route.fulfill({ status: 503, body: 'Unavailable' }))
  await page.goto('/stories/aluminum')
  await expect(page.getByRole('button', { name: 'Retry model' })).toBeVisible()
  await expect(page.locator('canvas')).toBeVisible()
  await page.unroute('**/assets/cell.glb')
  await page.getByRole('button', { name: 'Retry model' }).click()
  await expect.poll(() => page.evaluate(() => window.__CELL_ASSET__?.meshes)).toBe(723)
  await expect(page.getByRole('button', { name: 'Retry model' })).toBeHidden()
})

test('keyboard navigation, chapter links, refresh and reading mode', async ({ page }) => {
  await page.goto('/stories/aluminum')
  await page.getByRole('button', { name: 'Next chapter' }).click()
  await expect(page.locator('.chapter.active')).toHaveAttribute('id', 'reveal')
  const beforePageDown = await page.evaluate(() => scrollY)
  await page.keyboard.press('PageDown')
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(beforePageDown)
  await page.getByRole('button', { name: 'Chapters' }).click()
  await page.getByRole('link', { name: '08 Anode effect' }).click()
  await expect(page.locator('.chapter.active')).toHaveAttribute('id', 'anode-effect')
  await page.reload()
  await expect(page.locator('.chapter.active')).toHaveAttribute('id', 'anode-effect')
  await page.getByRole('button', { name: 'Read the story' }).click()
  await expect(page.locator('.scene-stage')).toBeHidden()
  expect(await page.locator('main section').count()).toBe(12)
  await page.getByRole('button', { name: 'Return to scene' }).click()
  await expect(page.locator('.chapter.active')).toHaveAttribute('id', 'anode-effect')
  await page.goto('about:blank')
  await page.goBack()
  await expect(page.locator('.chapter.active')).toHaveAttribute('id', 'anode-effect')
})

test('mobile and reduced motion preserve discrete chapter states', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/stories/aluminum')
  await expect(page.locator('canvas')).toBeVisible()
  await page.evaluate(() => window.__CELL_STORY__!.seek(3, 0.2))
  await expect.poll(() => page.evaluate(() => window.__CELL_STORY__!.state().explodedAmount)).toBe(1)
  await page.screenshot({ path: 'test-results/mobile-anatomy.png' })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await expect(page.getByRole('button', { name: 'Motion reduced' })).toHaveAttribute('aria-pressed', 'true')
})

test('WebGL failure retains readable content and retry', async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...args: unknown[]) {
      if (type.includes('webgl')) return null
      return original.apply(this, [type, ...args] as Parameters<typeof original>)
    } as typeof original
  })
  await page.goto('/stories/aluminum')
  await expect(page.getByText('3D is unavailable.', { exact: false })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Retry 3D' })).toBeVisible()
  await page.getByRole('button', { name: 'Read the story' }).click()
  await expect(page.locator('#casting h1')).toHaveText('A grain becomes possibility.')
})
