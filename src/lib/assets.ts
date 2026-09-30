import type { LottiePlayer } from 'lottie-web'
import { useEffect, useState } from 'react'
import dolphinUrl from '@/assets/lottie/dolphin.json?url'
import downloadSplashUrl from '@/assets/lottie/download-splash.json?url'
import logoSplashUrl from '@/assets/lottie/logo-splash.json?url'
import splashUrl from '@/assets/lottie/splash.json?url'
import spoutUrl from '@/assets/lottie/whale-spout.json?url'
import whaleUrl from '@/assets/lottie/whale.json?url'

// The Lottie player and animations are ~2 MB, so they stay out of the first
// load. Once the page and its images are in, they stream in one at a time, in
// the order a visitor meets them going down the page. Tapping something that
// isn't loaded yet pulls it to the front of the line.

const json = (url: string) => () => fetch(url).then((r) => r.json() as Promise<unknown>)

const loaders = {
  lottie: () => import('lottie-web/build/player/lottie_light').then((m) => m.default as LottiePlayer),
  logoSplash: json(logoSplashUrl),
  dolphin: json(dolphinUrl),
  splash: json(splashUrl),
  downloadSplash: json(downloadSplashUrl),
  whale: json(whaleUrl),
  spout: json(spoutUrl),
}

export type AssetKey = keyof typeof loaders
type AssetValue<K extends AssetKey> = Awaited<ReturnType<(typeof loaders)[K]>>

/** Top-to-bottom: header spray, hero dolphin, Download Album, footer whale. */
const ORDER: AssetKey[] = ['lottie', 'logoSplash', 'dolphin', 'splash', 'downloadSplash', 'whale', 'spout']

const values = new Map<AssetKey, unknown>()
const pending = new Map<AssetKey, Promise<unknown>>()
const listeners = new Set<() => void>()

/** Loads an asset now (or returns the one already loading). */
export function ensure<K extends AssetKey>(key: K): Promise<AssetValue<K>> {
  let p = pending.get(key)
  if (!p) {
    p = loaders[key]().then((v) => {
      values.set(key, v)
      listeners.forEach((l) => l())
      return v
    })
    pending.set(key, p)
  }
  return p as Promise<AssetValue<K>>
}

/** The asset once it has loaded; undefined until then. */
export function useAsset<K extends AssetKey>(key: K): AssetValue<K> | undefined {
  const [, bump] = useState(0)
  useEffect(() => {
    const l = () => bump((n) => n + 1)
    listeners.add(l)
    return () => {
      listeners.delete(l)
    }
  }, [])
  return values.get(key) as AssetValue<K> | undefined
}

async function preloadInOrder() {
  for (const key of ORDER) await ensure(key).catch(() => {})
}

if (typeof window !== 'undefined') {
  if (document.readyState === 'complete') preloadInOrder()
  else window.addEventListener('load', () => preloadInOrder(), { once: true })
}
