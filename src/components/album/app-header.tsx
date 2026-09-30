import lottie, { type AnimationItem } from 'lottie-web/build/player/lottie_light'
import { useEffect, useRef, useState } from 'react'
import feedbackIcon from '@/assets/icons/feedback.svg'
import logoSplashData from '@/assets/lottie/logo-splash.json'
import { Button } from '@/components/ui/button'
import { Tooltip } from '@/components/ui/tooltip'

/** "Dolphin Photos" wordmark. A tap sprays drops out of the droplet; they
 *  shrink as they fly, and taps are ignored until the spray is over. */
function Logo() {
  const splashRef = useRef<HTMLDivElement>(null)
  const splash = useRef<AnimationItem | null>(null)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    const s = lottie.loadAnimation({
      container: splashRef.current!,
      renderer: 'svg',
      loop: false,
      autoplay: false,
      animationData: logoSplashData,
    })
    // Drops fly past the comp bounds by design — don't clip them.
    s.addEventListener('DOMLoaded', () => {
      const svg = splashRef.current?.querySelector('svg')
      svg?.style.setProperty('overflow', 'visible')
      svg?.querySelector(':scope > g[clip-path]')?.removeAttribute('clip-path')
    })
    s.addEventListener('complete', () => setPlaying(false))
    splash.current = s
    return () => s.destroy()
  }, [])

  const play = () => {
    if (playing) return
    setPlaying(true)
    splash.current?.goToAndPlay(0, true)
  }

  return (
    <button
      type="button"
      onClick={play}
      aria-label="Dolphin Photos"
      className="relative flex h-8 items-center gap-[5px] rounded-md"
      style={{ cursor: playing ? 'default' : 'pointer' }}
    >
      <span className="flex items-center gap-[3px] text-[20px] leading-none font-semibold tracking-[-0.02em] text-[#008AED]">
        <span className="relative -mt-0.5 block">
          <svg width="14" height="18" viewBox="0 0 14 18" aria-hidden className="block">
            <path d="M7 0.5C7 0.5 0.5 7.6 0.5 11.5a6.5 6.5 0 0 0 13 0C13.5 7.6 7 0.5 7 0.5Z" fill="currentColor" />
          </svg>
          {/* Comp's drops start near its upper-left, so anchor that at the droplet. */}
          <div
            ref={splashRef}
            aria-hidden
            className="pointer-events-none absolute top-[-14px] left-[-14px] z-40 size-24"
            style={{ visibility: playing ? 'visible' : 'hidden' }}
          />
        </span>
        Dolphin
      </span>
      <span className="text-[20px] leading-none font-medium tracking-[-0.01em] text-[#86868b]">Photos</span>
    </button>
  )
}

export function AppHeader({ onSignIn }: { onSignIn: () => void }) {
  return (
    <header className="relative z-40 flex h-11 min-h-11 items-center border-b border-[#e5e5ea] bg-[#f2f2f7] pr-1.5 pl-4">
      <Logo />
      <div className="flex flex-1 items-center justify-end">
        <Tooltip content="Feedback" side="bottom">
          <Button variant="ghost" size="icon" className="mx-1 rounded-lg" onClick={onSignIn}>
            <img src={feedbackIcon} alt="" />
          </Button>
        </Tooltip>
        <Button
          variant="ghost"
          className="mx-1 rounded-lg px-3 text-sm font-semibold text-black/88 hover:text-black"
          onClick={onSignIn}
        >
          Sign In
        </Button>
      </div>
    </header>
  )
}
