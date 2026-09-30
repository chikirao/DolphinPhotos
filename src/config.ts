// Everything the album page says about itself lives here — edit copy in one place.
export const album = {
  /** Big heading under the dolphin tile. */
  title: 'Sep 27, 2026',
  /** Pill above the title. Set to null to hide it. */
  expires: 'EXPIRES OCTOBER 30',
  createdBy: 'Иван Конанчук',
  /** Emoji inside the album tile. */
  emoji: '🐬',
  /** Filename of the zip produced by "Download Album". */
  zipName: 'DolphinPhotos.zip',
  /** Designers behind the drop — shown in the credits dialog. */
  credits: [
    { name: 'Диана ДТА', handle: 'dtaintent', url: 'https://t.me/dtaintent' },
    { name: 'Никита Иванец', handle: 'ni24lab', url: 'https://t.me/ni24lab' },
  ],
  reportUrl: 'https://t.me/ni24lab',
  footer: {
    copyright: 'Copyright © 2026 Apple Inc. All rights reserved.',
    privacyUrl: '#',
    termsUrl: '#',
  },
} as const
