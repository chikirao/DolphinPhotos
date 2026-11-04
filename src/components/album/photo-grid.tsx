import { motion, useReducedMotion } from 'framer-motion'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { layoutPhotos } from '@/lib/photo-layout'
import type { Photo } from '@/lib/photos'
import { spring } from '@/lib/springs'
import { useMediaVisibility } from '@/lib/use-media-visibility'

const BOX_SIZES = [96, 124, 156, 191, 250, 330]
const MOBILE_COLUMNS = [5, 4, 3, 3, 2, 2]

interface PhotoGridProps {
  photos: Photo[]
  zoom: number
  square: boolean
  activeId: string | null
  paused: boolean
  onOpen: (photo: Photo) => void
}

export function PhotoGrid({ photos, zoom, square, activeId, paused, onOpen }: PhotoGridProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)
  const reduced = useReducedMotion()
  useLayoutEffect(() => {
    if (!ref.current) return
    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width))
    ro.observe(ref.current)
    return () => ro.disconnect()
  }, [])
  const mobile = width > 0 && width < 600
  const gapX = mobile ? 2 : 16
  const gapY = gapX
  const cols = mobile ? MOBILE_COLUMNS[zoom] : Math.max(2, Math.round((width + gapX) / (BOX_SIZES[zoom] + gapX)))
  const box = width ? Math.max(1, (width - gapX * (cols - 1)) / cols) : BOX_SIZES[zoom]
  const placements = useMemo(() => layoutPhotos(photos, cols), [photos, cols])

  return (
    <div className="mx-auto w-full max-w-[1440px] px-1.5 sm:px-6">
      <div ref={ref} className="grid" style={{
        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
        gridAutoRows: box, columnGap: gapX, rowGap: gapY,
      }}>
        {photos.map((photo, index) => {
          const place = placements[index]
          return (
            <PhotoTile key={photo.id} photo={photo}
              width={place.columns * box + (place.columns - 1) * gapX}
              height={place.rows * box + (place.rows - 1) * gapY}
              placement={place} square={square || mobile} hidden={photo.id === activeId}
              reduced={!!reduced} paused={paused} onOpen={onOpen} />
          )
        })}
      </div>
    </div>
  )
}

function PhotoTile({ photo, width, height, placement, square, hidden, reduced, paused, onOpen }: {
  photo: Photo
  width: number
  height: number
  placement: ReturnType<typeof layoutPhotos>[number]
  square: boolean
  hidden: boolean
  reduced: boolean
  paused: boolean
  onOpen: (photo: Photo) => void
}) {
  const { ref, near, visible } = useMediaVisibility()
  const ratio = photo.thumb.width / photo.thumb.height
  const w = square ? width : Math.min(width, height * ratio)
  const h = square ? height : w / ratio
  // Keep a measured footprint while decoded media far offscreen is released.
  return (
    <div ref={ref} data-photo-id={photo.id} data-emphasis={photo.emphasis} style={{
      gridColumn: `${placement.column + 1} / span ${placement.columns}`,
      gridRow: `${placement.row + 1} / span ${placement.rows}`,
    }}>
      <Button variant="ghost" aria-label={`Open ${photo.alt}`} onClick={() => onOpen(photo)}
        className="group h-full w-full cursor-zoom-in rounded-none p-0 [--hover:transparent] [--active:transparent]">
        {!hidden && (
          <motion.div layoutId={near && !reduced ? `photo-${photo.id}` : undefined}
            transition={spring.slow} style={{ width: w, height: h }}
            className="relative overflow-hidden bg-[#eeeef1]">
            {near && <TileMedia photo={photo} width={w} visible={visible && !paused} reduced={reduced} />}
          </motion.div>
        )}
      </Button>
    </div>
  )
}

function TileMedia({ photo, width, visible, reduced }: { photo: Photo; width: number; visible: boolean; reduced: boolean }) {
  const [loaded, setLoaded] = useState(false)
  const video = useRef<HTMLVideoElement>(null)
  useEffect(() => {
    const element = video.current
    if (!element) return
    const sync = () => {
      if (visible && !document.hidden && !reduced) element.play().catch(() => {})
      else element.pause()
    }
    sync()
    document.addEventListener('visibilitychange', sync)
    return () => { element.pause(); document.removeEventListener('visibilitychange', sync) }
  }, [visible, reduced])

  return (
    <>
      <motion.img src={photo.preview.src}
        srcSet={`${photo.preview.src} ${photo.preview.width}w, ${photo.thumb.src} ${photo.thumb.width}w`}
        sizes={`${Math.ceil(width)}px`} alt="" decoding="async" draggable={false}
        onLoad={() => setLoaded(true)} initial={false}
        animate={{ opacity: loaded ? 1 : 0 }} transition={spring.slow}
        className="absolute inset-0 size-full object-cover select-none" />
      {photo.kind === 'video' && visible && !reduced && (
        <video ref={video} src={photo.video} poster={photo.preview.src} autoPlay muted loop playsInline
          preload="none" aria-hidden className="pointer-events-none absolute inset-0 size-full object-cover" />
      )}
    </>
  )
}
