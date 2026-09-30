import { LayoutGroup, useInView } from 'framer-motion'
import { useCallback, useMemo, useRef, useState } from 'react'
import { AlbumFooter } from '@/components/album/album-footer'
import { AlbumHero } from '@/components/album/album-hero'
import { AlbumToolbar } from '@/components/album/album-toolbar'
import { AppHeader } from '@/components/album/app-header'
import { PhotoGrid } from '@/components/album/photo-grid'
import { PhotoViewer } from '@/components/album/photo-viewer'
import { TooltipProvider } from '@/components/ui/tooltip'
import { album } from '@/config'
import { downloadAlbum } from '@/lib/download-album'
import { photos as allPhotos } from '@/lib/photos'

export default function App() {
  const [square, setSquare] = useState(false)
  const [reversed, setReversed] = useState(false)
  const [zoom, setZoom] = useState(3)
  const [viewerIndex, setViewerIndex] = useState<number | null>(null)
  const [playing, setPlaying] = useState(false)
  const [downloading, setDownloading] = useState(false)

  const heroRef = useRef<HTMLDivElement>(null)
  const heroVisible = useInView(heroRef, { margin: '-44px 0px 0px 0px', initial: true })

  const photos = useMemo(() => (reversed ? [...allPhotos].reverse() : allPhotos), [reversed])
  const activeId = viewerIndex === null ? null : (photos[viewerIndex]?.id ?? null)

  const handleDownload = useCallback(async () => {
    if (downloading || allPhotos.length === 0) return
    setDownloading(true)
    try {
      await downloadAlbum(allPhotos, album.zipName)
    } finally {
      setDownloading(false)
    }
  }, [downloading])

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
          onDownload={handleDownload}
          onSlideshow={() => {
            if (photos.length === 0) return
            setViewerIndex(0)
            setPlaying(true)
          }}
        />
        <main className="flex flex-col items-center">
          <div ref={heroRef}>
            <AlbumHero
              count={allPhotos.length}
              downloading={downloading}
              onDownload={handleDownload}
            />
          </div>
          <LayoutGroup>
            <PhotoGrid
              photos={photos}
              zoom={zoom}
              square={square}
              activeId={activeId}
              onOpen={(p) => setViewerIndex(photos.indexOf(p))}
            />
            <PhotoViewer
              photos={photos}
              index={viewerIndex}
              playing={playing}
              onPlayingChange={setPlaying}
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
