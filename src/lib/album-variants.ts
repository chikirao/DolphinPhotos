export const LAYOUT_VARIANTS = ['original', 'editorial', 'mixtape', 'objects'] as const
export type AlbumVariant = typeof LAYOUT_VARIANTS[number]
interface VariantItem {
  id: string
  group: string
  kind: 'image' | 'video'
  emphasis: 'normal' | 'feature' | 'wide'
}

export function readAlbumVariant(search: string): AlbumVariant {
  const value = new URLSearchParams(search).get('layout')
  return LAYOUT_VARIANTS.find((variant) => variant === value) ?? 'mixtape'
}

const image = (n: number) => `drop-img_${n}.webp`
const clip = (n: number) => `clip-img_${n}.mp4`

// Deliberate opening spreads. Every variant retains the whole album exactly
// once; no randomness, so a shared URL always opens the same edit.
const OPENINGS = {
  editorial: [image(5579), image(8915), image(4873), image(4882), image(4776),
    image(4020), image(4954), image(4921), image(4969), image(5580), image(5042)],
  mixtape: [image(4776), 'drop-reference-04.webp', clip(5792), image(4921),
    'demo-02.jpg', image(4873), image(5750), 'drop-reference-07.webp', image(4954),
    clip(5812), image(5579), image(4882)],
  objects: [clip(5792), image(5733), image(4921), image(5723), image(5739),
    image(4776), clip(5812), image(5769), image(4882), image(5750), image(4873),
    image(6130), image(6170), image(4020)],
} as const

const HEROES = {
  editorial: new Set([5579, 4776, 5580, 5042, 8709, 8824, 8831, 8848, 8922, 8969].map(image)),
  mixtape: new Set([4776, 4954, 5065, 8735, 8795, 8866, 8905, 8948].map(image)),
  objects: new Set([5750, 4882, 4767, 6415, 8735, 8866, 8915].map(image)),
}

export function arrangeAlbum<T extends VariantItem>(source: readonly T[], variant: AlbumVariant): T[] {
  if (variant === 'original') return [...source]
  const remaining = new Map(source.map((photo) => [photo.id, photo]))
  const result: T[] = []
  const take = (id: string) => {
    const photo = remaining.get(id)
    if (photo) { result.push(photo); remaining.delete(id) }
  }
  for (const id of OPENINGS[variant]) take(id)
  const rest = [...remaining.values()]
  const references = rest.filter((p) => p.group === 'Dolphin references')
  const water = rest.filter((p) => p.group === 'Water' || p.group === 'Water studies')
  const objects = rest.filter((p) => p.group === 'Making Dolphin' || p.group === 'Dolphin bags in motion')
  const looks = rest.filter((p) => !references.includes(p) && !water.includes(p) && !objects.includes(p))
  const queues = variant === 'objects' ? [objects, looks, references, water]
    : variant === 'mixtape' ? [looks, references, objects, water] : [looks, objects, water, references]
  // Journal: a run of looks followed by a quieter insert. Mixtape: much
  // shorter cuts. Objects: product / worn look / reference / water.
  const counts = variant === 'editorial' ? [5, 1, 1, 1]
    : variant === 'mixtape' ? [2, 1, 1, 1] : [2, 2, 1, 1]
  const blocks = queues.map((queue, index) => {
    const chunks: T[][] = []
    for (let i = 0; i < queue.length; i += counts[index]) chunks.push(queue.slice(i, i + counts[index]))
    return chunks
  })
  const consumed = blocks.map(() => 0)
  while (blocks.some((queue, i) => consumed[i] < queue.length)) {
    // Spread inserts over the whole edit, even when one category has many
    // more photos. Avoid exhausting the looks and leaving a tail of water.
    let next = -1
    let progress = Infinity
    blocks.forEach((queue, i) => {
      const at = (consumed[i] + 0.5) / queue.length
      if (consumed[i] < queue.length && at < progress) { next = i; progress = at }
    })
    for (const photo of blocks[next][consumed[next]++]) take(photo.id)
  }
  return result.map((photo) => ({
    ...photo,
    emphasis: HEROES[variant].has(photo.id) ? 'feature'
      : photo.kind === 'video' ? (variant === 'editorial' ? 'normal' : 'wide')
      : variant === 'mixtape' && ['drop-reference-04.webp', 'drop-reference-02.webp'].includes(photo.id) ? 'wide'
      : variant === 'objects' && photo.id === image(4020) ? 'wide' : 'normal',
  }))
}
