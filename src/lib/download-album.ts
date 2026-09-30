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

