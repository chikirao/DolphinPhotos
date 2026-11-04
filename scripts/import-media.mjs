// One-time intake. Originals in newphotos/ are never modified or published.
// Requires ffmpeg on PATH for HEIC and silent H.264 loops.
import fs from 'node:fs/promises'
import path from 'node:path'
import { spawn } from 'node:child_process'
import sharp from 'sharp'

const root = path.resolve(import.meta.dirname, '..')
const input = path.join(root, 'newphotos')
const cache = path.join(root, 'node_modules/.cache/media-intake')
await fs.mkdir(cache, { recursive: true })
await fs.mkdir(path.join(root, 'src/videos'), { recursive: true })
const sequence = JSON.parse(await fs.readFile(path.join(root, 'src/photos/album.json'), 'utf8'))

function ffmpeg(args) {
  return new Promise((resolve, reject) => {
    const child = spawn('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...args])
    let error = ''
    child.stderr.on('data', (chunk) => { error += chunk })
    child.on('error', reject)
    child.on('exit', (code) => code === 0 ? resolve() : reject(new Error(error)))
  })
}

let done = 0
for (const item of sequence) {
  if (item.file.startsWith('demo-')) continue
  const video = item.file.endsWith('.mp4')
  const destination = path.join(root, video ? 'src/videos' : 'src/photos', item.file)
  const source = path.join(input, item.source)
  const poster = destination.replace(/\.mp4$/, '.webp')
  if (!process.argv.includes('--force') && await fs.stat(destination).catch(() => null)) {
    if (!video || await fs.stat(poster).catch(() => null)) continue
  }
  if (video) {
    await ffmpeg(['-i', source, '-map', '0:v:0', '-an', '-vf',
      "scale=w='min(960,iw)':h='min(960,ih)':force_original_aspect_ratio=decrease:force_divisible_by=2,fps=24",
      '-c:v', 'libx264', '-preset', 'slow', '-crf', '26', '-pix_fmt', 'yuv420p',
      '-movflags', '+faststart', '-map_metadata', '-1', destination])
    const frame = path.join(cache, `${item.file}.jpg`)
    await ffmpeg(['-i', destination, '-frames:v', '1', '-update', '1', '-q:v', '2', frame])
    await sharp(frame).webp({ quality: 86 }).toFile(poster)
    await fs.unlink(frame)
  } else {
    let decoded = source
    if (/\.heic$/i.test(source)) {
      decoded = path.join(cache, `${item.file}.jpg`)
      // FFmpeg assembles HEIC image grids and applies their display transform.
      await ffmpeg(['-i', source, '-frames:v', '1', '-update', '1', '-q:v', '2', decoded])
    }
    await sharp(decoded).rotate()
      .resize({ width: 2560, height: 2560, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 84, effort: 5 }).toFile(destination)
    if (decoded !== source) await fs.unlink(decoded)
  }
  done++
  if (done % 25 === 0) console.log(`Prepared ${done} media files`)
}
// Prepared WebPs are already viewer-ready. Record their dimensions so the
// build can reuse those bytes for both viewing and download, without a copy.
for (const item of sequence) {
  if (!item.file.startsWith('drop-')) continue
  const meta = await sharp(path.join(root, 'src/photos', item.file)).metadata()
  item.width = meta.width
  item.height = meta.height
}
await fs.writeFile(path.join(root, 'src/photos/album.json'), JSON.stringify(sequence, null, 2) + '\n')
console.log(`Intake complete: ${done} new files; source originals preserved.`)
