import type { LottiePlayer } from 'lottie-web'
import { useEffect, useRef } from 'react'
import { ensure } from '@/lib/assets'
import { FAN_LEFT, FAN_RIGHT, randomSplash } from '@/lib/splash'
import { splashRain } from '@/lib/splash-rain'
import { mountLottie } from '@/lib/use-lottie-burst'

const DROPS_ORIGIN: [number, number] = [256, 256]
const FOUNTAIN_ORIGIN: [number, number] = [256, 380]
/** Sprays over the page, spread across this many ms. */
const SPRAYS = 12
const SPREAD_MS = 1400
/** Shake detection: jolts this strong (m/s², summed over axes), this many
 *  times within the window, then a pause before the next shake counts. */
const JOLT = 28
const JOLTS = 3
const SHAKE_WINDOW_MS = 1000
const COOLDOWN_MS = 2500

const rand = (min: number, max: number) => min + Math.random() * (max - min)

/** Full-screen splash: drops burst all over the page and two fountains rise
 *  from the bottom edge. Triggered by five quick taps on the dolphin, or by
 *  shaking the phone. */
export function SplashRain() {
  const layer = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let busy = false
    const burst = (lottie: LottiePlayer, data: unknown, size: number, origin: [number, number], x: number, y: number) => {
      const el = document.createElement('div')
      const k = size / 512
      Object.assign(el.style, {
        position: 'absolute',
        width: `${size}px`,
        height: `${size}px`,
        left: `${x - origin[0] * k}px`,
        top: `${y - origin[1] * k}px`,
      })
      layer.current!.append(el)
      const a = mountLottie(lottie, el, data, true)
      a.addEventListener('complete', () => {
        a.destroy()
        el.remove()
      })
    }

    const run = async () => {
      if (busy) return
      busy = true
      const [lottie, drops, fountain] = await Promise.all([
        ensure('lottie'),
        ensure('logoSplash'),
        ensure('downloadSplash'),
      ])
      const w = window.innerWidth
      const h = window.innerHeight
      const big = Math.min(w, h) * 0.9
      burst(lottie, fountain, big, FOUNTAIN_ORIGIN, w * 0.25, h + 20)
      setTimeout(() => burst(lottie, fountain, big, FOUNTAIN_ORIGIN, w * 0.75, h + 20), 250)
      for (let n = 0; n < SPRAYS; n++) {
        setTimeout(() => {
          const x = rand(0.05, 0.95) * w
          const fan = x < w / 2 ? FAN_LEFT : FAN_RIGHT
          burst(lottie, randomSplash(drops, DROPS_ORIGIN, fan), rand(260, 420), DROPS_ORIGIN, x, rand(0.05, 0.7) * h)
        }, (SPREAD_MS * n) / SPRAYS + rand(0, 80))
      }
      setTimeout(() => (busy = false), SPREAD_MS)
    }

    window.addEventListener('splash-rain', run)
    return () => window.removeEventListener('splash-rain', run)
  }, [])

  // Shake to splash. iOS only hands out motion events after the visitor
  // allows it, and only from a tap — so ask on the first tap anywhere.
  useEffect(() => {
    if (typeof DeviceMotionEvent === 'undefined') return
    let last: { x: number; y: number; z: number } | null = null
    let jolts: number[] = []
    let quietUntil = 0
    const onMotion = (e: DeviceMotionEvent) => {
      const a = e.accelerationIncludingGravity
      if (!a || a.x === null || a.y === null || a.z === null) return
      const now = performance.now()
      if (last && now > quietUntil) {
        const jolt = Math.abs(a.x - last.x) + Math.abs(a.y - last.y) + Math.abs(a.z - last.z)
        if (jolt > JOLT) {
          jolts = [...jolts.filter((t) => now - t < SHAKE_WINDOW_MS), now]
          if (jolts.length >= JOLTS) {
            jolts = []
            quietUntil = now + COOLDOWN_MS
            splashRain()
          }
        }
      }
      last = { x: a.x, y: a.y, z: a.z }
    }
    const listen = () => window.addEventListener('devicemotion', onMotion)
    const needsPermission = (DeviceMotionEvent as unknown as { requestPermission?: () => Promise<string> })
      .requestPermission
    const ask = () => {
      needsPermission!()
        .then((state) => state === 'granted' && listen())
        .catch(() => {})
    }
    if (needsPermission) window.addEventListener('click', ask, { once: true })
    else listen()
    return () => {
      window.removeEventListener('click', ask)
      window.removeEventListener('devicemotion', onMotion)
    }
  }, [])

  return <div ref={layer} aria-hidden className="pointer-events-none fixed inset-0 z-[60] overflow-hidden" />
}
