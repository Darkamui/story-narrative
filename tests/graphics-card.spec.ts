import { expect, test, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

async function ready(page: Page) {
  await expect(page.locator('.gpu-stage')).toHaveAttribute('data-status', 'ready', { timeout: 30000 })
  await expect(page.locator('.gpu-canvas')).toHaveAttribute('data-transition', 'settled', { timeout: 15000 })
}
async function choose(page: Page, name: string) {
  await page.getByRole('button', { name: 'Choose a part', exact: true }).click()
  await page.getByRole('navigation', { name: 'Choose a part' }).getByRole('button', { name }).click()
  await ready(page)
}
async function expectSameView(page: Page, before: Buffer, after: Buffer) {
  const changedFraction = await page.evaluate(async ([first, second]) => {
    const pixels = async (data: string) => {
      const image = new Image()
      image.src = `data:image/png;base64,${data}`
      await image.decode()
      const canvas = document.createElement('canvas')
      canvas.width = image.width; canvas.height = image.height
      const context = canvas.getContext('2d')!
      context.drawImage(image, 0, 0)
      return context.getImageData(0, 0, canvas.width, canvas.height).data
    }
    const [a, b] = await Promise.all([pixels(first), pixels(second)])
    if (a.length !== b.length) return 1
    let changed = 0
    for (let index = 0; index < a.length; index += 4) {
      if ([0, 1, 2, 3].some(channel => a[index + channel] !== b[index + channel])) changed++
    }
    return changed / (a.length / 4)
  }, [before.toString('base64'), after.toString('base64')])
  // Edge's GPU rasterization changed one pixel in an otherwise identical 606,483-pixel view.
  // Allow at most 0.01% differing pixels, while still catching any camera or part movement.
  expect(changedFraction).toBeLessThanOrEqual(0.0001)
}
test('a single guided action reveals the card, then gives a real processor close-up', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto('/stories/graphics-card')
  await ready(page)
  await expect(page).toHaveTitle('One Frame — How a graphics card works')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('What’s inside a\ngraphics card?')
  await expect(page.locator('.gpu-next')).toHaveCount(1)
  await expect(page.locator('input')).toHaveCount(0)
  const wholeCardExtent = Number(await page.locator('.gpu-canvas').getAttribute('data-extent'))
  await page.getByRole('button', { name: 'Open the card', exact: true }).click()
  await ready(page)
  await expect(page.locator('.gpu-pin-text')).toHaveCount(3)
  await page.getByRole('button', { name: 'Find the processor', exact: true }).click()
  await ready(page)
  await expect(page.locator('.gpu-pin-text')).toHaveText('GPU die')
  expect(Number(await page.locator('.gpu-canvas').getAttribute('data-extent'))).toBeLessThan(wholeCardExtent / 2)
  const processor = await page.locator('canvas').screenshot({ style: '.gpu-pins { display: none !important }' })
  await page.getByRole('button', { name: 'Find its memory', exact: true }).click()
  await ready(page)
  await expect(page.locator('.gpu-observe')).toContainText('eight dark chips')
  await page.getByRole('button', { name: 'Previous view' }).click()
  await ready(page)
  // Hide HTML labels: browser compositing can change their antialiasing by a few pixels.
  await expectSameView(page, processor, await page.locator('canvas').screenshot({ style: '.gpu-pins { display: none !important }' }))
  await page.goBack()
  await ready(page)
  await expect(page.locator('.gpu-story')).toHaveAttribute('data-beat', 'memory')
  await page.goForward()
  await ready(page)
  await expect(page.locator('.gpu-story')).toHaveAttribute('data-beat', 'compute')
  await page.reload()
  await ready(page)
  await expect(page.locator('.gpu-story')).toHaveAttribute('data-beat', 'compute')
  expect(errors).toEqual([])
})

test('every hardware view works; fans demonstrate motion and the ending reassembles', async ({ page }) => {
  await page.goto('/stories/graphics-card#power')
  await ready(page)
  await expect(page.locator('.gpu-pin-text')).toHaveCount(2)
  await page.locator('.gpu-next').click()
  await ready(page)
  await expect(page.locator('.gpu-story')).toHaveAttribute('data-beat', 'contact')
  await expect(page.locator('.gpu-pin-text')).toContainText(['GPU die', 'Thermal paste', 'Contact plate'])
  await page.locator('.gpu-next').click()
  await ready(page)
  await expect(page.locator('.gpu-story')).toHaveAttribute('data-beat', 'heatpipes')
  await expect(page.locator('.gpu-pin-text')).toContainText(['Six heatpipes', 'Contact plate'])
  await page.locator('.gpu-next').click()
  await ready(page)
  const stopped = await page.locator('canvas').screenshot()
  await page.getByRole('button', { name: 'Replay the demonstration' }).click()
  await expect(page.locator('.gpu-canvas')).toHaveAttribute('data-transition', 'moving')
  // A live fan frame must differ from the stationary endpoint.
  await expect.poll(async () => (await page.locator('canvas').screenshot()).equals(stopped)).toBe(false)
  await ready(page)
  await expectSameView(page, stopped, await page.locator('canvas').screenshot())
  await page.locator('.gpu-next').click()
  await ready(page)
  await expect(page.locator('.gpu-story')).toHaveAttribute('data-beat', 'display')
  await expect(page.locator('.gpu-pin-text')).toHaveText('Display connections')
  await page.getByRole('button', { name: 'Put the card back together' }).click()
  await ready(page)
  await expect(page.locator('.gpu-story')).toHaveAttribute('data-beat', 'card')
})

test('optional controls work with a keyboard; reading releases the renderer', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/stories/graphics-card#layers')
  await ready(page)
  await page.getByRole('button', { name: 'Inspect the model' }).click()
  await page.getByRole('slider', { name: 'Zoom', exact: true }).focus()
  await page.keyboard.press('ArrowRight')
  await expect(page.getByRole('slider', { name: 'Zoom', exact: true })).toHaveValue('1.1')
  await page.getByRole('slider', { name: 'Turn', exact: true }).fill('70')
  await page.getByRole('slider', { name: 'Separate layers' }).fill('0')
  await expect(page.getByRole('slider', { name: 'Separate layers' })).toHaveValue('0')
  await page.getByRole('button', { name: 'Restore guided view' }).click()
  await expect(page.locator('#gpu-inspection')).toHaveCount(0)
  await page.getByRole('button', { name: 'Inspect the model' }).click()
  await expect(page.getByRole('slider', { name: 'Separate layers' })).toHaveValue('80')
  await page.getByRole('slider', { name: 'Turn', exact: true }).press('Escape')
  await expect(page.getByRole('button', { name: 'Inspect the model' })).toBeFocused()
  await choose(page, '03 The processor')
  await page.locator('.gpu-options summary').click()
  await page.getByRole('button', { name: 'Read the whole story' }).click()
  await expect(page.locator('.gpu-reading section')).toHaveCount(9)
  await expect(page.locator('canvas')).toHaveCount(0)
  await page.getByRole('button', { name: 'Return to the model' }).first().click()
  await ready(page)
  await expect(page.locator('.gpu-story')).toHaveAttribute('data-beat', 'compute')
})

test('mobile French remains readable and accessible across all nine views', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/stories/graphics-card')
  await ready(page)
  await page.locator('.gpu-options summary').click()
  await page.getByRole('button', { name: 'Français', exact: true }).click()
  await page.locator('.gpu-options summary').click()
  await expect(page.locator('html')).toHaveAttribute('lang', 'fr')
  await expect(page.locator('.gpu-story')).toHaveAttribute('data-motion', 'reduced')
  await page.setViewportSize({ width: 320, height: 740 })
  for (let index = 0; index < 9; index++) {
    await ready(page)
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    await expect(page.locator('.gpu-next')).toBeInViewport()
    if (index === 2 || index === 7) expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
    if (index < 8) await page.locator('.gpu-next').click()
  }
  await page.getByRole('link', { name: 'Tous les récits', exact: false }).click()
  await expect(page.locator('.story-card')).toHaveCount(2)
  await page.locator('.story-card').filter({ hasText: 'Une image' }).getByRole('link', { name: 'Entrer dans le récit', exact: true }).click()
  await expect(page).toHaveURL(/\/stories\/graphics-card$/)
  await expect(page.locator('html')).toHaveAttribute('lang', 'fr')
})

test('failed model retains explanations and the asset retry works', async ({ page }) => {
  await page.route('**/axiom-320.glb', route => route.abort())
  await page.goto('/stories/graphics-card#compute')
  await expect(page.locator('.gpu-fallback')).toBeVisible()
  expect(await page.locator('.gpu-fallback img').evaluate(image => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0)
  await page.locator('.gpu-next').click()
  await expect(page.locator('.gpu-body')).toContainText('brick wall')
  await page.unroute('**/axiom-320.glb')
  await page.getByRole('button', { name: 'Retry 3D' }).click()
  await ready(page)
})

test('renderer module failure offers a working reload', async ({ page }) => {
  await page.route('**/GraphicsScene.tsx*', route => route.abort())
  await page.goto('/stories/graphics-card')
  await expect(page.locator('.gpu-fallback')).toBeVisible()
  await page.unroute('**/GraphicsScene.tsx*')
  await page.getByRole('button', { name: 'Retry 3D' }).click()
  await ready(page)
})

test('without WebGL the complete reading view is still available', async ({ page }) => {
  await page.addInitScript(() => {
    const getContext = HTMLCanvasElement.prototype.getContext
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, kind: string, ...args: unknown[]) {
      if (kind.includes('webgl')) return null
      return getContext.apply(this, [kind, ...args] as Parameters<typeof getContext>)
    } as typeof getContext
  })
  await page.goto('/stories/graphics-card#cooling')
  await expect(page.locator('.gpu-story')).toHaveAttribute('data-beat', 'heatpipes')
  await expect(page.locator('.gpu-fallback')).toBeVisible()
  await page.locator('.gpu-options summary').click()
  await page.getByRole('button', { name: 'Read the whole story' }).click()
  await expect(page.locator('.gpu-reading section')).toHaveCount(9)
})
