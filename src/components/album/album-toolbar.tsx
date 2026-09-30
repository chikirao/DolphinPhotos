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
import { SplashOnClick } from '@/components/album/splash-on-click'
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
  onDownload: () => void
  onSlideshow: () => void
}

function ToolButton({
  label,
  icon,
  onClick,
  flip,
}: {
  label: string
  icon: string
  onClick?: () => void
  flip?: boolean
}) {
  return (
    <Tooltip content={label} side="bottom">
      <Button
        variant="ghost"
        size="icon-compact"
        aria-label={label}
        onClick={onClick}
        className="mx-[3px] size-8 min-w-8 rounded-lg p-0"
      >
        <motion.img
          src={icon}
          alt=""
          className="block"
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
        <div className="hidden items-center justify-self-start sm:flex">
          <ToolButton icon={aspectIcon}
            label={props.square ? 'Aspect ratio grid' : 'Square photo grid'}
            onClick={props.onToggleSquare}
            flip={props.square} />
          <ToolButton icon={sortIcon}
            label={props.reversed ? 'Sort oldest first' : 'Sort newest first'}
            onClick={props.onToggleSort}
            flip={props.reversed} />
          <div className="flex h-5 items-center px-[3px]">
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

        <div className="col-start-2 min-w-0 justify-self-center overflow-hidden">
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

        <div className="col-start-3 flex items-center justify-self-end">
          {/* Right-hand actions all throw a spray to the lower left. */}
          <SplashOnClick>
            <ToolButton icon={addPhotoIcon} label="Add to Library" />
          </SplashOnClick>
          <SplashOnClick className="hidden sm:inline-flex">
            <ToolButton icon={downloadIcon} label="Download all" onClick={props.onDownload} />
          </SplashOnClick>
          <SplashOnClick className="hidden sm:inline-flex">
            <ToolButton icon={slideshowIcon} label="Slideshow" onClick={props.onSlideshow} />
          </SplashOnClick>
          <SplashOnClick>
            <ToolButton icon={moreIcon} label="More" />
          </SplashOnClick>
        </div>
      </motion.div>
    </div>
  )
}
