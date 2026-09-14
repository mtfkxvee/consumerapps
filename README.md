# X-SHA Mobile

Aplikasi consumer (Android/iOS) untuk X-SHA — Heritage of Tasikmalaya, dibangun dengan
[Expo](https://expo.dev) + React Native + TypeScript. Berbagi backend ERPNext yang sama dengan
web app (`xsha-app`).

## Fitur

- Beranda: hero, promo, produk pilihan
- Katalog produk dengan filter kategori & pencarian
- Detail produk & keranjang belanja, checkout via WhatsApp
- Login & akun member: kartu member, poin loyalitas, riwayat transaksi

## Menjalankan

```sh
npm install
npm run start   # lalu scan QR dengan Expo Go, atau tekan a/i untuk emulator
```

Tanpa konfigurasi apa pun, aplikasi berjalan penuh dengan **data contoh (mock)** yang meniru
konten web app — cocok untuk demo/preview tanpa backend.

## Menghubungkan ke backend ERPNext (data asli)

Aplikasi ini tidak memanggil ERPNext langsung (kredensial API harus tetap di server, tidak
boleh ada di aplikasi mobile). Sebagai gantinya, ia memanggil endpoint REST `/api/mobile/*`
yang perlu ditambahkan ke project `xsha-app` (yang sudah menyimpan `ERPNEXT_URL` dan API
key/secret di server).

1. Salin `.env.example` ke `.env`, isi `EXPO_PUBLIC_API_URL` dengan domain xsha-app.
2. Tambahkan endpoint berikut di `xsha-app` (membungkus fungsi yang sudah ada di
   `src/lib/erpnext/*.ts`):

   | Method | Path                        | Sumber logic                          |
   | ------ | --------------------------- | -------------------------------------- |
   | GET    | `/api/mobile/products`      | `products.ts` → `getProducts`          |
   | GET    | `/api/mobile/products/:id`  | `products.ts` → `getProductById`       |
   | GET    | `/api/mobile/item-groups`   | `products.ts` → `getItemGroupChildren` |
   | GET    | `/api/mobile/promo-products`| `products.ts` → `getPromoProducts`     |
   | GET    | `/api/mobile/promo-banners` | `products.ts` → `getPromoBanners`      |
   | GET    | `/api/mobile/outlets`       | `outlets.ts` → `getOutlets`            |
   | POST   | `/api/mobile/auth/login`    | `auth.ts` → `loginCustomer` (kembalikan token, bukan cookie) |
   | POST   | `/api/mobile/auth/logout`   | `auth.ts` → `logoutCustomer`           |
   | GET    | `/api/mobile/auth/me`       | `auth.ts` → `getCurrentCustomer`       |
   | GET    | `/api/mobile/loyalty`       | `loyalty.ts` → `getMyLoyaltyStatus`    |
   | GET    | `/api/mobile/orders`        | `orders.ts` → `getMyOrders`            |
   | POST   | `/api/mobile/orders`        | `orders.ts` → `createOrder`            |

   Karena mobile tidak punya cookie jar seperti browser, endpoint auth login sebaiknya
   mengembalikan `sid` ERPNext sebagai token JSON (`{ ok: true, token }`), disimpan aplikasi
   di `expo-secure-store`, lalu dikirim balik sebagai header `Authorization: Bearer <token>`
   pada setiap request — endpoint lain tinggal membaca token itu dan memakainya sebagai
   `Cookie: sid=...` saat memanggil ERPNext (persis seperti `erpRequest` yang sudah ada).

3. Set `EXPO_PUBLIC_API_URL` dan jalankan ulang `npm run start`.

## Struktur

```
src/
  api/            (via lib/api) — panggilan ke backend + fallback mock
  components/     — komponen UI reusable (ProductCard, Screen)
  lib/            — types, format harga, mock data
  navigation/      — bottom tabs + stack per tab
  screens/         — layar-layar aplikasi
  state/          — CartContext, AuthContext
  theme/          — warna & tipografi (senada dengan web app)
```
