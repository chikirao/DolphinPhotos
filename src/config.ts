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
  /** Filename of the zip produced by "Download Album". */
  zipName: 'DolphinPhotos.zip',
  footer: {
    copyright: '© 2026 Dolphins Forever',
    privacyUrl: '#',
    termsUrl: '#',
  },
} as const
