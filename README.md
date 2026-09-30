# DolphinPhotos 🐬

Фотографии дропа [@dtaintent](https://t.me/dtaintent) × [@ni24lab](https://t.me/ni24lab), оформленные в стиле общего альбома iCloud Photos.

Это статический сайт: Vite + React + Tailwind, компоненты и анимации из [Fluid Functionalism](https://www.fluidfunctionalism.com/), хостинг на GitHub Pages.

## Как добавить фото

1. Положи файлы (`.jpg`, `.png`, `.webp`) в `src/photos/`. Они идут в порядке имён файлов: `01.jpg`, `02.jpg`, …
2. Закоммить и запушь в `main`. GitHub Actions соберёт и задеплоит сайт.

Превью и версии для просмотрщика генерируются при сборке, а оригиналы отдаются для скачивания как есть.

## Разработка

```bash
npm install
npm run dev
```

Все тексты альбома (заголовок, «Expires», автор, ссылки) лежат в `src/config.ts`.
