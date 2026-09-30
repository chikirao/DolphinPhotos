import icloudLogo from '@/assets/icons/icloud-logo.svg'
import feedbackIcon from '@/assets/icons/feedback.svg'
import { Button } from '@/components/ui/button'
import { Tooltip } from '@/components/ui/tooltip'

export function AppHeader({ onSignIn }: { onSignIn: () => void }) {
  return (
    <header className="flex h-11 min-h-11 items-center border-b border-[#e5e5ea] bg-[#f2f2f7] pr-1.5 pl-4">
      <a href="/" aria-label="Home" className="flex h-8 w-20 items-center">
        <img src={icloudLogo} alt="iCloud" className="-ml-0.5 translate-x-[2.5px]" />
      </a>
      <span className="pt-[3px] text-xs text-[#6e6e73]">Photos</span>
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
