// Everything the album page says about itself lives here — edit copy in one place.
export const album = {
  /** Big heading under the dolphin tile. */
  title: 'Sep 27, 2026',
  /** Pill above the title. Set to null to hide it. */
  expires: 'EXPIRES OCTOBER 30',
  /** "Created by / Model / Help" line under the item count. */
  people: [
    {
      label: 'Created by',
      links: [
        { name: 'dta', url: 'https://t.me/dtaintent' },
        { name: 'ni24lab', url: 'https://t.me/ni24lab' },
      ],
    },
    {
      label: 'Model',
      links: [
        { name: 'elizabethmeunieer', url: 'https://instagram.com/elizabethmeunieer' },
        { name: 'uglymnstr7', url: 'https://instagram.com/uglymnstr7' },
      ],
    },
    {
      label: 'Help',
      links: [{ name: 'chikirao', url: 'https://t.me/chikikto' }],
    },
  ],
  /** Emoji inside the album tile. */
  emoji: '🐬',
  footer: {
    copyright: '© 2026 Dolphins Forever',
    privacyUrl: '#',
  },
} as const

/** Slideshow soundtrack credits, keyed by the mp3 file name in src/assets/audio. */
export const soundtrack: Record<string, { title: string; artist: string }> = {
  'dylan-thom-if-youre-gonna-kill-me': { title: "If You're Gonna Kill Me", artist: 'Dylan Thom' },
  'liam-mc-cay-clear': { title: 'Clear (feat. Dylan Thom)', artist: 'Liam Mc Cay' },
  'sacred-holes-tiger': { title: 'Tiger', artist: 'Sacred Holes' },
  'tal-castle-my-amazing-saturday': { title: 'My Amazing Saturday', artist: 'tal castle' },
  'after-300-dreams': { title: '300 dreams', artist: 'AFTER' },
}
