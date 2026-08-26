# საქორწილო მოსაწვევი — GitHub Pages

ეს პროექტი არის mobile-first საქორწილო მოსაწვევი, რომელიც პირდაპირ იხსნება ვიდეოზე, ავტომატურად უშვებს `ვიდეო 1`-ს, აქვს YouTube background music toggle, countdown, დღის განრიგი, Google Maps ბმულები და RSVP ფორმა.

## 1. ფაილების სტრუქტურა

```text
wedding-invitation/
├── .nojekyll
├── index.html
├── styles.css
├── script.js
└── assets/
    ├── fonts/
    │   ├── MCh-Ma-Si-Vardi.woff2   (თუ გაქვს)
    │   └── MCh-Ma-Si-Vardi.ttf     (ან ეს)
    └── media/
        ├── ვიდეო 1.mp4
        ├── ელემენტი 1.gif
        ├── ელემენტი 2.gif
        ├── ფოტო 1.jpg
        ├── წვეულება.jpg
        ├── ელემენტი 3.png
        ├── ელემენტი 4.png
        ├── ელემენტი 5.png
        ├── ელემენტი 6.png
        ├── ელემენტი 7.png
        └── ელემენტი 8.png
```

`ელემენტი 1`-დან `ელემენტი 8`-მდე, `ფოტო 1` და `წვეულება` შეიძლება იყოს `webp`, `png`, `gif`, `jpg`, `jpeg` ან `svg` — `script.js` გაფართოებას ავტომატურად ეძებს. სახელის ძირითადი ნაწილი ზუსტად უნდა ემთხვეოდეს.

ვიდეოსთვის რეკომენდებულია `ვიდეო 1.mp4` (H.264/AAC ან ვიდეო უხმოდ). ასევე მხარდაჭერილია `ვიდეო 1.webm`.

## 2. ფონტი

Typeface.ge-დან ჩამოტვირთე **MCh Ma Si Vardi**, შემდეგ ფონტის ფაილი გადაარქვი ერთ-ერთ სახელად:

- `MCh-Ma-Si-Vardi.woff2`
- `MCh-Ma-Si-Vardi.ttf`

და ჩააგდე `assets/fonts/` საქაღალდეში.

## 3. ქორწილის თარიღი — აუცილებლად შეცვალე

`script.js`-ის დასაწყისში არის:

```js
weddingDate: "2026-10-17T15:30:00+04:00",
```

აქ ჩაწერე რეალური ქორწილის თარიღი/დრო თბილისის timezone-ით. მაგალითად, თუ ქორწილი არის 2026 წლის 20 სექტემბერს 15:30-ზე:

```js
weddingDate: "2026-10-17T15:30:00+04:00",
```

## 4. მუსიკა

მოცემული YouTube ბმულის ვიდეო ID უკვე ჩაწერილია:

```js
musicVideoId: "HQNJTmyPdnw",
```

გვერდი გახსნისთანავე ეცდება მუსიკის ჩართვას. ზედა მარჯვენა მხარეს toggle-ით მუსიკა ითიშება/ირთვება.

### მნიშვნელოვანი მობილური შეზღუდვა

Chrome/Safari ხშირად არ რთავს **ხმიან autoplay-ს** მომხმარებლის პირველ შეხებამდე. ეს browser policy-ა და GitHub/JavaScript-ით გვერდის ავლით საიმედოდ ვერ იძულდება. ამიტომ კოდი:

1. გვერდის გახსნისთანავე ცდილობს დაკვრას;
2. პირველ `touch/pointer/key` interaction-ზე ხელახლა ცდილობს;
3. მთავარი `ვიდეო 1` meanwhile მაინც ავტომატურად, loop რეჟიმში, უხმოდ მიდის.

## 5. RSVP — სად მოვა პასუხები?

GitHub Pages static hosting-ია და თავისით მონაცემთა ბაზა არ აქვს.

`script.js`-ში არის:

```js
rsvpEndpoint: ""
```

თუ ცარიელია, ფორმა demo რეჟიმში მუშაობს და პასუხს მხოლოდ იმავე ტელეფონის `localStorage`-ში ინახავს.

რეალურად რომ მიიღო ყველა სტუმრის პასუხი ერთ Google Sheet-ში, საუკეთესო მარტივი ვარიანტია **Google Apps Script Web App endpoint**. მისი URL ჩასვი ასე:

```js
rsvpEndpoint: "https://script.google.com/macros/s/XXXXXXXX/exec"
```

Endpoint-მა უნდა მიიღოს JSON:

```json
{
  "fullName": "სახელი გვარი",
  "attendance": "სიამოვნებით დავესწრები",
  "submittedAt": "ISO date",
  "source": "Invitation URL"
}
```

## 6. GitHub Pages-ზე ატვირთვა

1. GitHub-ში შექმენი ახალი repository, მაგალითად `wedding-invitation`.
2. ამ პროექტის ყველა ფაილი ატვირთე repository-ის root-ში.
3. GitHub → **Settings** → **Pages**.
4. Source: **Deploy from a branch**.
5. Branch: `main`, Folder: `/ (root)`.
6. Save.
7. გამოჩნდება მისამართი დაახლოებით ასეთი ფორმით: `https://username.github.io/wedding-invitation/`.

## 7. ვიზუალური პრინციპი

- მთავარი mobile canvas: მაქს. 430px.
- რეალურ ტელეფონზე იკავებს მთელ ეკრანს.
- desktop-ზე ჩანს როგორც ცენტრირებული ტელეფონის ინტერფეისი.
- ძირითადი ფერი: `#CFE6DC`.
- ტექსტი, საათები, ცენტრალური timeline, borders და buttons იმავე mint ფერშია.
- ფონტი: `MCh Ma Si Vardi`.
- მთავარი ვიდეო: `100svh`, `autoplay`, `loop`, `playsinline`, `muted`, controls-ის გარეშე.
- timeline: მარცხენა/მარჯვენა მონაცვლეობით `ელემენტი 3–6`.
- RSVP დეკორი: `ელემენტი 7` და `ელემენტი 8`.

## 8. ორი რამ, რაც პროექტის დასრულებამდე უნდა ჩაანაცვლო

1. `script.js` → `weddingDate` უკვე დაყენებულია 2026-10-17 15:30-ზე (თბილისის დრო).
2. თუ RSVP პასუხების მიღება გინდა → `rsvpEndpoint`.

დანარჩენი ტექსტი, ადგილები, Google Maps ბმულები, YouTube music ID და asset სახელები უკვე ჩაწერილია.
