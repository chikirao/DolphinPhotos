import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { test } from 'node:test'
import { layoutPhotos, type LayoutItem } from '../src/lib/photo-layout.ts'

const album = JSON.parse(readFileSync(new URL('../src/photos/album.json', import.meta.url), 'utf8'))

test('every curated asset exists once, including four silent loops', () => {
  assert.equal(album.length, 115)
  assert.equal(new Set(album.map((item: { file: string }) => item.file)).size, album.length)
  assert.equal(album.filter((item: { file: string }) => item.file.endsWith('.mp4')).length, 4)
  for (const item of album) {
    const video = item.file.endsWith('.mp4')
    assert.ok(existsSync(new URL(`../src/${video ? 'videos' : 'photos'}/${item.file}`, import.meta.url)), item.file)
  }
  for (const n of [13, 15, 23, 26, 28, 30]) {
    assert.ok(!existsSync(new URL(`../src/photos/demo-${n}.jpg`, import.meta.url)))
  }
})

test('the packaged shark appears once and game references are interleaved', () => {
  assert.equal(album.filter((item: { file: string }) => item.file === 'drop-reference-01.webp').length, 1)
  assert.ok(!album.some((item: { file: string }) => item.file === 'drop-reference-60.webp'))
  const positions = album.flatMap((item: { group: string; file: string }, i: number) =>
    item.group === 'Dolphin references' && item.file.startsWith('drop-reference-')
      && item.file !== 'drop-reference-01.webp' ? [i] : [])
  assert.equal(positions.length, 10)
  for (let i = 1; i < positions.length; i++) assert.ok(positions[i] - positions[i - 1] >= 3)
})

test('all repeated photoshoot sequences contain at most three selected frames', () => {
  const bursts = ['Yellow pipes', 'Walking together', 'Silver bag', 'Mint hood',
    'Silver look', 'Blue ground', 'On the steps', 'Portrait / mint', 'Portrait / silver',
    'Ocean dress', 'Ocean dress / movement', 'Back in the street', 'Ocean hood']
  for (const group of bursts) {
    assert.ok(album.filter((item: { group: string }) => item.group === group).length <= 3, group)
  }
  for (const groups of [
    ['The courtyard / mint hood', 'The courtyard / collected objects'],
    ['The blue ocean / silver', 'The blue ocean / details'],
    ['The blue ocean / together', 'The blue ocean / overhead'],
  ]) {
    assert.ok(album.filter((item: { group: string }) => groups.includes(item.group)).length <= 3)
  }
})

test('all responsive column counts preserve order without overlaps or interior holes', () => {
  for (let columns = 1; columns <= 16; columns++) {
    for (const items of [album, [...album].reverse(), Array.from({ length: 150 }, (_, i) => ({
      emphasis: ['feature', 'wide', 'normal'][i % 3],
    }))] as LayoutItem[][]) {
      const tiles = layoutPhotos(items, columns)
      const occupied = new Set<string>()
      let previous = -1
      let maxRow = 0
      for (const tile of tiles) {
        assert.ok(tile.column + tile.columns <= columns)
        const position = tile.row * columns + tile.column
        assert.ok(position > previous, 'Reading order must match viewer order')
        previous = position
        maxRow = Math.max(maxRow, tile.row + tile.rows - 1)
        for (let row = tile.row; row < tile.row + tile.rows; row++) {
          for (let col = tile.column; col < tile.column + tile.columns; col++) {
            const key = `${row},${col}`
            assert.ok(!occupied.has(key), `Overlap at ${key}, columns=${columns}`)
            occupied.add(key)
          }
        }
      }
      for (let row = 0; row < maxRow - 1; row++) {
        for (let col = 0; col < columns; col++) assert.ok(occupied.has(`${row},${col}`), 'Interior gap')
      }
    }
  }
})
