import { expect, test } from '@playwright/test'

test('anode comparison has matched geometry, reversible states and an explicit return', async ({ page }) => {
  await page.goto('/stories/aluminum')
  await expect.poll(() => page.evaluate(() => window.__CELL_ASSET__?.meshes)).toBe(723)
  const seen = []
  for (const p of [0.08, 0.3, 0.57, 0.82, 0.96]) {
    await page.evaluate(p => window.__CELL_STORY__!.seek(8, p), p)
    await expect(page.locator('#anode-effect')).toHaveClass(/active/)
    await expect.poll(() => page.evaluate(() => window.__CELL_STORY__!.state().chapterProgress)).toBeCloseTo(p, 3)
    await expect.poll(() => page.evaluate(() => window.__CELL_COMPARE__?.mix)).toBeCloseTo(await page.evaluate(() => window.__CELL_STORY__!.state().abnormalStateMix), 4)
    seen.push(await page.evaluate(() => window.__CELL_COMPARE__))
  }
  for (const [i, p] of [...[0.08, 0.3, 0.57, 0.82, 0.96].entries()].reverse()) {
    await page.evaluate(p => window.__CELL_STORY__!.seek(8, p), p)
    await expect.poll(() => page.evaluate(() => window.__CELL_COMPARE__)).toEqual(seen[i])
  }
  const tabs = page.getByRole('navigation', { name: 'Comparison stages' })
  await tabs.getByRole('button', { name: 'Anode effect', exact: true }).click()
  await expect(page.locator('.examined-interface [data-film]')).toHaveAttribute('opacity', '1')
  await expect(page.locator('.reference-interface [data-film]')).toHaveAttribute('opacity', '0')
  const figure = await page.locator('.comparison-figure').boundingBox()
  const indicators = await page.locator('.comparison-indicators').boundingBox()
  expect(figure!.y + figure!.height).toBeLessThan(indicators!.y)
  for (const attribute of ['x', 'y', 'width', 'height']) expect(await page.locator('.examined-interface .comparison-carbon').getAttribute(attribute)).toBe(await page.locator('.reference-interface .comparison-carbon').getAttribute(attribute))
  await tabs.getByRole('button', { name: 'Return to normal', exact: true }).click()
  await expect(page.locator('.anode-comparison')).toHaveAttribute('data-mix', '0')
  await expect(page.locator('.chapter.active h1')).toHaveText('An upset, not a production stage.')
  await page.getByRole('button', { name: 'Next chapter' }).click()
  await expect(page.locator('#metal')).toHaveClass(/active/)
  expect(await page.evaluate(() => window.__CELL_STORY__!.state().abnormalStateMix)).toBe(0)
})

test('development mix slider changes the interface without moving its geometry', async ({ page }) => {
  await page.goto('/stories/aluminum?debug')
  await expect.poll(() => page.evaluate(() => window.__CELL_ASSET__?.meshes)).toBe(723)
  await page.evaluate(() => window.__CELL_STORY__!.seek(8, 0.08))
  await page.locator('.dev-controls summary').click()
  const slider = page.getByLabel('abnormalStateMix', { exact: true })
  const original = await page.locator('.examined-interface .comparison-carbon').boundingBox()
  await slider.focus(); await slider.press('End')
  await expect(page.locator('.examined-interface [data-film]')).toHaveAttribute('opacity', '1')
  await expect(page.getByRole('region', { name: 'Cell voltage: Elevated' })).toBeVisible()
  expect(await page.locator('.examined-interface .comparison-carbon').boundingBox()).toEqual(original)
  await slider.press('Home')
  await expect(page.locator('.examined-interface [data-film]')).toHaveAttribute('opacity', '0')
  await page.getByRole('button', { name: 'Reset to scroll' }).click()
  expect(await page.evaluate(() => window.__CELL_STORY__!.state().abnormalStateMix)).toBe(0)
})

test('mobile reduced-motion comparison and its full reading fallback remain usable', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/stories/aluminum#anode-effect')
  const tabs = page.getByRole('navigation', { name: 'Comparison stages' })
  for (const [name, value] of [['Anode effect', '1'], ['Return to normal', '0'], ['Normal reference', '0']] as const) {
    await tabs.getByRole('button', { name, exact: true }).click()
    await expect(page.locator('.anode-comparison')).toHaveAttribute('data-mix', value)
    await expect(page.locator('.examined-interface')).toBeInViewport()
    await expect(page.locator('.voltage-indicator')).toBeInViewport()
    await expect(page.locator('.chapter.active h1')).toBeInViewport()
    const figure = await page.locator('.comparison-figure').boundingBox()
    const indicators = await page.locator('.comparison-indicators').boundingBox()
    expect(figure!.y + figure!.height).toBeLessThan(indicators!.y)
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.getByRole('button', { name: 'Read the story', exact: true }).click()
  await expect(page.locator('.comparison-reading tbody tr')).toHaveCount(4)
  await expect(page.locator('.comparison-reading')).toContainText('Plant intervention')
  await expect(page.locator('.comparison-reading')).toContainText('Low-voltage PFC')
})

test('laptop comparison works without WebGL and keeps indicators below the diagrams', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...args: unknown[]) {
      if (type.includes('webgl')) return null
      return original.apply(this, [type, ...args] as Parameters<typeof original>)
    } as typeof original
  })
  await page.goto('/stories/aluminum#anode-effect')
  await expect(page.getByRole('button', { name: 'Retry 3D' })).toBeVisible()
  await page.getByRole('navigation', { name: 'Comparison stages' }).getByRole('button', { name: 'Anode effect', exact: true }).click()
  await expect(page.locator('.examined-interface [data-film]')).toHaveAttribute('opacity', '1')
  const figure = await page.locator('.comparison-figure').boundingBox()
  const indicators = await page.locator('.comparison-indicators').boundingBox()
  expect(figure!.y + figure!.height).toBeLessThan(indicators!.y)
  await expect(page.locator('.chapter.active h1')).toBeInViewport()
  await expect(page.locator('.comparison-indicators')).toBeInViewport()
})
