export interface LayoutItem {
  emphasis: 'normal' | 'feature' | 'wide'
}

export interface TilePlacement {
  column: number
  row: number
  columns: number
  rows: number
}

/** Pack left to right without changing reading/viewer order. If an accent
 * doesn't fit, shrink it instead of leaving a hole or moving later photos
 * ahead of it. Works at every zoom and column count. */
export function layoutPhotos(items: readonly LayoutItem[], columns: number): TilePlacement[] {
  if (!Number.isInteger(columns) || columns < 1) throw new Error('Invalid column count')
  const occupied: boolean[][] = []
  let cursor = 0
  const free = (row: number, col: number) => !occupied[row]?.[col]
  return items.map((item) => {
    while (!free(Math.floor(cursor / columns), cursor % columns)) cursor++
    const row = Math.floor(cursor / columns)
    const column = cursor % columns
    const desired = item.emphasis === 'wide' && columns >= 4 ? 3 : item.emphasis !== 'normal' ? 2 : 1
    let span = Math.min(desired, columns - column)
    const fits = (w: number, h: number) => {
      for (let y = row; y < row + h; y++) {
        for (let x = column; x < column + w; x++) if (!free(y, x)) return false
      }
      return true
    }
    while (span > 1 && !fits(span, 2)) span--
    const rows = span > 1 ? 2 : 1
    for (let y = row; y < row + rows; y++) {
      occupied[y] ??= []
      for (let x = column; x < column + span; x++) occupied[y][x] = true
    }
    cursor++
    return { row, column, columns: span, rows }
  })
}
