import { useEffect, useRef, useState } from 'react'

// Share two observers across the album rather than one pair per photo.
const pools = new Map<string, { observer: IntersectionObserver; listeners: Map<Element, (visible: boolean) => void> }>()
function subscribe(element: Element, margin: string, listener: (visible: boolean) => void) {
  let pool = pools.get(margin)
  if (!pool) {
    const listeners = new Map<Element, (visible: boolean) => void>()
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) listeners.get(entry.target)?.(entry.isIntersecting)
    }, { rootMargin: margin })
    pool = { observer, listeners }
    pools.set(margin, pool)
  }
  pool.listeners.set(element, listener)
  pool.observer.observe(element)
  return () => {
    pool.observer.unobserve(element)
    pool.listeners.delete(element)
    if (!pool.listeners.size) {
      pool.observer.disconnect()
      pools.delete(margin)
    }
  }
}

export function useMediaVisibility() {
  const ref = useRef<HTMLDivElement>(null)
  const [near, setNear] = useState(false)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const offNear = subscribe(el, '900px 0px', setNear)
    const offVisible = subscribe(el, '0px', setVisible)
    return () => { offNear(); offVisible() }
  }, [])
  return { ref, near, visible }
}
