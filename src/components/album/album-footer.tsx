import { WhaleSummon } from '@/components/album/whale-summon'
import { album } from '@/config'

export function AlbumFooter() {
  return (
    <footer className="w-full">
      <div className="mx-auto flex min-h-[70px] w-full max-w-[500px] flex-col px-5 pb-5">
        <div className="h-[18px]" />
        <div className="px-5 pt-5">
          <WhaleSummon />
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
