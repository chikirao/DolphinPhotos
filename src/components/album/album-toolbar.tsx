import { AnimatePresence, motion } from 'framer-motion'
import aspectIcon from '@/assets/icons/aspect.svg'
import sortIcon from '@/assets/icons/sort.svg'
import minusIcon from '@/assets/icons/minus.svg'
import plusIcon from '@/assets/icons/plus.svg'
import addPhotoIcon from '@/assets/icons/add-photo.svg'
import downloadIcon from '@/assets/icons/download.svg'
import slideshowIcon from '@/assets/icons/slideshow.svg'
import moreIcon from '@/assets/icons/more.svg'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Tooltip } from '@/components/ui/tooltip'
import { album } from '@/config'
import { spring } from '@/lib/springs'

export const ZOOM_LEVELS = 6

interface AlbumToolbarProps {
  /** Show the album title in the center once the hero has scrolled away. */
  showTitle: boolean
  square: boolean
  onToggleSquare: () => void
  reversed: boolean
  onToggleSort: () => void
  zoom: number
  onZoom: (zoom: number) => void
  onCredits: () => void
  onDownload: () => void
  onSlideshow: () => void
  hasPhotos: boolean
}

function ToolButton({
  label,
  icon,
  onClick,
  disabled,
  flip,
}: {
  label: string
  icon: string
  onClick?: () => void
  disabled?: boolean
  flip?: boolean
}) {
  return (
    <Tooltip content={label} side="bottom">
      <Button
        variant="ghost"
        size="compact"
        aria-label={label}
        onClick={onClick}
        disabled={disabled}
        className="mx-[3px] min-w-7 rounded-lg px-1.5 disabled:opacity-30"
      >
        <motion.img
          src={icon}
          alt=""
          animate={{ rotate: flip ? 180 : 0 }}
          transition={spring.slow}
        />
      </Button>
    </Tooltip>
  )
}

export function AlbumToolbar(props: AlbumToolbarProps) {
  const { zoom, onZoom } = props
  return (
    <div className="sticky top-0 z-30 bg-white/85 backdrop-blur-xl">
      <motion.div
        className="grid h-11 grid-cols-[1fr_auto_1fr] items-center px-[7px]"
        animate={{ boxShadow: props.showTitle ? '0 1px 0 rgba(0,0,0,0.1)' : '0 1px 0 rgba(0,0,0,0)' }}
        transition={spring.moderate}
      >
        <div className="flex items-center justify-self-start">
          <ToolButton icon={aspectIcon}
            label={props.square ? 'Aspect ratio grid' : 'Square photo grid'}
            onClick={props.onToggleSquare}
            flip={props.square} />
          <ToolButton icon={sortIcon}
            label={props.reversed ? 'Sort oldest first' : 'Sort newest first'}
            onClick={props.onToggleSort}
            flip={props.reversed} />
          <div className="hidden h-5 items-center px-[3px] sm:flex">
            <Button
              variant="ghost"
              aria-label="Zoom out"
              className="size-5 min-w-5 rounded-md p-0"
              onClick={() => onZoom(Math.max(0, zoom - 1))}
            >
              <img src={minusIcon} alt="" />
            </Button>
            <div className="w-[62px] px-[5px]">
              <Slider
                hairline
                label="Zoom"
                min={0}
                max={ZOOM_LEVELS - 1}
                step={1}
                value={zoom}
                onChange={(v) => onZoom(v as number)}
                showValue={false}
                thumbColor="#fff"
                thumbBorderColor="#0071e3"
                trackStyle={{ backgroundColor: 'rgba(0,0,0,0.32)' }}
                fillStyle={{ backgroundColor: '#0071e3' }}
                className="-my-2"
              />
            </div>
            <Button
              variant="ghost"
              aria-label="Zoom in"
              className="size-5 min-w-5 rounded-md p-0"
              onClick={() => onZoom(Math.min(ZOOM_LEVELS - 1, zoom + 1))}
            >
              <img src={plusIcon} alt="" />
            </Button>
          </div>
        </div>

        <div className="min-w-0 justify-self-center overflow-hidden">
          <AnimatePresence>
            {props.showTitle && (
              <motion.span
                className="block truncate text-[15px] font-semibold text-[#1f1f1f]"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8, transition: spring.moderate.exit }}
                transition={spring.moderate}
              >
                {album.title}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center justify-self-end">
          <ToolButton icon={addPhotoIcon} label="Credits" onClick={props.onCredits} />
          <ToolButton icon={downloadIcon} label="Download all" onClick={props.onDownload} disabled={!props.hasPhotos} />
          <ToolButton icon={slideshowIcon} label="Slideshow" onClick={props.onSlideshow} disabled={!props.hasPhotos} />
          <ToolButton icon={moreIcon} label="More" disabled />
        </div>
      </motion.div>
    </div>
  )
}
