/* global window */
import { chromium } from '@playwright/test'
import assert from 'node:assert/strict'
import process from 'node:process'
import fs from 'node:fs/promises'

const baseURL = process.env.APP_URL ?? 'http://127.0.0.1:4186'
const browser = await chromium.launch()
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
  const errors = []
  const requests = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('request', request => requests.push(request.url()))
  await page.goto(baseURL)
  await page.locator('#home-title').waitFor()
  assert.equal(await page.locator('canvas').count(), 0)
  assert.deepEqual(requests.filter(url => /\.glb|\/(three|AluminumStory|Experience|GraphicsCardStory|GraphicsScene)-[^/]+\.js/.test(url)), [])
  assert.equal(await page.locator('.story-card').count(), 2)
  await fs.mkdir('test-results', { recursive: true })
  await page.screenshot({ path: 'test-results/production-library.png', fullPage: true })
  await page.locator('.story-card').filter({ hasText: 'Inside the Cell' }).getByRole('link', { name: 'Enter the story', exact: true }).click()
  await page.locator('canvas').waitFor({ state: 'visible' })
  await page.waitForTimeout(600)
  assert.equal(await page.locator('canvas').count(), 1)
  assert.equal(await page.evaluate(() => typeof window.__CELL_STORY__), 'undefined')
  await page.getByRole('button', { name: 'Next chapter' }).click()
  await page.locator('#reveal.active').waitFor()
  await page.getByRole('complementary', { name: 'Cell components' }).waitFor()
  assert.equal(await page.locator('.component-legend button').count(), 13)
  assert.equal(await page.evaluate(() => typeof window.__CELL_ASSET__), 'undefined')
  await page.screenshot({ path: 'test-results/production-reveal.png' })
  await page.reload()
  await page.locator('#reveal.active').waitFor()
  await page.getByRole('link', { name: 'All stories', exact: true }).click()
  await page.locator('#home-title').waitFor()
  assert.equal(await page.locator('canvas').count(), 0)
  await page.locator('.story-card').filter({ hasText: 'One Frame' }).getByRole('link', { name: 'Enter the story', exact: true }).click()
  await page.locator('.gpu-stage[data-status="ready"]').waitFor()
  await page.getByRole('button', { name: 'Open the card', exact: true }).click()
  await page.locator('.gpu-canvas[data-transition="settled"]').waitFor()
  await page.getByRole('button', { name: 'Find the processor', exact: true }).click()
  await page.locator('.gpu-canvas[data-transition="settled"]').waitFor()
  assert.equal(await page.locator('.gpu-story').getAttribute('data-beat'), 'compute')
  await page.screenshot({ path: 'test-results/production-graphics-card.png' })
  await page.reload()
  await page.locator('.gpu-stage[data-status="ready"]').waitFor()
  assert.equal(await page.locator('.gpu-story').getAttribute('data-beat'), 'compute')
  await page.getByRole('link', { name: 'All stories', exact: false }).click()
  await page.locator('#home-title').waitFor()
  assert.equal(await page.locator('canvas').count(), 0)
  assert.deepEqual(errors, [])
  process.stdout.write('Production smoke passed: lightweight library, both stories, rendered canvases, navigation, refresh restoration, return to library, no page errors or development globals.\n')
} finally { await browser.close() }
