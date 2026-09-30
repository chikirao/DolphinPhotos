// Photos are plain files in src/photos. At build time vite-imagetools makes a
// webp thumbnail and a large webp for the viewer; the untouched original is
// kept for downloads.

interface ImageMeta {
  src: string
  width: number
  height: number
}

export interface Photo {
  id: string
  /** Original filename, used for downloads. */
  name: string
  thumb: ImageMeta
  full: ImageMeta
  /** URL of the untouched original file. */
  original: string
}

const thumbs = import.meta.glob<ImageMeta>('../photos/*.{jpg,jpeg,png,webp,avif}', {
  eager: true,
  import: 'default',
  query: { w: '720', format: 'webp', quality: '80', as: 'metadata' },
})

const fulls = import.meta.glob<ImageMeta>('../photos/*.{jpg,jpeg,png,webp,avif}', {
  eager: true,
  import: 'default',
  query: { w: '2560', withoutEnlargement: '', format: 'webp', quality: '88', as: 'metadata' },
})

const originals = import.meta.glob<string>('../photos/*.{jpg,jpeg,png,webp,avif}', {
  eager: true,
  import: 'default',
  query: '?url',
})

const collator = new Intl.Collator(undefined, { numeric: true })

export const photos: Photo[] = Object.keys(thumbs)
  .sort(collator.compare)
  .map((path) => {
    const name = path.split('/').pop()!
    return {
      id: name,
      name,
      thumb: thumbs[path],
      full: fulls[path],
      original: originals[path],
    }
  })
