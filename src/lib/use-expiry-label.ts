import { useEffect, useState } from 'react'
import { getExpiryLabel, nextLocalMidnightDelay } from './expiry-date'

export function useExpiryLabel(fallback: string) {
  const [label, setLabel] = useState(() => getExpiryLabel(undefined, fallback))
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>
    const refresh = () => {
      setLabel(getExpiryLabel(undefined, fallback))
      clearTimeout(timer)
      schedule()
    }
    const schedule = () => { timer = setTimeout(refresh, nextLocalMidnightDelay()) }
    const onVisible = () => { if (!document.hidden) refresh() }
    schedule()
    window.addEventListener('focus', refresh)
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('focus', refresh)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [fallback])
  return label
}
