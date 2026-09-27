import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test('library loads without story code, WebGL or model requests', async ({ page }) => {
  const requests: string[] = []
  page.on('request', request => requests.push(request.url()))
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('There’s a storyinside everything.')
  await expect(page.locator('.story-card')).toHaveCount(2)
  for (const image of await page.locator('.story-cover img').all()) {
    await expect(image).toBeVisible()
    expect(await image.evaluate(element => (element as HTMLImageElement).naturalWidth)).toBeGreaterThan(0)
  }
  await expect(page.locator('canvas')).toHaveCount(0)
  expect(requests.filter(url => /\.glb|\/src\/stories\/|three.*\.js|AluminumStory.*\.js|GraphicsCardStory.*\.js/.test(url))).toEqual([])
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
})

test('enter, return, back, forward and refresh retain the correct route and story position', async ({ page }) => {
  await page.goto('/')
  await page.locator('.story-card').filter({ hasText: 'Inside the Cell' }).getByRole('link', { name: 'Enter the story', exact: true }).click()
  await expect(page).toHaveURL(/\/stories\/aluminum$/)
  await page.getByRole('button', { name: 'Next chapter' }).click()
  await expect(page.locator('.chapter.active')).toHaveAttribute('id', 'reveal')
  await page.reload()
  await expect(page.locator('.chapter.active')).toHaveAttribute('id', 'reveal')
  await page.getByRole('button', { name: 'Next chapter' }).click()
  await expect(page.locator('.chapter.active')).toHaveAttribute('id', 'assemblies')
  await page.getByRole('link', { name: 'All stories', exact: true }).click()
  await expect(page).toHaveURL(/\/$/)
  await expect(page.locator('canvas')).toHaveCount(0)
  await expect(page).toHaveTitle('Story Narrative — A closer look')
  await page.goBack()
  await expect(page.locator('.chapter.active')).toHaveAttribute('id', 'assemblies')
  await page.goForward()
  await expect(page.locator('#home-title')).toBeVisible()
})

test('legacy links keep chapter fragments and direct routes support trailing slashes', async ({ page }) => {
  await page.goto('/?debug#anatomy')
  await expect(page).toHaveURL(/\/stories\/aluminum\?debug#anatomy$/)
  await expect(page.locator('.chapter.active')).toHaveAttribute('id', 'anatomy')
  await page.goto('/stories/aluminum/#casting')
  await expect(page.locator('.chapter.active')).toHaveAttribute('id', 'casting')
  await page.goto('/#stories')
  await expect(page.locator('#collection-title')).toBeInViewport()
})

test('French persists across the library and story and fits narrow screens', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 })
  await page.goto('/')
  await page.getByRole('button', { name: 'Français', exact: true }).click()
  await expect(page.locator('html')).toHaveAttribute('lang', 'fr')
  await expect(page).toHaveTitle('Story Narrative — Voir de plus près')
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.locator('.story-card').filter({ hasText: 'Au cœur de la cuve' }).getByRole('link', { name: 'Entrer dans le récit', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Chapitres' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Tous les récits', exact: true })).toBeInViewport()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.getByRole('link', { name: 'Tous les récits', exact: true }).click()
  await expect(page.locator('#home-title')).toHaveText('Chaque chosea son histoire.')
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
})

test('unknown stories offer a working way back to the collection', async ({ page }) => {
  await page.goto('/stories/missing')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('This story isn’t here.')
  await page.getByRole('link', { name: 'All stories', exact: false }).click()
  await expect(page.locator('#home-title')).toBeVisible()
})

test('a failed story module offers retry and a working library link', async ({ page }) => {
  await page.route('**/AluminumStory.tsx*', route => route.abort())
  await page.goto('/stories/aluminum')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('The story could not open.')
  await page.unroute('**/AluminumStory.tsx*')
  await page.getByRole('button', { name: 'Try again' }).click()
  await expect(page.locator('#grain h1')).toBeVisible()
})
