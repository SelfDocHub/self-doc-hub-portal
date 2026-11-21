# self-doc-hub-portal

Публичный сайт документации на Nuxt 3 (SSR). Берёт все данные из публичного API docs-hub
(`/public/v1/...`, описание — `docs_viewer/docs/public-swagger.json`) и рисует их: меню версии, страницы с текстом,
методы API (параметры, тело запроса, ответы, ошибки, примеры), поиск, переключатель версий / языка / светлой и тёмной
темы, логотипы, футер и дизайн-токены сайта.

Один экземпляр обслуживает **несколько доменов**: домен берётся из `Host` запроса и передаётся в docs-hub в заголовке
`X-Public-Domain`.

## Запуск в Docker

```bash
cp .env.example .env        # поправьте NUXT_DOCS_HUB_URL
docker compose up -d --build
```

Сайт — на `http://localhost:3000` (порт: `PORTAL_PORT`). Домен в docs-hub должен совпадать с хостом, по которому
открывают сайт (например, `docs.example.com`). Для локальной проверки задайте `NUXT_DOMAIN_OVERRIDE=docs.example.com`,
тогда любой хост будет трактоваться как этот домен.

Образ без compose: `docker build -t self-doc-hub-portal . && docker run -p 3000:3000 -e NUXT_DOCS_HUB_URL=http://hub:8080 self-doc-hub-portal`.

## Настройки (переменные окружения, читаются при старте)

| Переменная | По умолчанию | Назначение |
| --- | --- | --- |
| `NUXT_DOCS_HUB_URL` | `http://localhost:8080` (в compose — `http://host.docker.internal:8080`) | Адрес docs-hub, доступный из контейнера, без `/` в конце. |
| `NUXT_DOMAIN_OVERRIDE` | пусто | Если задан, всегда отправляется в `X-Public-Domain` вместо `Host`. |
| `NUXT_TRUST_PROXY` | `false` | `true` — доверять `X-Forwarded-Host` / `X-Forwarded-Proto`. Включайте только за своим reverse-proxy. |
| `NUXT_SITE_ORIGIN` | пусто | Публичный origin для `sitemap.xml`, напр. `https://docs.example.com`. |
| `PORTAL_PORT` | `3000` | Порт на хосте (только compose). |

Портал за reverse-proxy (nginx, Caddy, Traefik): передавайте исходный `Host` (или `X-Forwarded-Host` + `NUXT_TRUST_PROXY=true`).

## Маршруты

Не основной язык сайта открывается под префиксом `/{lang}` (`/ru/...`), основной — без префикса (его адрес с префиксом
`/en/...` редиректится на канонический). Неизвестный язык — 404.

| URL | Что |
| --- | --- |
| `/`, `/{lang}` | редирект на версию по умолчанию |
| `/{version}` | обзор версии (сервисы и их методы) |
| `/{version}/{id}/{slug}` | страница или метод; `id` — id узла из дерева, `slug` — декоративная часть (метод + путь / заголовок), при несовпадении 301 на канонический адрес |
| `/endpoints/{id}`, `/pages/{id}` | адреса, на которые ссылаются `llms.txt` / `llms-full.txt`; 301 на канонический адрес узла |
| `/robots.txt`, `/llms.txt`, `/llms-full.txt` | из `GET /public/v1/robots`, `/llms.txt`, `/llms-full.txt` (`?version=`, язык — префиксом: `/ru/llms.txt`); 404, если SEO их отключил |
| `/sitemap.xml` | карта сайта версии по умолчанию: по записи на страницу и язык, с `hreflang` и `x-default` |
| `/_hub/branding/{kind}`, `/_hub/social-image`, `/_hub/assets/{version}/{name}` | прокси логотипов, превью-картинки и картинок страниц |
| `/api/*` | внутренние маршруты портала (site, i18n, tree, node, search, health) |

Скрытая версия открывается ссылкой предпросмотра docs-hub: `/{version}?preview=<token>` — токен сохраняется в cookie на час
и отправляется как `X-Preview-Token`; такие ответы не кэшируются, страницы получают `noindex`, счётчики не подключаются.

## Как это устроено

- Браузер **не ходит в docs-hub напрямую**: все запросы идут через серверные маршруты Nuxt (`server/api`, `server/routes`),
  которые подставляют `X-Public-Domain` / `X-Preview-Token`. CORS в docs-hub настраивать не нужно.
- Дизайн-токены (`tokens.light/dark`, шрифт, радиус, плотность, ширина) превращаются в CSS-переменные в `<head>` при SSR;
  значения валидируются (только `#rrggbb[aa]`, шрифты из фиксированного списка). Тема: авто (по системе) / светлая / тёмная,
  выбор хранится в cookie.
- Язык — часть адреса. Название сайта, шаблон заголовка, описание, ключевые слова, ссылки шапки и футер приходят из
  `GET /public/v1/site?lang=`, тексты интерфейса (`site.*`, `export.doc.*`) — из `/public/v1/i18n/{lang}`. Переключатель языка
  открывает ту же страницу под префиксом выбранного языка (полная перезагрузка).
- SEO из API: заголовок по `title_template` (`{page}`, `{site}`), `description`, `keywords`, `canonical`, `hreflang` и `x-default`,
  Open Graph и Twitter/X (`social`, картинка через `/_hub/social-image`), коды проверки Google / Яндекс / Bing (`verification`),
  `noindex` (закрытый сайт или предпросмотр), счётчики Google Analytics и Яндекс.Метрики (`analytics`): из API берутся только
  идентификаторы, скрипты подключает сам портал, идентификаторы проверяются по формату.
- Текст документации приходит блоками (`paragraph`, `heading`, `code`, `list_item`, `table`, `image`) и рисуется компонентами Vue
  без `v-html`: HTML из документации исполниться не может; ссылки допускаются только `http(s)`, `mailto`, относительные и `#`.
- Ограничения docs-hub (`429`) и недоступность сервиса показываются как ошибка страницы; неизвестный домен / версия / файл — `404`.

## Разработка

```bash
npm install
NUXT_DOCS_HUB_URL=http://localhost:8080 NUXT_DOMAIN_OVERRIDE=docs.example.com npm run dev
npm run typecheck
```

Требуется Node.js 20+.
