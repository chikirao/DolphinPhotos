/** Fires the full-screen splash easter egg (see components/album/splash-rain). */
export function splashRain() {
  window.dispatchEvent(new Event('splash-rain'))
}
