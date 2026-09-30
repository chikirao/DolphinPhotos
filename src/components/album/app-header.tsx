import feedbackIcon from '@/assets/icons/feedback.svg'
import { SplashOnClick } from '@/components/album/splash-on-click'
import { Button } from '@/components/ui/button'
import { Tooltip } from '@/components/ui/tooltip'

/** "Dolphin Photos" wordmark. A tap sprays drops from the pointer to the lower right. */
function Logo() {
  return (
    <SplashOnClick direction="right">
      <button type="button" aria-label="Dolphin Photos" className="flex h-8 cursor-pointer items-center gap-[5px] rounded-md">
        <span className="flex items-center gap-[3px] text-[20px] leading-none font-semibold tracking-[-0.02em] text-[#008AED]">
          <svg width="14" height="18" viewBox="0 0 14 18" aria-hidden className="-mt-0.5 block">
            <path d="M7 0.5C7 0.5 0.5 7.6 0.5 11.5a6.5 6.5 0 0 0 13 0C13.5 7.6 7 0.5 7 0.5Z" fill="currentColor" />
          </svg>
          Dolphin
        </span>
        <span className="text-[20px] leading-none font-medium tracking-[-0.01em] text-[#86868b]">Photos</span>
      </button>
    </SplashOnClick>
  )
}

export function AppHeader() {
  return (
    <header className="relative z-40 flex h-11 min-h-11 items-center border-b border-[#e5e5ea] bg-[#f2f2f7] pr-1.5 pl-4">
      <Logo />
      <div className="flex flex-1 items-center justify-end">
        <SplashOnClick>
          <Tooltip content="Feedback" side="bottom">
            <Button variant="ghost" size="icon" aria-label="Feedback" className="mx-1 rounded-lg">
              <img src={feedbackIcon} alt="" />
            </Button>
          </Tooltip>
        </SplashOnClick>
        <SplashOnClick>
          <Button variant="ghost" className="mx-1 rounded-lg px-3 text-sm font-semibold text-black/88 hover:text-black">
            Sign In
          </Button>
        </SplashOnClick>
      </div>
    </header>
  )
}
