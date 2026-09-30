import { AnimatePresence, motion, type PanInfo } from 'framer-motion'
import { ChevronLeft, ChevronRight, Download, Pause, Play, X } from 'lucide-react'
import { useCallback, useEffect, useLayoutEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Tooltip } from '@/components/ui/tooltip'
import { downloadPhoto } from '@/lib/download-album'
import type { Photo } from '@/lib/photos'
import { spring } from '@/lib/springs'

const SLIDESHOW_MS = 3500
const CHROME_H = 56

interface PhotoViewerProps {
  photos: Photo[]
  index: number | null
  playing: boolean
  onPlayingChange: (playing: boolean) => void
  onIndexChange: (index: number) => void
  onClose: () => void
}

function useViewport() {
  const read = () => ({ w: window.innerWidth, h: window.innerHeight })
  const [size, setSize] = useState(read)
  useLayoutEffect(() => {
    const onResize = () => setSize(read())
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  return size
}

export function PhotoViewer(props: PhotoViewerProps) {
  const { index } = props
  return (
    <AnimatePresence>
      {index !== null && props.photos[index] && <ViewerBody key="viewer" {...props} index={index} />}
    </AnimatePresence>
  )
}

function ViewerBody({
  photos,
  index,
  playing,
  onPlayingChange,
  onIndexChange,
  onClose,
}: PhotoViewerProps & { index: number }) {
  const photo = photos[index]
  const vp = useViewport()
  // Direction of the last step: the incoming photo slides in from that side.
  // 0 means "just opened" — the photo flies out of its grid tile instead.
  const [direction, setDirection] = useState(0)
  const [fullLoaded, setFullLoaded] = useState<Record<string, boolean>>({})

  const go = useCallback(
    (delta: number) => {
      setDirection(delta)
      onIndexChange((index + delta + photos.length) % photos.length)
    },
    [index, photos.length, onIndexChange],
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowRight') go(1)
      else if (e.key === 'ArrowLeft') go(-1)
      else if (e.key === ' ') {
        e.preventDefault()
        onPlayingChange(!playing)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [go, onClose, onPlayingChange, playing])

  useEffect(() => {
    if (!playing) return
    const t = setTimeout(() => go(1), SLIDESHOW_MS)
    return () => clearTimeout(t)
  }, [playing, index, go])

  // Lock page scroll while open.
  useEffect(() => {
    const prev = document.documentElement.style.overflow
    document.documentElement.style.overflow = 'hidden'
    return () => {
      document.documentElement.style.overflow = prev
    }
  }, [])

  // Preload neighbours so stepping feels instant.
  useEffect(() => {
    for (const d of [1, -1]) {
      const p = photos[(index + d + photos.length) % photos.length]
      new Image().src = p.full.src
    }
  }, [index, photos])

  // Fit the photo into the stage between the chrome bars.
  const pad = vp.w < 640 ? 0 : 24
  const stageW = vp.w - pad * 2
  const stageH = vp.h - CHROME_H * 2 - pad
  const ratio = photo.full.width / photo.full.height
  const fitW = Math.min(stageW, stageH * ratio)
  const fitH = fitW / ratio

  const onDragEnd = (_: unknown, info: PanInfo) => {
    const swipe = info.offset.x + info.velocity.x * 0.2
    if (swipe < -80) go(1)
    else if (swipe > 80) go(-1)
    else if (Math.abs(info.offset.y) > 120) onClose()
  }

  const chromeButton = 'rounded-lg text-[#0071e3] hover:text-[#0071e3]'

  return (
    <motion.div className="fixed inset-0 z-50 flex flex-col" role="dialog" aria-modal="true" aria-label={photo.name}>
      <motion.div
        className="absolute inset-0 bg-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, transition: spring.slow.exit }}
        transition={spring.slow}
        onClick={onClose}
      />

      <motion.header
        className="relative z-10 grid h-14 grid-cols-[1fr_auto_1fr] items-center px-3"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8, transition: spring.moderate.exit }}
        transition={spring.moderate}
      >
        <div className="justify-self-start">
          <Tooltip content="Close" side="bottom">
            <Button variant="ghost" size="icon" aria-label="Close" onClick={onClose} className={chromeButton}>
              <X />
            </Button>
          </Tooltip>
        </div>
        <span className="text-[13px] text-black/56 tabular-nums">
          {index + 1} of {photos.length}
        </span>
        <div className="flex items-center gap-1 justify-self-end">
          <Tooltip content={playing ? 'Pause slideshow' : 'Play slideshow'} side="bottom">
            <Button
              variant="ghost"
              size="icon"
              aria-label={playing ? 'Pause slideshow' : 'Play slideshow'}
              onClick={() => onPlayingChange(!playing)}
              className={chromeButton}
            >
              {playing ? <Pause /> : <Play />}
            </Button>
          </Tooltip>
          <Tooltip content="Download" side="bottom">
            <Button variant="ghost" size="icon" aria-label="Download" onClick={() => downloadPhoto(photo)} className={chromeButton}>
              <Download />
            </Button>
          </Tooltip>
        </div>
      </motion.header>

      <div
        className="pointer-events-none relative flex flex-1 items-center justify-center"
        style={{ paddingBottom: CHROME_H }}
      >
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={photo.id}
            layoutId={`photo-${photo.id}`}
            custom={direction}
            variants={{
              enter: (d: number) => ({ x: d * 80, opacity: 0 }),
              center: { x: 0, opacity: 1 },
              exit: (d: number) => (d === 0 ? {} : { x: d * -80, opacity: 0 }),
            }}
            initial={direction === 0 ? false : 'enter'}
            animate="center"
            exit="exit"
            transition={spring.slow}
            drag
            dragSnapToOrigin
            dragElastic={0.6}
            onDragEnd={onDragEnd}
            className="pointer-events-auto relative cursor-grab overflow-hidden bg-[#eeeef1] active:cursor-grabbing"
            style={{ width: fitW, height: fitH }}
          >
            <img
              src={photo.thumb.src}
              alt=""
              draggable={false}
              className="absolute inset-0 size-full object-cover select-none"
            />
            <motion.img
              src={photo.full.src}
              alt={photo.name}
              draggable={false}
              onLoad={() => setFullLoaded((s) => ({ ...s, [photo.id]: true }))}
              initial={false}
              animate={{ opacity: fullLoaded[photo.id] ? 1 : 0 }}
              transition={spring.slow}
              className="absolute inset-0 size-full object-cover select-none"
            />
          </motion.div>
        </AnimatePresence>

        {photos.length > 1 && (
          <>
            <NavButton side="left" onClick={() => go(-1)} />
            <NavButton side="right" onClick={() => go(1)} />
          </>
        )}
      </div>
    </motion.div>
  )
}

function NavButton({ side, onClick }: { side: 'left' | 'right'; onClick: () => void }) {
  const Icon = side === 'left' ? ChevronLeft : ChevronRight
  const label = side === 'left' ? 'Previous photo' : 'Next photo'
  return (
    <motion.div
      className="pointer-events-auto absolute top-1/2 hidden -translate-y-1/2 sm:block"
      style={{ [side]: 16 }}
      initial={{ opacity: 0, x: side === 'left' ? -8 : 8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, transition: spring.moderate.exit }}
      transition={spring.moderate}
    >
      <Tooltip content={label} side={side === 'left' ? 'right' : 'left'}>
        <Button variant="secondary" size="icon" aria-label={label} onClick={onClick} className="rounded-full">
          <Icon />
        </Button>
      </Tooltip>
    </motion.div>
  )
}
