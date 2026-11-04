import sequence from '@/photos/album.json'

interface ImageMeta {
  src: string
  width: number
  height: number
}

export interface Photo {
  id: string
  name: string
  kind: 'image' | 'video'
  alt: string
  group: string
  emphasis: 'normal' | 'feature' | 'wide'
  preview: ImageMeta
  thumb: ImageMeta
  full: ImageMeta
  original: string
  video?: string
}

// Three levels: small grid tiles, larger accents/retina, then the viewer.
// Metadata imports create URLs; the browser only fetches visible media.
const previews = import.meta.glob<ImageMeta>(['../photos/*.{jpg,jpeg,png,webp,avif}', '../videos/*.webp'], {
  eager: true, import: 'default',
  query: { w: '360', withoutEnlargement: '', format: 'webp', quality: '72', as: 'metadata' },
})
const thumbs = import.meta.glob<ImageMeta>(['../photos/*.{jpg,jpeg,png,webp,avif}', '../videos/*.webp'], {
  eager: true, import: 'default',
  query: { w: '960', withoutEnlargement: '', format: 'webp', quality: '78', as: 'metadata' },
})
const fulls = import.meta.glob<ImageMeta>(['../photos/*.{jpg,jpeg,png,webp,avif}', '!../photos/drop-*.webp'], {
  eager: true, import: 'default',
  query: { w: '2560', withoutEnlargement: '', format: 'webp', quality: '86', as: 'metadata' },
})
const originals = import.meta.glob<string>(['../photos/*.{jpg,jpeg,png,webp,avif}', '../videos/*.mp4'], {
  eager: true, import: 'default', query: '?url',
})
type AlbumEntry = Pick<Photo, 'alt' | 'group' | 'emphasis'> & { file: string; width?: number; height?: number }
const byName = new Map((sequence as AlbumEntry[]).map((entry, index) => [entry.file, { ...entry, index }]))
const collator = new Intl.Collator(undefined, { numeric: true })

export const photos: Photo[] = Object.keys(previews).map((path) => {
  const poster = path.split('/').pop()!
  const kind = path.includes('/videos/') ? 'video' : 'image'
  const name = kind === 'video' ? poster.replace(/\.webp$/, '.mp4') : poster
  const entry = byName.get(name)
  const original = originals[kind === 'video' ? path.replace(/\.webp$/, '.mp4') : path]
  return {
    id: name, name, kind,
    alt: entry?.alt ?? name,
    group: entry?.group ?? '',
    emphasis: (entry?.emphasis ?? 'normal') as Photo['emphasis'],
    preview: previews[path], thumb: thumbs[path],
    full: fulls[path] ?? (kind === 'video' ? thumbs[path] : {
      src: original,
      width: entry?.width ?? thumbs[path].width,
      height: entry?.height ?? thumbs[path].height,
    }), original,
    video: kind === 'video' ? original : undefined,
  } satisfies Photo
}).sort((a, b) => (byName.get(a.name)?.index ?? Infinity) - (byName.get(b.name)?.index ?? Infinity)
  || collator.compare(a.name, b.name))
