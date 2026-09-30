import feedbackIcon from '@/assets/icons/feedback.svg'
import logoSplashData from '@/assets/lottie/logo-splash.json'
import { Button } from '@/components/ui/button'
import { Tooltip } from '@/components/ui/tooltip'
import { useLottieBurst } from '@/lib/use-lottie-burst'

/** "Dolphin Photos" wordmark. A tap sprays drops from the pointer; they grow
 *  out of it and shrink away as they fly. Taps are ignored mid-spray. */
function Logo() {
  // The spray (frames 23–90 of the comp) starts at ~(97, 215).
  const splash = useLottieBurst({ data: logoSplashData, size: 200, origin: [97, 215], segment: [23, 90], speed: 0.8 })

  return (
    <button
      type="button"
      onClick={splash.play}
      aria-label="Dolphin Photos"
      className="relative flex h-8 items-center gap-[5px] rounded-md"
      style={{ cursor: splash.playing ? 'default' : 'pointer' }}
    >
      <span className="flex items-center gap-[3px] text-[20px] leading-none font-semibold tracking-[-0.02em] text-[#008AED]">
        <svg width="14" height="18" viewBox="0 0 14 18" aria-hidden className="-mt-0.5 block">
          <path d="M7 0.5C7 0.5 0.5 7.6 0.5 11.5a6.5 6.5 0 0 0 13 0C13.5 7.6 7 0.5 7 0.5Z" fill="currentColor" />
        </svg>
        Dolphin
      </span>
      <span className="text-[20px] leading-none font-medium tracking-[-0.01em] text-[#86868b]">Photos</span>
      <div ref={splash.ref} aria-hidden className="z-40" style={splash.style} />
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
