import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { ensure } from '@/lib/assets'
import { spring } from '@/lib/springs'
import { mountLottie } from '@/lib/use-lottie-burst'

const WHALE = 180
const SPOUT = 240
// Comp coordinates (512×512): the whale's blowhole, and where the spout
// comp's first splash erupts. Lined up so the spout bursts from the head.
const BLOWHOLE: [number, number] = [120, 40]
const SPOUT_ORIGIN: [number, number] = [228, 166]

/** "Summon Whale": a whale pops up above the button, plays once with a spout
 *  bursting from its head, then shrinks away. */
export function WhaleSummon() {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative flex justify-center">
      <AnimatePresence>{open && <Whale key="whale" onDone={() => setOpen(false)} />}</AnimatePresence>
      <Button
        variant="ghost"
        size="compact"
        disabled={open}
        onClick={() => setOpen(true)}
        className="h-[30px] rounded-lg px-2.5 text-[13px] text-[#0071e3] hover:text-[#0071e3] disabled:opacity-100"
      >
        Summon Whale
      </Button>
    </div>
  )
}

function Whale({ onDone }: { onDone: () => void }) {
  const whaleRef = useRef<HTMLDivElement>(null)
  const spoutRef = useRef<HTMLDivElement>(null)
  const [spouting, setSpouting] = useState(true)
  const done = useRef(onDone)
  done.current = onDone

  useEffect(() => {
    let cancelled = false
    let stop = () => {}
    Promise.all([ensure('lottie'), ensure('whale'), ensure('spout')]).then(([lottie, whaleData, spoutData]) => {
      if (cancelled) return
      const w = lottie.loadAnimation({
        container: whaleRef.current!,
        renderer: 'svg',
        loop: false,
        autoplay: true,
        animationData: whaleData,
      })
      w.addEventListener('complete', () => done.current())
      const s = mountLottie(lottie, spoutRef.current!, spoutData, true)
      s.addEventListener('complete', () => setSpouting(false))
      stop = () => {
        w.destroy()
        s.destroy()
      }
    })
    return () => {
      cancelled = true
      stop()
    }
  }, [])

  const kw = WHALE / 512
  const ks = SPOUT / 512
  return (
    <div
      className="pointer-events-none absolute bottom-full left-1/2 z-20 -translate-x-1/2"
      style={{ width: WHALE, height: WHALE }}
      aria-hidden
    >
      <motion.div
        ref={whaleRef}
        className="size-full"
        style={{ transformOrigin: '50% 100%' }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0, transition: spring.slow }}
        transition={spring.slow}
      />
      {/* No enter/exit of its own: it simply plays and is gone. */}
      <div
        ref={spoutRef}
        className="absolute"
        style={{
          width: SPOUT,
          height: SPOUT,
          left: BLOWHOLE[0] * kw - SPOUT_ORIGIN[0] * ks,
          top: BLOWHOLE[1] * kw - SPOUT_ORIGIN[1] * ks,
          visibility: spouting ? 'visible' : 'hidden',
        }}
      />
    </div>
  )
}
