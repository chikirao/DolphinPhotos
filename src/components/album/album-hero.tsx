import timerIcon from '@/assets/icons/timer.svg'
import photosIcon from '@/assets/icons/photos.svg'
import cloudDownloadIcon from '@/assets/icons/cloud-download.svg'
import { Button } from '@/components/ui/button'
import { album } from '@/config'
import { DolphinTile } from '@/components/album/dolphin-tile'

const CloudDownloadIcon = () => <img src={cloudDownloadIcon} alt="" className="block" />

interface AlbumHeroProps {
  count: number
  downloading: boolean
  onDownload: () => void
}

export function AlbumHero({ count, downloading, onDownload }: AlbumHeroProps) {
  return (
    <section className="flex flex-col items-center justify-center px-5 pt-6 pb-4 sm:pt-16 sm:pb-[60px] text-[#1f1f1f]">
      <DolphinTile />

      {album.expires && (
        <div className="py-[5px]">
          <div className="flex h-5 items-center rounded-full bg-[#e5e5ea] px-[7px] py-1 text-[10px] font-semibold">
            <img src={timerIcon} alt="" className="mr-[3px]" />
            {album.expires}
          </div>
        </div>
      )}

      <h1 className="text-[26px] leading-[32px] font-bold sm:text-[32px] sm:leading-[38px]">{album.title}</h1>

      <p className="flex items-center pt-1 text-[13px] sm:pt-1.5 sm:text-base">
        <img src={photosIcon} alt="" className="mr-[5px]" />
        <span>
          {count} {count === 1 ? 'Item' : 'Items'}
        </span>
      </p>

      <p className="flex flex-col items-center gap-0.5 pt-1.5 text-center text-[13px] text-black/56 sm:text-sm">
        {album.people.map((group) => (
          <span key={group.label}>
            <span>
              {group.label}{' '}
              {group.links.map((link, j) => (
                <span key={link.name}>
                  {j > 0 && ' & '}
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#0071e3] underline-offset-2 transition-colors duration-80 hover:underline"
                  >
                    {link.name}
                  </a>
                </span>
              ))}
            </span>
          </span>
        ))}
      </p>

      <div className="pt-3 sm:pt-[15px]">
        <Button
          onClick={onDownload}
          disabled={count === 0}
          loading={downloading}
          leadingIcon={CloudDownloadIcon}
          className="h-[34px] gap-1.5 rounded-full pr-[18px] pl-4 text-sm font-medium [--background:#fff] [--foreground:#0071e3]"
        >
          <span className="sm:hidden">Download</span>
          <span className="hidden sm:inline">Download Album</span>
        </Button>
      </div>
    </section>
  )
}
