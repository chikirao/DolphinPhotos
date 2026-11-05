import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { arrangeAlbum, readAlbumVariant, LAYOUT_VARIANTS } from '../src/lib/album-variants.ts'
import { layoutPhotos } from '../src/lib/photo-layout.ts'

const source = JSON.parse(readFileSync(new URL('../src/photos/album.json', import.meta.url), 'utf8'))
  .map((p: { file: string }) => ({ ...p, id: p.file, kind: p.file.endsWith('.mp4') ? 'video' : 'image' }))

test('query selects only known variants and safely falls back', () => {
  for (const v of LAYOUT_VARIANTS) assert.equal(readAlbumVariant(`?layout=${v}`), v)
  assert.equal(readAlbumVariant('?layout=unknown'), 'mixtape')
  assert.equal(readAlbumVariant(''), 'mixtape')
  assert.equal(readAlbumVariant('?other=1&layout=mixtape'), 'mixtape')
})

test('edits are deterministic permutations, preserve canonical IDs and never mutate source', () => {
  const before = JSON.stringify(source)
  const ids = source.map((p: { id: string }) => p.id).sort()
  const orders = new Set()
  for (const variant of LAYOUT_VARIANTS) {
    const result = arrangeAlbum(source, variant)
    assert.deepEqual(result.map((p) => p.id).sort(), ids)
    assert.equal(new Set(result.map((p) => p.id)).size, source.length)
    assert.deepEqual(result, arrangeAlbum(source, variant))
    assert.equal(result.filter((p) => p.kind === 'video').length, 6)
    orders.add(result.map((p) => p.id).join(','))
    // Each canonical #N still resolves after a layout change or reverse sort.
    for (const p of source) assert.ok([...result].reverse().findIndex((item) => item.id === p.id) >= 0)
    for (let columns = 2; columns <= 16; columns++) {
      const occupied = new Set<string>()
      let lastRow = 0
      for (const tile of layoutPhotos(result, columns)) {
        lastRow = Math.max(lastRow, tile.row + tile.rows - 1)
        assert.ok(tile.column + tile.columns <= columns)
        for (let y = tile.row; y < tile.row + tile.rows; y++) {
          for (let x = tile.column; x < tile.column + tile.columns; x++) {
            const key = `${x},${y}`
            assert.ok(!occupied.has(key))
            occupied.add(key)
          }
        }
      }
      for (let y = 0; y < lastRow - 1; y++) {
        for (let x = 0; x < columns; x++) assert.ok(occupied.has(`${x},${y}`), 'Interior gap')
      }
    }
  }
  assert.equal(orders.size, 4)
  assert.equal(JSON.stringify(source), before)
  assert.deepEqual(arrangeAlbum(source, 'original'), source)
})
