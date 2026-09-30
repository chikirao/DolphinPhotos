import lottie, { type AnimationItem } from 'lottie-web/build/player/lottie_light'
import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import dolphinData from '@/assets/lottie/dolphin.json'
import splashData from '@/assets/lottie/splash.json'
import { spring } from '@/lib/springs'
import { useLottieBurst } from '@/lib/use-lottie-burst'

/** Album tile with the Telegram dolphin: frozen on frame 0, a tap plays it
 *  once and throws a splash from the tap point; taps are ignored until the
 *  dolphin finishes. */
export function DolphinTile() {
  const dolphinRef = useRef<HTMLDivElement>(null)
  const dolphin = useRef<AnimationItem | null>(null)
  const [playing, setPlaying] = useState(false)
  // The splash comp erupts from ~(385, 215), right of its center.
  const splash = useLottieBurst({ data: splashData, size: 192, origin: [385, 215] })

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
    dolphin.current = d
    return () => d.destroy()
  }, [])

  return (
    <div className="relative mb-2.5">
      <motion.button
        type="button"
        aria-label="Play dolphin"
        onClick={(e) => {
          if (playing) return
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
        <div ref={splash.ref} aria-hidden className="z-10" style={splash.style} />
      </motion.button>
    </div>
  )
}
