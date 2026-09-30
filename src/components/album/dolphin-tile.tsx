import lottie, { type AnimationItem } from 'lottie-web/build/player/lottie_light'
import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import dolphinData from '@/assets/lottie/dolphin.json'
import splashData from '@/assets/lottie/splash.json'
import { spring } from '@/lib/springs'

/** Album tile with the Telegram dolphin: frozen on frame 0, a tap plays it
 *  once (with the splash burst) and taps are ignored until it finishes. */
export function DolphinTile() {
  const dolphinRef = useRef<HTMLDivElement>(null)
  const splashRef = useRef<HTMLDivElement>(null)
  const dolphin = useRef<AnimationItem | null>(null)
  const splash = useRef<AnimationItem | null>(null)
  const [playing, setPlaying] = useState(false)
  const [splashing, setSplashing] = useState(false)

  useEffect(() => {
    const d = lottie.loadAnimation({
      container: dolphinRef.current!,
      renderer: 'svg',
      loop: false,
      autoplay: false,
      animationData: dolphinData,
    })
    d.goToAndStop(0, true)
    d.addEventListener('complete', () => {
      d.goToAndStop(0, true)
      setPlaying(false)
    })
    const s = lottie.loadAnimation({
      container: splashRef.current!,
      renderer: 'svg',
      loop: false,
      autoplay: false,
      animationData: splashData,
    })
    s.addEventListener('complete', () => setSplashing(false))
    dolphin.current = d
    splash.current = s
    return () => {
      d.destroy()
      s.destroy()
    }
  }, [])

  const play = () => {
    if (playing) return
    setPlaying(true)
    setSplashing(true)
    dolphin.current?.goToAndPlay(0, true)
    splash.current?.goToAndPlay(0, true)
  }

  return (
    <div className="relative mb-2.5">
      <motion.button
        type="button"
        aria-label="Play dolphin"
        onClick={play}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={spring.slow}
        className="relative flex size-16 items-center justify-center rounded-[14.08px] bg-gradient-to-b from-white to-[#f2f2f2] shadow-[0_4px_16px_rgba(0,0,0,0.03),0_2px_8.7px_rgba(0,0,0,0.15)]"
        style={{ cursor: playing ? 'default' : 'pointer' }}
      >
        <div ref={dolphinRef} className="size-12" />
      </motion.button>
      <div
        ref={splashRef}
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-1/2 z-10 size-48 -translate-x-1/2 -translate-y-1/2"
        style={{ visibility: splashing ? 'visible' : 'hidden' }}
      />
    </div>
  )
}
