import { LayoutGroup, useInView } from 'framer-motion'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AlbumFooter } from '@/components/album/album-footer'
import { AlbumHero } from '@/components/album/album-hero'
import { AlbumToolbar } from '@/components/album/album-toolbar'
import { AppHeader } from '@/components/album/app-header'
import { PhotoGrid } from '@/components/album/photo-grid'
import { PhotoViewer } from '@/components/album/photo-viewer'
import { SplashRain } from '@/components/album/splash-rain'
import { TooltipProvider } from '@/components/ui/tooltip'
import { photos as allPhotos } from '@/lib/photos'

export default function App() {
  const [square, setSquare] = useState(false)
  const [reversed, setReversed] = useState(false)
  const [zoom, setZoom] = useState(3)
  const [viewerIndex, setViewerIndex] = useState<number | null>(null)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(false)
  const [volume, setVolume] = useState(0.8)
  // The photo the viewer was opened on: only it flies between grid and viewer;
  // stepping to other photos crossfades inside the viewer.
  const [openedId, setOpenedId] = useState<string | null>(null)

  const heroRef = useRef<HTMLDivElement>(null)
  const heroVisible = useInView(heroRef, { margin: '-44px 0px 0px 0px', initial: true })

  const photos = useMemo(() => (reversed ? [...allPhotos].reverse() : allPhotos), [reversed])
  const currentId = viewerIndex === null ? null : (photos[viewerIndex]?.id ?? null)
  const activeId = currentId !== null && currentId === openedId ? currentId : null

  // Each photo has its own link: #12 is the 12th photo of the album. Opening
  // the viewer adds a history entry, so Back closes it instead of leaving.
  const openFromHash = useCallback(() => {
    const n = Number(location.hash.slice(1))
    const photo = Number.isInteger(n) ? allPhotos[n - 1] : undefined
    if (!photo) {
      setViewerIndex(null)
      setPlaying(false)
      return
    }
    setOpenedId(photo.id)
    setViewerIndex(photos.indexOf(photo))
  }, [photos])
  const syncFromHash = useRef(openFromHash)
  syncFromHash.current = openFromHash
  useEffect(() => {
    if (location.hash) syncFromHash.current()
    const onPop = () => syncFromHash.current()
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])
  useEffect(() => {
    const photo = allPhotos.find((p) => p.id === currentId)
    const hash = photo ? `#${allPhotos.indexOf(photo) + 1}` : ''
    if (location.hash === hash) return
    const url = location.pathname + location.search + hash
    if (!hash) {
      // Closed from the UI: step back over our own entry, or just drop the hash.
      if (history.state?.viewer) history.back()
      else history.replaceState(null, '', url)
    } else if (location.hash) history.replaceState(history.state, '', url)
    else history.pushState({ viewer: true }, '', url)
  }, [currentId])

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
              volume={volume}
              onVolumeChange={setVolume}
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
        <SplashRain />
      </div>
    </TooltipProvider>
  )
}
