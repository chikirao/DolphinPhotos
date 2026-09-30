// Builds a fresh, randomized spray from the 💦 drops in logo-splash.json, so
// every tap scatters drops along different, snappy trajectories.

interface Keyframe {
  t: number
  s: number[]
  i?: { x: number | number[]; y: number | number[] }
  o?: { x: number | number[]; y: number | number[] }
  to?: number[]
  ti?: number[]
}
interface Prop {
  a: 0 | 1
  k: Keyframe[] | number[]
}
interface Layer {
  ind: number
  ip: number
  op: number
  ks: { p: Prop; s: Prop; r: Prop; [key: string]: unknown }
  [key: string]: unknown
}
interface Comp {
  ip: number
  op: number
  layers: Layer[]
  [key: string]: unknown
}

const DROPS = 7
/** Screen angles the spray covers (0° = right, 90° = down): a fan to the
 *  lower right, never up past the top of the page. */
const FAN: [number, number] = [5, 80]
const rand = (min: number, max: number) => min + Math.random() * (max - min)
const deg = (rad: number) => (rad * 180) / Math.PI

/** Moves every animated keyframe under `node` from [from, from + span] onto
 *  [to, to + life] — the drop art morphs (forms) over the layer's lifetime. */
function retime(node: unknown, from: number, span: number, to: number, life: number) {
  if (Array.isArray(node)) {
    for (const item of node) retime(item, from, span, to, life)
    return
  }
  if (!node || typeof node !== 'object') return
  const obj = node as Record<string, unknown>
  if (obj.a === 1 && Array.isArray(obj.k)) {
    for (const kf of obj.k as Keyframe[]) kf.t = to + ((kf.t - from) / span) * life
  }
  for (const key in obj) retime(obj[key], from, span, to, life)
}

export function randomSplash(base: unknown, origin: [number, number]): Comp {
  const src = base as Comp
  const out: Comp = structuredClone(src)
  const templates = src.layers
  out.layers = []

  for (let n = 0; n < DROPS; n++) {
    const layer: Layer = structuredClone(templates[n % templates.length])
    const p = layer.ks.p.k as Keyframe[]
    const r = layer.ks.r.k as Keyframe[]

    // The drop art is drawn pointing along its original flight — keep that
    // relation by rotating it as much as the new heading differs.
    const origAngle = deg(Math.atan2(p[1].s[1] - p[0].s[1], p[1].s[0] - p[0].s[0]))
    const slot = FAN[0] + ((FAN[1] - FAN[0]) * (n + 0.5)) / DROPS
    const angle = slot + rand(-10, 10)
    const turn = angle - origAngle

    const dist = rand(150, 270)
    const dx = Math.cos((angle * Math.PI) / 180) * dist
    const dy = Math.sin((angle * Math.PI) / 180) * dist
    const lift = rand(10, 35) // arcs the path up a little, like it has weight

    const start = rand(0, 6)
    const life = rand(24, 34) // ~0.4–0.55 s at 60 fps
    const end = start + life
    const size = rand(28, 48)

    retime(layer.shapes, layer.ip, layer.op - layer.ip, start, life)
    layer.ind = n + 1
    layer.ip = start
    layer.op = end
    p.length = 2
    p[0] = {
      t: start,
      s: [origin[0], origin[1], 0],
      to: [dx * 0.4, dy * 0.4 - lift, 0],
      ti: [0, 0, 0],
      // Sharp launch, quick settle: most of the distance happens up front.
      o: { x: 0.05, y: 0.75 },
      i: { x: 0.3, y: 1 },
    }
    p[1] = { t: end, s: [origin[0] + dx, origin[1] + dy, 0] }

    const r0 = (r[0]?.s[0] ?? 0) + turn
    layer.ks.r = {
      a: 1,
      k: [
        { t: start, s: [r0], o: { x: [0.2], y: [0] }, i: { x: [0.4], y: [1] } },
        { t: end, s: [r0 + rand(15, 45) * Math.sign(dx || 1)] },
      ],
    }
    // The drop art grows and shrinks by itself (path morph, retimed above).
    layer.ks.s = { a: 0, k: [size, size, 100] }
    out.layers.push(layer)
  }

  out.ip = 0
  out.op = Math.ceil(Math.max(...out.layers.map((l) => l.op)))
  return out
}
