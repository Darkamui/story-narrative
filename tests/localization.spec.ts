import { expect, test, type Page } from '@playwright/test'
import { french } from '../src/stories/aluminum/i18n/locale'

async function ready(page: Page) {
  await page.goto('/stories/aluminum')
  await expect.poll(() => page.evaluate(() => window.__CELL_ASSET__?.mapped)).toBe(723)
}
async function seek(page: Page, chapter: number, local = .9) {
  await page.evaluate(([i, p]) => window.__CELL_STORY__!.seek(i, p), [chapter, local])
  await expect.poll(() => page.evaluate(() => window.__CELL_STORY__!.state().chapterIndex)).toBe(chapter)
}
async function noEnglishLeaks(page: Page) {
  const keys = Object.keys(french).filter(key => key !== french[key])
  const leaks = await page.evaluate(messages => {
    const english = new Set(messages), found: string[] = []
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
    while (walker.nextNode()) {
      const value = walker.currentNode.textContent?.trim() ?? ''
      if (walker.currentNode.parentElement?.closest('noscript')) continue
      if (english.has(value)) found.push(value)
    }
    document.querySelectorAll('[aria-label]').forEach(node => {
      if (english.has(node.getAttribute('aria-label')!)) found.push(node.getAttribute('aria-label')!)
    })
    return [...new Set(found)]
  }, keys)
  expect(leaks).toEqual([])
}

test('language switch keeps chapter, selected part, scene and preferences; persists after reload', async ({ page }) => {
  await ready(page)
  await seek(page, 3)
  await page.locator('#legend-anodes').click()
  await page.getByRole('combobox', { name: 'Individual part' }).selectOption('05_ANODES_block_008')
  await page.getByRole('combobox', { name: 'Rendering quality' }).selectOption('low')
  const before = await page.evaluate(() => ({ progress: window.__CELL_STORY__!.state().globalProgress, y: scrollY }))
  await page.evaluate(() => { document.querySelector('canvas')!.dataset.languageTest = 'same-canvas' })
  await page.getByRole('button', { name: 'Français', exact: true }).click()
  await expect(page.locator('html')).toHaveAttribute('lang', 'fr')
  await expect(page).toHaveTitle('Dans la cuve — Du grain au métal')
  await expect(page.getByRole('button', { name: 'Français', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await expect(page.locator('.selected-part-name')).toContainText('Bloc 9')
  await expect(page.getByRole('combobox', { name: 'Pièce individuelle' })).toHaveValue('05_ANODES_block_008')
  await expect(page.getByRole('combobox', { name: 'Qualité du rendu' })).toHaveValue('low')
  await expect(page.locator('canvas')).toHaveAttribute('data-language-test', 'same-canvas')
  await expect(page.locator('.anatomy-phase')).toContainText('Observer et examiner')
  await expect(page.locator('#visibility-anodes')).not.toHaveText('Locating…')
  expect(await page.evaluate(() => ({ progress: window.__CELL_STORY__!.state().globalProgress, y: scrollY }))).toEqual(before)
  await noEnglishLeaks(page)
  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('lang', 'fr')
  await expect(page.locator('.chapter.active h1')).toHaveText('Décomposer pour comprendre.')
  await page.getByRole('button', { name: 'English', exact: true }).click()
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  await expect(page.locator('.chapter.active h1')).toHaveText('Take it apart. Keep the relationships.')
})

test('French covers every chapter, mechanism, comparison state, equipment and reading mode', async ({ page }) => {
  await ready(page)
  await page.getByRole('button', { name: 'Français', exact: true }).click()
  for (let chapter = 0; chapter < 12; chapter++) {
    const samples = chapter === 6 ? [.08,.25,.42,.59,.75,.92] : chapter === 8 ? [.08,.35,.62,.96] : chapter === 10 ? [.2,.55,.9] : chapter === 11 ? [.15,.4,.65,.9] : [.9]
    for (const local of samples) {
      await seek(page, chapter, local)
      await page.waitForTimeout(120)
      await page.locator('.chapter.active .field-note summary').click()
      await noEnglishLeaks(page)
      await page.locator('.chapter.active .field-note summary').click()
    }
  }
  await page.getByRole('button', { name: 'Lire le récit', exact: true }).click()
  await expect(page.locator('.process-reading article')).toHaveCount(6)
  await expect(page.locator('.comparison-reading article')).toHaveCount(4)
  await expect(page.locator('.ending-reading article')).toHaveCount(7)
  await expect(page.locator('.comparison-reading table')).toContainText('Composition des gaz')
  await noEnglishLeaks(page)
  await page.getByRole('button', { name: 'English', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Return to scene', exact: true })).toBeVisible()
  await expect(page.locator('.comparison-reading table')).toContainText('Gas chemistry')
})

test('French mobile header fits and all chapter layouts remain usable', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await ready(page)
  await page.getByRole('button', { name: 'Français', exact: true }).click()
  for (const chapter of [0,3,5,6,8,10,11]) {
    await seek(page, chapter)
    await expect(page.locator('.chapter.active h1')).toBeInViewport()
    await expect(page.getByRole('button', { name: 'Français', exact: true })).toBeInViewport()
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    await page.screenshot({ path: `test-results/fr-mobile-${chapter}.png` })
  }
  await page.setViewportSize({ width: 320, height: 740 })
  const boxes = await page.locator('.brand, .language-toggle, .index-button').evaluateAll(nodes => nodes.map(n => {
    const b = n.getBoundingClientRect(); return { left: b.left, right: b.right }
  }))
  expect(boxes[0].right).toBeLessThanOrEqual(boxes[1].left)
  expect(boxes[1].right).toBeLessThanOrEqual(boxes[2].left)
  expect(boxes[2].right).toBeLessThanOrEqual(320)
  await page.getByRole('button', { name: 'Chapitres' }).click()
  await expect(page.getByRole('navigation', { name: 'Sommaire des chapitres' }).getByRole('link')).toHaveCount(12)
})

test('French remains available when WebGL and storage are unavailable', async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext
    HTMLCanvasElement.prototype.getContext = function(this: HTMLCanvasElement, type: string, ...args: unknown[]) {
      if (type.startsWith('webgl')) return null
      return original.apply(this, [type, ...args] as Parameters<typeof original>)
    } as typeof original
    Storage.prototype.getItem = () => { throw new Error('Storage disabled') }
    Storage.prototype.setItem = () => { throw new Error('Storage disabled') }
  })
  await page.goto('/stories/aluminum')
  await page.getByRole('button', { name: 'Français', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Réessayer la 3D' })).toBeVisible()
  await expect(page.locator('.section-diagram')).toContainText('Caisson garni')
  await page.getByRole('button', { name: 'Lire le récit', exact: true }).click()
  await expect(page.locator('#casting h1')).toHaveText('Un grain devient un monde de possibles.')
  await noEnglishLeaks(page)
})
