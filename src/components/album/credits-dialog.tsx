import { ArrowUpRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { album } from '@/config'

export function CreditsDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>
            {album.emoji} {album.title}
          </DialogTitle>
          <DialogDescription>Фотографии дропа. Больше — в телеграме у дизайнеров.</DialogDescription>
        </DialogHeader>
        <div className="mt-4 flex flex-col gap-2">
          {album.credits.map((c) => (
            <Button
              key={c.handle}
              asChild
              variant="tertiary"
              trailingIcon={ArrowUpRight}
              className="justify-between rounded-lg"
            >
              <a href={c.url} target="_blank" rel="noreferrer">
                <span className="flex w-full items-center justify-between gap-3">
                  <span>{c.name}</span>
                  <span className="text-muted-foreground">@{c.handle}</span>
                </span>
              </a>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
