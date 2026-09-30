import { motion } from 'framer-motion'
import { useLayoutEffect, useRef, useState } from 'react'
import type { Photo } from '@/lib/photos'
import { spring } from '@/lib/springs'
import { cn } from '@/lib/utils'

/** Target thumbnail box per zoom step; the grid fits as many columns as it can. */
const BOX_SIZES = [96, 124, 156, 191, 250, 330]
const GAP_X = 16
const GAP_Y = 34

interface PhotoGridProps {
  photos: Photo[]
  zoom: number
  square: boolean
  /** Photo currently open in the viewer — its tile hands its image over. */
  activeId: string | null
  onOpen: (photo: Photo) => void
}

function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [width, setWidth] = useState(0)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return [ref, width] as const
}

export function PhotoGrid({ photos, zoom, square, activeId, onOpen }: PhotoGridProps) {
  const [ref, width] = useWidth<HTMLDivElement>()
  const target = BOX_SIZES[zoom]
  const cols = Math.max(2, Math.round((width + GAP_X) / (target + GAP_X)))
  const box = width ? (width - GAP_X * (cols - 1)) / cols : target
  // Narrow screens tighten the vertical rhythm with the boxes.
  const gapY = Math.min(GAP_Y, Math.max(GAP_X, box * 0.18))

  return (
    <div ref={ref} className="mx-auto w-full max-w-[1440px] px-2 sm:px-6">
      <div
        className="grid"
        style={{
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          columnGap: GAP_X,
          rowGap: gapY,
        }}
      >
        {photos.map((photo, i) => (
          <PhotoTile
            key={photo.id}
            photo={photo}
            box={box}
            square={square}
            hidden={photo.id === activeId}
            index={i}
            onOpen={onOpen}
          />
        ))}
      </div>
    </div>
  )
}

function PhotoTile({
  photo,
  box,
  square,
  hidden,
  index,
  onOpen,
}: {
  photo: Photo
  box: number
  square: boolean
  hidden: boolean
  index: number
  onOpen: (photo: Photo) => void
}) {
  const [loaded, setLoaded] = useState(false)
  const ratio = photo.thumb.width / photo.thumb.height
  // Fit mode: the image keeps its aspect inside the square box, centered.
  const w = square ? box : ratio >= 1 ? box : box * ratio
  const h = square ? box : ratio >= 1 ? box / ratio : box

  return (
    <motion.button
      layout
      type="button"
      onClick={() => onOpen(photo)}
      aria-label={`Open ${photo.name}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...spring.slow, delay: Math.min(index, 15) * 0.025 }}
      className="group flex aspect-square w-full cursor-zoom-in items-center justify-center outline-none"
    >
      {!hidden && (
        <motion.div
          layoutId={`photo-${photo.id}`}
          transition={spring.slow}
          whileHover={{ scale: 1.025 }}
          whileTap={{ scale: 0.97 }}
          style={{ width: w, height: h }}
          className={cn(
            'relative overflow-hidden bg-[#eeeef1]',
            'group-focus-visible:ring-2 group-focus-visible:ring-[#0071e3] group-focus-visible:ring-offset-2',
          )}
        >
          <motion.img
            src={photo.thumb.src}
            alt=""
            loading="lazy"
            decoding="async"
            draggable={false}
            onLoad={() => setLoaded(true)}
            initial={false}
            animate={{ opacity: loaded ? 1 : 0 }}
            transition={spring.slow}
            className="absolute inset-0 size-full object-cover select-none"
          />
        </motion.div>
      )}
    </motion.button>
  )
}
