import type { Photo } from './photos'

// A bounded working set, not an accumulating list of every decoded full image.
const cache = new Map<string, { ready: Promise<boolean>; release: () => void }>()
const LIMIT = 5

export function preloadPhoto(photo: Photo): Promise<boolean> {
  const existing = cache.get(photo.id)
  if (existing) {
    cache.delete(photo.id)
    cache.set(photo.id, existing)
    return existing.ready
  }
  const media = photo.kind === 'video' ? document.createElement('video') : new Image()
  let finish: (ok: boolean) => void
  const ready = new Promise<boolean>((resolve) => { finish = resolve })
  let settled = false
  const complete = (ok: boolean) => {
    if (settled) return
    settled = true
    clearTimeout(timeout)
    finish(ok)
  }
  const timeout = window.setTimeout(() => complete(false), 15_000)
  if (media instanceof HTMLVideoElement) {
    media.muted = true
    media.preload = 'auto'
    media.onloadeddata = () => complete(true)
    media.onerror = () => complete(false)
    media.src = photo.video!
    media.load()
  } else {
    media.decoding = 'async'
    media.onload = () => { media.decode().catch(() => {}).then(() => complete(true)) }
    media.onerror = () => complete(false)
    media.src = photo.full.src
  }
  cache.set(photo.id, { ready, release: () => {
    complete(false)
    media.removeAttribute('src')
    if (media instanceof HTMLVideoElement) { media.pause(); media.load() }
  } })
  while (cache.size > LIMIT) {
    const key = cache.keys().next().value!
    cache.get(key)!.release()
    cache.delete(key)
  }
  return ready
}

export function clearPhotoPreloads() {
  for (const entry of cache.values()) entry.release()
  cache.clear()
}
