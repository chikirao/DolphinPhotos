import type { AnimationItem } from 'lottie-web'
import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import dolphinStill from '@/assets/dolphin-still.webp'
import { useAsset } from '@/lib/assets'
import { splashRain } from '@/lib/splash-rain'
import { spring } from '@/lib/springs'
import { useLottieBurst } from '@/lib/use-lottie-burst'

/** Taps this close together count toward the splash-rain easter egg. */
const RAIN_TAPS = 5
const RAIN_WINDOW_MS = 2000

/** Album tile with the Telegram dolphin: frozen on frame 0, a tap plays it
 *  once and throws a splash from the tap point; taps are ignored until the
 *  dolphin finishes. Five quick taps make it rain drops over the whole page.
 *  A still of frame 0 stands in until the Lottie player has loaded. */
export function DolphinTile() {
  const dolphinRef = useRef<HTMLDivElement>(null)
  const dolphin = useRef<AnimationItem | null>(null)
  const [ready, setReady] = useState(false)
  const [playing, setPlaying] = useState(false)
  const taps = useRef<number[]>([])
  // The splash comp erupts from ~(385, 215), right of its center.
  const splash = useLottieBurst({ asset: 'splash', size: 192, origin: [385, 215] })
  const lottie = useAsset('lottie')
  const data = useAsset('dolphin')

  useEffect(() => {
    if (!lottie || !data) return
    const d = lottie.loadAnimation({
      container: dolphinRef.current!,
      renderer: 'svg',
      loop: false,
      autoplay: false,
      animationData: data,
    })
    d.addEventListener('DOMLoaded', () => {
      d.goToAndStop(0, true)
      setReady(true)
    })
    d.addEventListener('complete', () => {
      d.goToAndStop(0, true)
      setPlaying(false)
    })
    dolphin.current = d
    return () => d.destroy()
  }, [lottie, data])

  return (
    <div className="relative mb-2.5">
      <motion.button
        type="button"
        aria-label="Play dolphin"
        onClick={(e) => {
          const now = performance.now()
          taps.current = [...taps.current.filter((t) => now - t < RAIN_WINDOW_MS), now]
          if (taps.current.length >= RAIN_TAPS) {
            taps.current = []
            splashRain()
          }
          if (playing || !ready) return
          setPlaying(true)
          dolphin.current?.goToAndPlay(0, true)
          splash.play(e)
        }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={spring.slow}
        className="relative flex size-16 items-center justify-center rounded-[14.08px] bg-gradient-to-b from-white to-[#f2f2f2] shadow-[0_4px_16px_rgba(0,0,0,0.03),0_2px_8.7px_rgba(0,0,0,0.15)]"
        style={{ cursor: playing ? 'default' : 'pointer' }}
      >
        <div ref={dolphinRef} className="size-12" />
        {!ready && <img src={dolphinStill} alt="" draggable={false} className="absolute size-12" />}
        <div ref={splash.ref} aria-hidden className="z-10" style={splash.style} />
      </motion.button>
    </div>
  )
}
