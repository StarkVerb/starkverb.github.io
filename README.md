# StarkVerb

Прототип сайта Android-тренажёра немецкого языка. Русскоязычные пояснения дополнены немецкими формами и примерами.

## Локальный просмотр

В каталоге сайта выполните:

```sh
node build.mjs
node preview.mjs
```

Сервер печатает локальный адрес. Для быстрого просмотра без сервера можно открыть `dist/index.html` в браузере и выбирать уроки через локальные HTML-файлы.

## Развитие

- `lessons.mjs` содержит уроки, таблицы, задания и ссылки на источники.
- `build.mjs` готовит страницы, канонические ссылки, JSON-LD, карту сайта и robots.txt. Задайте `STARKVERB_ORIGIN` при сборке под постоянный домен.
- `dist/assets` содержит стили, логику упражнений, обложку и значок.
- Ссылка Google Play ведёт на пакет `com.tempdev.starkdeutsch`. Доступность карточки в магазине нужно подтвердить перед открытием сайта для широкой аудитории.

## Обложка

Файл `dist/assets/berlin.jpg` получен встроенным ImageGen, уменьшен до 960 × 1200 и сохранён в JPEG для веба.

> Photorealistic editorial travel photograph for a modern German language learning website. Brandenburg Gate in Berlin viewed straight-on from low in the broad open plaza, large stone columns and accurate quadriga silhouette. Moody cinematic dark pine green duotone with a muted warm amber sunset light on stone, textured film grain, calm open foreground, dramatic thick clouds with subtle green highlights. Quiet, timeless architectural photography, no tourists, no cars, no signage. Portrait 4:5 framing, monument centered and occupying middle third of composition so that architectural detail remains visible around an overlaid small product card. No letters, no logos, no UI, no watermark.
