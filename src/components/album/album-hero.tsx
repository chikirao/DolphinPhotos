import { motion } from 'framer-motion'
import timerIcon from '@/assets/icons/timer.svg'
import photosIcon from '@/assets/icons/photos.svg'
import cloudDownloadIcon from '@/assets/icons/cloud-download.svg'
import { Button } from '@/components/ui/button'
import { album } from '@/config'
import { spring } from '@/lib/springs'

interface AlbumHeroProps {
  count: number
  downloading: boolean
  onDownload: () => void
}

export function AlbumHero({ count, downloading, onDownload }: AlbumHeroProps) {
  return (
    <section className="flex flex-col items-center justify-center px-5 pt-16 pb-[60px] text-[#1f1f1f]">
      <motion.div
        className="mb-2.5 flex size-16 items-center justify-center rounded-[14.08px] bg-gradient-to-b from-white to-[#f2f2f2] text-5xl shadow-[0_4px_16px_rgba(0,0,0,0.03),0_2px_8.7px_rgba(0,0,0,0.15)] select-none"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={spring.slow}
        whileHover={{ scale: 1.04, rotate: -3 }}
        whileTap={{ scale: 0.96 }}
      >
        {album.emoji}
      </motion.div>

      {album.expires && (
        <div className="py-[5px]">
          <div className="flex h-5 items-center rounded-full bg-[#e5e5ea] px-[7px] py-1 text-[10px] font-semibold">
            <img src={timerIcon} alt="" className="mr-[3px]" />
            {album.expires}
          </div>
        </div>
      )}

      <h1 className="text-[32px] leading-[38px] font-bold">{album.title}</h1>

      <p className="flex items-center pt-1.5 text-base">
        <img src={photosIcon} alt="" className="mr-[5px]" />
        <span className="whitespace-pre">
          {count} {count === 1 ? 'Item' : 'Items'}  ·  Created by {album.createdBy}
        </span>
      </p>

      <div className="pt-[15px]">
        <Button
          onClick={onDownload}
          disabled={count === 0}
          loading={downloading}
          className="h-[34px] rounded-full px-[18px] text-sm font-medium [--background:#fff] [--foreground:#0071e3]"
        >
          <span className="inline-flex items-center whitespace-nowrap">
            <img src={cloudDownloadIcon} alt="" className="mr-1.5" />
            Download Album
          </span>
        </Button>
      </div>
    </section>
  )
}
