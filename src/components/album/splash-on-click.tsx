import type { ReactNode } from 'react'
import { FAN_LEFT, FAN_RIGHT, randomSplash } from '@/lib/splash'
import { useLottieBurst } from '@/lib/use-lottie-burst'
import { cn } from '@/lib/utils'

const ORIGIN: [number, number] = [256, 256]
const makeRight = (data: unknown) => randomSplash(data, ORIGIN, FAN_RIGHT)
const makeLeft = (data: unknown) => randomSplash(data, ORIGIN, FAN_LEFT)

/** Wraps a control so every click also throws a spray of 💦 drops from the
 *  pointer — the same spray as the "Dolphin Photos" wordmark. The wrapped
 *  control's own onClick still runs. */
export function SplashOnClick({
  children,
  direction = 'left',
  className,
}: {
  children: ReactNode
  direction?: 'left' | 'right'
  className?: string
}) {
  const splash = useLottieBurst({
    asset: 'logoSplash',
    size: 200,
    origin: ORIGIN,
    randomize: direction === 'left' ? makeLeft : makeRight,
  })
  return (
    <span className={cn('relative inline-flex', className)} onClick={splash.play}>
      {children}
      <div ref={splash.ref} aria-hidden className="z-50" style={splash.style} />
    </span>
  )
}
