import type { AnimationItem, LottiePlayer } from 'lottie-web'
import { useCallback, useEffect, useRef, useState, type CSSProperties, type MouseEvent } from 'react'
import { ensure, useAsset, type AssetKey } from '@/lib/assets'

interface BurstOptions {
  /** Which Lottie to play (see lib/assets). */
  asset: AssetKey
  /** Rendered size of the (square) Lottie comp, px. */
  size: number
  /** Where the burst starts inside the comp, in comp units (Telegram comps are 512×512). */
  origin: [number, number]
  /** Rebuild the animation from the asset on every play (e.g. random trajectories). */
  randomize?: (data: unknown) => unknown
}

/** Mounts `animationData` into `el` with the comp's clipping removed — the
 *  drops fly past the comp bounds by design. */
export function mountLottie(lottie: LottiePlayer, el: HTMLElement, animationData: unknown, autoplay: boolean) {
  const a = lottie.loadAnimation({ container: el, renderer: 'svg', loop: false, autoplay, animationData })
  a.addEventListener('DOMLoaded', () => {
    const svg = el.querySelector('svg')
    svg?.style.setProperty('overflow', 'visible')
    svg?.querySelector(':scope > g[clip-path]')?.removeAttribute('clip-path')
  })
  return a
}

/** One-shot Lottie burst that starts at the pointer. Put `ref` + `style` on an
 *  absolutely positioned div inside a `relative` anchor, and call `play(e)`
 *  from that anchor's click handler. Taps while it runs are ignored. */
export function useLottieBurst({ asset, size, origin, randomize }: BurstOptions) {
  const ref = useRef<HTMLDivElement>(null)
  const anim = useRef<AnimationItem | null>(null)
  const [playing, setPlaying] = useState(false)
  const [at, setAt] = useState({ x: 0, y: 0 })
  const lottie = useAsset('lottie')
  const data = useAsset(asset)

  const load = useCallback((player: LottiePlayer, animationData: unknown, autoplay: boolean) => {
    anim.current?.destroy()
    const a = mountLottie(player, ref.current!, animationData, autoplay)
    a.addEventListener('complete', () => setPlaying(false))
    anim.current = a
    return a
  }, [])

  // Fixed bursts are mounted ahead of time, as soon as their data arrives.
  useEffect(() => {
    if (!randomize && lottie && data) load(lottie, data, false)
    return () => {
      anim.current?.destroy()
      anim.current = null
    }
  }, [lottie, data, randomize, load])

  const play = useCallback(
    (e: MouseEvent<HTMLElement>) => {
      if (playing) return false
      const box = e.currentTarget.getBoundingClientRect()
      // Keyboard "clicks" have no pointer position — burst from the center.
      const fromPointer = e.detail > 0
      setAt({
        x: fromPointer ? e.clientX - box.left : box.width / 2,
        y: fromPointer ? e.clientY - box.top : box.height / 2,
      })
      setPlaying(true)
      Promise.all([ensure('lottie'), ensure(asset)]).then(([player, d]) => {
        if (randomize) load(player, randomize(d), true)
        else if (anim.current) anim.current.goToAndPlay(0, true)
        else load(player, d, true)
      })
      return true
    },
    [playing, asset, randomize, load],
  )

  const k = size / 512
  const style: CSSProperties = {
    position: 'absolute',
    pointerEvents: 'none',
    width: size,
    height: size,
    left: at.x - origin[0] * k,
    top: at.y - origin[1] * k,
    visibility: playing ? 'visible' : 'hidden',
  }

  return { ref, style, play, playing }
}
