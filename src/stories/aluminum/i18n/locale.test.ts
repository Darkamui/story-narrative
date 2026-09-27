import { describe, expect, it } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'
import ts from 'typescript'
import { chapters } from '../data/content'
import { processBeats, currentSteps, operatingCaptions } from '../data/operating'
import { comparisonPhases, comparisonCopy } from '../data/anodeEffect'
import { tappingBeats, castingBeats, tappingParts, castingParts } from '../data/ending'
import { assemblies, partLabel } from '../data/assemblies'
import { anatomyStages, layerLabels } from '../data/anatomy'
import { sources } from '../data/sources'
import { journeyStops } from '../data/journey'
import { french, translate } from './locale'
import { frPartNames } from './frParts'

const prose = new Set(['label', 'eyebrow', 'title', 'body', 'detail', 'cue', 'name', 'purpose', 'carrier', 'note', 'normal', 'effect'])
describe('French coverage', () => {
  it('covers all narrative, inspector, diagram and reference copy', () => {
    const messages: string[] = []
    function collect(value: unknown, all = false) {
      if (typeof value === 'string') { messages.push(value); return }
      if (Array.isArray(value)) { value.forEach(item => collect(item, all)); return }
      if (value && typeof value === 'object') Object.entries(value).forEach(([key, item]) => {
        if (all || prose.has(key)) collect(item, all)
      })
    }
    ;[chapters, processBeats, currentSteps, comparisonPhases, tappingBeats, castingBeats, tappingParts, castingParts, assemblies, anatomyStages, layerLabels, Object.values(sources).map(s => ({ title: s.title }))].forEach(value => collect(value))
    collect(operatingCaptions, true)
    collect(comparisonCopy, true)
    collect(journeyStops.map(stop => stop.action))
    expect([...new Set(messages)].filter(message => !french[message])).toEqual([])
  })
  it('covers literal translation calls and preserves interpolation fields', () => {
    const missing: string[] = []
    for (const folder of ['app', 'ui', 'three']) for (const name of readdirSync(`src/stories/aluminum/${folder}`).filter(n => n.endsWith('.tsx'))) {
      const path = `src/stories/aluminum/${folder}/${name}`
      const source = ts.createSourceFile(path, readFileSync(path, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
      function visit(node: ts.Node) {
        if (ts.isCallExpression(node) && node.expression.getText(source) === 't') {
          const message = node.arguments[0]
          if (message && ts.isStringLiteral(message) && /[a-z]/i.test(message.text) && !['Al', 'CO₂', 'spec.py'].includes(message.text) && !french[message.text]) missing.push(message.text)
        }
        ts.forEachChild(node, visit)
      }
      visit(source)
    }
    expect(missing).toEqual([])
    for (const [english, frenchText] of Object.entries(french)) expect(frenchText.match(/\{\w+\}/g)?.sort() ?? []).toEqual(english.match(/\{\w+\}/g)?.sort() ?? [])
    expect(translate('Whole assembly · {count} parts', 'fr', { count: 36 })).toBe('Ensemble complet · 36 pièces')
  })
  it('names every real selectable model part in French without changing node identity', () => {
    const buffer = readFileSync('public/assets/cell.glb')
    const gltf = JSON.parse(buffer.subarray(20, 20 + buffer.readUInt32LE(12)).toString()) as { nodes: { name: string; mesh?: number }[] }
    for (const node of gltf.nodes.filter(n => n.mesh !== undefined)) {
      const match = node.name.match(/^\d+_[A-Z_]+_([a-z_]+)_(\d+)$/)
      if (!match) continue
      expect(frPartNames, node.name).toHaveProperty(match[1])
      expect(partLabel(node.name, 'fr')).toBe(`${frPartNames[match[1]]} ${Number(match[2]) + 1}`)
    }
    expect(partLabel('05_ANODES_block_008', 'en')).toBe('Block 9')
  })
})
