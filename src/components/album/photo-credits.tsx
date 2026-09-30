import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'

// Attribution for borrowed photos lives next to them as a markdown list:
// `- file — [title](url) — author — license`. No file → no footer link.
const source = Object.values(
  import.meta.glob<string>('../../photos/*CREDITS.md', { eager: true, query: '?raw', import: 'default' }),
)[0]

interface Credit {
  file: string
  title: string
  url: string
  author: string
  license: string
}

const credits: Credit[] = (source ?? '')
  .split('\n')
  .map((line) => line.match(/^- (.+?) — \[(.+?)\]\((.+?)\) — (.+) — (.+)$/))
  .filter((m) => m !== null)
  .map(([, file, title, url, author, license]) => ({ file, title, url, author, license }))

export const hasPhotoCredits = credits.length > 0

export function PhotoCreditsLink() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="cursor-pointer hover:underline">
        Photo Credits
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent size="lg">
          <DialogHeader>
            <DialogTitle>Photo Credits</DialogTitle>
            <DialogDescription>Photos from Wikimedia Commons, used under their licenses.</DialogDescription>
          </DialogHeader>
          <ol className="mt-4 flex max-h-[60vh] flex-col gap-2.5 overflow-y-auto pr-1 text-[13px] leading-snug">
            {credits.map((c) => (
              <li key={c.file} className="flex gap-3">
                <span className="w-6 shrink-0 text-right text-black/40 tabular-nums">{c.file.match(/\d+/)?.[0]}</span>
                <span>
                  <a href={c.url} target="_blank" rel="noreferrer" className="text-[#0071e3] hover:underline">
                    {c.title.replace(/\.(jpe?g|png)$/i, '')}
                  </a>
                  <span className="text-black/56">
                    {' '}
                    — {c.author} · {c.license}
                  </span>
                </span>
              </li>
            ))}
          </ol>
        </DialogContent>
      </Dialog>
    </>
  )
}
