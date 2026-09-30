import { LayoutGroup, useInView } from 'framer-motion'
import { useMemo, useRef, useState } from 'react'
import { AlbumFooter } from '@/components/album/album-footer'
import { AlbumHero } from '@/components/album/album-hero'
import { AlbumToolbar } from '@/components/album/album-toolbar'
import { AppHeader } from '@/components/album/app-header'
import { PhotoGrid } from '@/components/album/photo-grid'
import { PhotoViewer } from '@/components/album/photo-viewer'
import { TooltipProvider } from '@/components/ui/tooltip'
import { photos as allPhotos } from '@/lib/photos'

export default function App() {
  const [square, setSquare] = useState(false)
  const [reversed, setReversed] = useState(false)
  const [zoom, setZoom] = useState(3)
  const [viewerIndex, setViewerIndex] = useState<number | null>(null)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(false)
  // The photo the viewer was opened on: only it flies between grid and viewer;
  // stepping to other photos crossfades inside the viewer.
  const [openedId, setOpenedId] = useState<string | null>(null)

  const heroRef = useRef<HTMLDivElement>(null)
  const heroVisible = useInView(heroRef, { margin: '-44px 0px 0px 0px', initial: true })

  const photos = useMemo(() => (reversed ? [...allPhotos].reverse() : allPhotos), [reversed])
  const currentId = viewerIndex === null ? null : (photos[viewerIndex]?.id ?? null)
  const activeId = currentId !== null && currentId === openedId ? currentId : null

  return (
    <TooltipProvider>
      <div className="min-h-dvh overflow-x-clip bg-white text-[#1f1f1f]">
        <AppHeader />
        <AlbumToolbar
          showTitle={!heroVisible}
          square={square}
          onToggleSquare={() => setSquare((s) => !s)}
          reversed={reversed}
          onToggleSort={() => setReversed((r) => !r)}
          zoom={zoom}
          onZoom={setZoom}
          onSlideshow={() => {
            if (photos.length === 0) return
            setOpenedId(photos[0].id)
            setViewerIndex(0)
            setPlaying(true)
          }}
        />
        <main className="flex flex-col items-center">
          <div ref={heroRef}>
            <AlbumHero count={allPhotos.length} />
          </div>
          <LayoutGroup>
            <PhotoGrid
              photos={photos}
              zoom={zoom}
              square={square}
              activeId={activeId}
              onOpen={(p) => {
                setOpenedId(p.id)
                setViewerIndex(photos.indexOf(p))
              }}
            />
            <PhotoViewer
              photos={photos}
              index={viewerIndex}
              sharedId={openedId}
              playing={playing}
              onPlayingChange={setPlaying}
              muted={muted}
              onMutedChange={setMuted}
              onIndexChange={setViewerIndex}
              onClose={() => {
                setViewerIndex(null)
                setPlaying(false)
              }}
            />
          </LayoutGroup>
          <div className="mt-[34px] w-full">
            <AlbumFooter />
          </div>
        </main>
      </div>
    </TooltipProvider>
  )
}
