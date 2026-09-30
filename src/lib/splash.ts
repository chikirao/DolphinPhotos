// Builds a fresh, randomized spray from the 💦 drops in logo-splash.json, so
// every tap scatters drops along different trajectories.

type Vec = number[]
interface ShapePath {
  v: Vec[]
  i: Vec[]
  o: Vec[]
  c: boolean
}
interface Keyframe {
  t: number
  s: unknown[]
  [key: string]: unknown
}
interface Layer {
  ind: number
  ip: number
  op: number
  ks: Record<string, unknown>
  shapes: unknown[]
  [key: string]: unknown
}
interface Comp {
  ip: number
  op: number
  layers: Layer[]
  [key: string]: unknown
}

const DROPS = 8
/** Screen angles a spray covers (0° = right, 90° = down). */
export const FAN_RIGHT: [number, number] = [5, 80]
export const FAN_LEFT: [number, number] = [100, 175]
/** Launches happen in a few bursts spread over this many frames (60 fps). */
const EMIT_SPAN = 62
const BURSTS = 4
/** Which way each drop's round end points in its own art (deg, 0° = right,
 *  90° = down), read off the rendered shapes. The 💦 comp reuses three drops. */
const ART_HEADING: Record<string, number> = {
  'Layer 52': 33, 'Layer 55': 33, 'Layer 58': 33,
  'Layer 54': -4, 'Layer 57': -4,
  'Layer 53': 71, 'Layer 56': 71,
}
const rand = (min: number, max: number) => min + Math.random() * (max - min)

/** The widest keyframe of the drop's main path — the fully formed drop. */
function peakTime(layer: Layer): number {
  const group = layer.shapes[0] as { it: { ty: string; ks: { a: number; k: Keyframe[] } }[] }
  const path = group.it.find((x) => x.ty === 'sh')!
  let best = path.ks.k[0]
  let bestW = -1
  for (const kf of path.ks.k) {
    if (!kf.s) continue
    const v = (kf.s[0] as ShapePath).v
    const w = Math.max(...v.map((p) => p[0])) - Math.min(...v.map((p) => p[0]))
    if (w > bestW) {
      bestW = w
      best = kf
    }
  }
  return best.t
}

/** Replaces every animated property under `node` with its value at time `t`,
 *  so the drop art stops morphing and we drive size and motion ourselves. */
function freeze(node: unknown, t: number) {
  if (Array.isArray(node)) {
    for (const item of node) freeze(item, t)
    return
  }
  if (!node || typeof node !== 'object') return
  const obj = node as Record<string, unknown>
  if (obj.a === 1 && Array.isArray(obj.k)) {
    const kfs = (obj.k as Keyframe[]).filter((kf) => kf.s)
    let near = kfs[0]
    for (const kf of kfs) if (Math.abs(kf.t - t) < Math.abs(near.t - t)) near = kf
    obj.a = 0
    obj.k = near.s.length === 1 ? near.s[0] : near.s
    return
  }
  for (const key in obj) freeze(obj[key], t)
}

/** The drop's body center in layer space, and the way its round end points. */
function heading(layer: Layer): { angle: number; center: Vec } {
  const group = layer.shapes[0] as { it: { ty: string; ks: { k: ShapePath }; p?: { k: Vec }; a?: { k: Vec } }[] }
  const v = group.it.find((x) => x.ty === 'sh')!.ks.k.v
  const tr = group.it.find((x) => x.ty === 'tr')!
  const cx = v.reduce((a, p) => a + p[0], 0) / v.length
  const cy = v.reduce((a, p) => a + p[1], 0) / v.length
  // Group transform places the art in layer space.
  const off = [tr.p!.k[0] - tr.a!.k[0], tr.p!.k[1] - tr.a!.k[1]]
  return { angle: ART_HEADING[layer.nm as string] ?? 0, center: [cx + off[0], cy + off[1], 0] }
}

export function randomSplash(base: unknown, origin: [number, number], fan = FAN_RIGHT): Comp {
  const src = base as Comp
  // The drop art has a curled tail swept for rightward flight; mirror it for
  // sprays that head left so the curl still trails behind.
  const mirror = (fan[0] + fan[1]) / 2 > 90
  const out: Comp = structuredClone(src)
  out.layers = []

  // A few bursts; each drop joins one, so some leave together.
  const bursts = Array.from({ length: BURSTS }, (_, n) => (EMIT_SPAN * n) / (BURSTS - 1) + rand(-4, 4))
  const starts = Array.from({ length: DROPS }, (_, n) => Math.max(0, bursts[n % BURSTS] + rand(0, 3)))
  const slots = Array.from({ length: DROPS }, (_, n) => n).sort(() => Math.random() - 0.5)

  for (let n = 0; n < DROPS; n++) {
    const layer: Layer = structuredClone(src.layers[n % src.layers.length])
    freeze(layer.shapes, peakTime(layer))
    const art = heading(layer)
    // Mirroring flips the art's heading about the vertical axis.
    const artAngle = mirror ? 180 - art.angle : art.angle
    const sx = mirror ? -1 : 1

    const slot = fan[0] + ((fan[1] - fan[0]) * (slots[n] + 0.5)) / DROPS
    const angle = slot + rand(-8, 8)
    const rad = (angle * Math.PI) / 180
    const dist = rand(150, 240)
    const dir = [Math.cos(rad), Math.sin(rad)]
    // Weight: every path bends toward the ground. Drops thrown sideways curve
    // down a lot; drops already heading down barely change course.
    const fall = rand(90, 150)
    const dx = dir[0] * dist * 0.85
    const dy = dir[1] * dist * 0.85 + fall

    const start = starts[n]
    const life = rand(38, 50) // ~0.65–0.85 s at 60 fps
    const end = start + life
    const grown = start + life * 0.2
    const size = rand(30, 46)

    layer.ind = n + 1
    layer.ao = 0
    layer.ip = start
    layer.op = end
    layer.ks = {
      o: { a: 0, k: 100 },
      // Anchor on the drop itself so it scales and points around its own body.
      a: { a: 0, k: art.center },
      // Round end leads: start along the launch direction, end pointing down
      // (the path arrives falling), turning as the path bends.
      r: {
        a: 1,
        k: [
          { t: start, s: [angle - artAngle], o: { x: [0.2], y: [0.6] }, i: { x: [0.55], y: [1] } },
          { t: end, s: [90 - artAngle] },
        ],
      },
      p: {
        a: 1,
        k: [
          // Quick launch that keeps gliding until the drop is gone.
          {
            t: start,
            s: [origin[0], origin[1], 0],
            // Leave along the launch direction, arrive falling.
            to: [dir[0] * dist * 0.45, dir[1] * dist * 0.45, 0],
            ti: [0, -fall * 0.7, 0],
            o: { x: 0.2, y: 0.6 },
            i: { x: 0.55, y: 1 },
          },
          { t: end, s: [origin[0] + dx, origin[1] + dy, 0] },
        ],
      },
      s: {
        a: 1,
        k: [
          // Pops to full size fast, then shrinks steadily while still flying.
          { t: start, s: [8 * sx, 8, 100], o: { x: [0.15, 0.15, 0.15], y: [0.8, 0.8, 0.8] }, i: { x: [0.4, 0.4, 0.4], y: [1, 1, 1] } },
          { t: grown, s: [size * sx, size, 100], o: { x: [0.3, 0.3, 0.3], y: [0, 0, 0] }, i: { x: [0.6, 0.6, 0.6], y: [1, 1, 1] } },
          { t: end, s: [0, 0, 100] },
        ],
      },
    }
    out.layers.push(layer)
  }

  out.ip = 0
  out.op = Math.ceil(Math.max(...out.layers.map((l) => l.op)))
  return out
}
