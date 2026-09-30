import { zip, type Zippable } from 'fflate'
import type { Photo } from '@/lib/photos'

function save(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 10_000)
}

export async function downloadPhoto(photo: Photo) {
  const res = await fetch(photo.original)
  save(await res.blob(), photo.name)
}

/** Fetches every original and saves them as one zip. JPEGs are already
 *  compressed, so entries are stored (level 0) — fast and just as small. */
export async function downloadAlbum(
  list: Photo[],
  filename: string,
) {
  const files: Zippable = {}
  await Promise.all(
    list.map(async (p) => {
      const res = await fetch(p.original)
      files[p.name] = [new Uint8Array(await res.arrayBuffer()), { level: 0 }]
    }),
  )
  const data = await new Promise<Uint8Array>((resolve, reject) =>
    zip(files, (err, out) => (err ? reject(err) : resolve(out))),
  )
  save(new Blob([data as BlobPart], { type: 'application/zip' }), filename)
}
