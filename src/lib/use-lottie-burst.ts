import lottie, { type AnimationItem } from 'lottie-web/build/player/lottie_light'
import { useCallback, useEffect, useRef, useState, type CSSProperties, type MouseEvent } from 'react'

interface BurstOptions {
  data: unknown
  /** Rendered size of the (square) Lottie comp, px. */
  size: number
  /** Where the burst starts inside the comp, in comp units (Telegram comps are 512×512). */
  origin: [number, number]
  /** Frame range to play; defaults to the whole comp. */
  segment?: [number, number]
  /** Rebuild the animation from `data` on every play (e.g. random trajectories). */
  randomize?: (data: unknown) => unknown
}

/** One-shot Lottie burst that starts at the pointer. Put `ref` + `style` on an
 *  absolutely positioned div inside a `relative` anchor, and call `play(e)`
 *  from that anchor's click handler. Taps while it runs are ignored. */
export function useLottieBurst({ data, size, origin, segment, randomize }: BurstOptions) {
  const ref = useRef<HTMLDivElement>(null)
  const anim = useRef<AnimationItem | null>(null)
  const [playing, setPlaying] = useState(false)
  const [at, setAt] = useState({ x: 0, y: 0 })

  const load = useCallback((animationData: unknown, autoplay: boolean) => {
    const el = ref.current!
    anim.current?.destroy()
    const a = lottie.loadAnimation({ container: el, renderer: 'svg', loop: false, autoplay, animationData })
    // Drops fly past the comp bounds by design — don't clip them.
    a.addEventListener('DOMLoaded', () => {
      const svg = el.querySelector('svg')
      svg?.style.setProperty('overflow', 'visible')
      svg?.querySelector(':scope > g[clip-path]')?.removeAttribute('clip-path')
    })
    a.addEventListener('complete', () => setPlaying(false))
    anim.current = a
    return a
  }, [])

  useEffect(() => {
    if (!randomize) load(data, false)
    return () => {
      anim.current?.destroy()
      anim.current = null
    }
  }, [data, randomize, load])

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
      if (randomize) load(randomize(data), true)
      else if (segment) anim.current?.playSegments(segment, true)
      else anim.current?.goToAndPlay(0, true)
      return true
    },
    [playing, segment, randomize, data, load],
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
