# Oak & Iron — сайт-визитка барбершопа с локальным SEO

**Демо:** https://kislxta.github.io/oak-iron-barbershop/
— русская версия (Москва): https://kislxta.github.io/oak-iron-barbershop/ru/
— English version (Brooklyn, NY): https://kislxta.github.io/oak-iron-barbershop/en/

> Демо-проект для портфолио. Бренд, адрес, телефон и отзывы вымышлены.

[English below](#english)

## Что это

Одностраничный сайт барбершопа, который решает две задачи владельца:
1. **Клиенты находят барбершоп в поиске и на картах** — техническое и локальное SEO под Яндекс и Google.
2. **Клиенты записываются сами** — свободное время видно сразу на первом экране, запись занимает меньше минуты.

Один шаблон собран в двух версиях под разные рынки: Москва (рубли, Яндекс Карты, 24-часовой формат) и Бруклин (доллары, Google Maps, 12-часовой формат, чаевые в FAQ).

## Что внутри

| Блок | Зачем |
|---|---|
| Свободное время на первом экране | Клиент нажимает на время и сразу попадает в форму записи |
| Прайс в виде вывески барбершопа | Цены, длительность и что входит — без звонка администратору |
| Барберы | Кнопка «Записаться к …» подставляет мастера в форму |
| Как записаться | Снимает вопрос «а что дальше?» |
| FAQ | Ответы на частые вопросы и поисковые запросы («сколько стоит мужская стрижка») |
| Контакты и схема проезда | Адрес, метро, часы, ссылка в Яндекс/Google Карты |
| Нижняя панель на телефоне | «Позвонить» и «Записаться» всегда под пальцем |

**Форма записи:** выбор услуги, барбера, даты и только свободного времени; маска телефона; проверка полей с понятными ошибками; защита от спам-ботов (скрытое поле); цели аналитики `booking_open` и `booking_submit` для Яндекс Метрики и GA4. В рабочей версии заявка уходит администратору в Telegram (проект 3 портфолио — бот записи).

## SEO

- Уникальные title и description под локальные запросы («барбершоп у Павелецкой», «barbershop Williamsburg»).
- Разметка Schema.org `HairSalon`: адрес, координаты, часы работы, цены услуг (`OfferCatalog`), способы оплаты.
- Разметка `FAQPage`.
- Open Graph и Twitter-карточки с отдельной картинкой для каждой версии.
- `sitemap.xml`, `robots.txt`, canonical, страница 404.
- Семантическая разметка, один H1, доступность (клавиатура, контраст, `prefers-reduced-motion`).
- Без внешних шрифтов и библиотек: весь код страницы — около 15 КБ в сжатом виде.

Подробно — в [SEO-CHECKLIST.md](SEO-CHECKLIST.md).

## Технологии

HTML, CSS, чистый JavaScript (без фреймворков). Сборка — Python + Jinja2: один шаблон, тексты в `src/data/ru.json` и `en.json`. Хостинг — GitHub Pages.

```
python build.py --base https://<user>.github.io/<repo> --telegram https://t.me/<bot>
```

Чтобы адаптировать под другого клиента, достаточно поменять JSON с текстами, ценами, адресом и часами работы.

## Структура

```
src/templates/site.html.j2   шаблон страницы
src/data/ru.json, en.json    контент и данные для разметки
src/assets/                  стили, скрипт, иконки, OG-картинки
tools/                       генерация картинок, скриншоты, автотест формы
dist/                        готовый сайт (выкладывается на хостинг)
```

---

## English

**Live demo:** https://kislxta.github.io/oak-iron-barbershop/en/

A one-page barbershop website built to do two jobs for the owner: get found in local search and on maps, and let clients book themselves. The same template ships in two market versions — Moscow (Yandex, RUB, 24-hour clock) and Brooklyn, NY (Google, USD, 12-hour clock, tipping FAQ).

**Highlights**
- Open slots right in the hero: tap a time and the booking form opens pre-filled.
- Price list styled as a classic barbershop sign, with durations and what's included.
- Booking form: service, barber, date, open times only; phone mask; inline validation; honeypot spam protection; analytics goals for GA4 / Yandex Metrica.
- Local SEO: `HairSalon` structured data (address, geo, hours, priced services), `FAQPage`, Open Graph, sitemap, robots, canonical.
- No frameworks, no web fonts: the whole page is ~15 KB gzipped. Accessible: keyboard focus, contrast, reduced motion.
- Built with a Python + Jinja2 generator, so a new client is a new JSON file.

*Portfolio demo. The brand, address, phone number and reviews are fictional.*
