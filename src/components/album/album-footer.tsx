import { Button } from '@/components/ui/button'
import { album } from '@/config'

export function AlbumFooter() {
  return (
    <footer className="w-full">
      <div className="mx-auto flex min-h-[70px] w-full max-w-[500px] flex-col px-5 pb-5">
        <div className="h-[18px]" />
        <div className="flex justify-center px-5 pt-5">
          <Button
            asChild
            variant="ghost"
            size="compact"
            className="h-[30px] rounded-lg px-2.5 text-[13px] text-[#0071e3] hover:text-[#0071e3]"
          >
            <a href={album.reportUrl} target="_blank" rel="noreferrer">
              Report Content
            </a>
          </Button>
        </div>
      </div>
      <div className="border-t border-black/10 py-5">
        <div className="mx-auto flex max-w-[982px] flex-wrap items-center justify-between gap-2 px-4 text-[11px] text-black/56">
          <div className="flex items-center">
            <a href={album.footer.privacyUrl} className="hover:underline">
              Privacy Policy
            </a>
            <span className="mx-[5px] h-[15px] w-px bg-[#d1d1d6]" />
            <a href={album.footer.termsUrl} className="hover:underline">
              Terms &amp; Conditions
            </a>
          </div>
          <p>{album.footer.copyright}</p>
        </div>
      </div>
    </footer>
  )
}
