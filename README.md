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

Aplikasi ini tidak memanggil ERPNext langsung (kredensial API tetap di server, tidak pernah
ada di aplikasi mobile). Sebagai gantinya, ia memanggil endpoint REST `/api/mobile/*` yang
sudah live di production di `xsha-app` (repo `mtfkxvee/xshaweb`, lihat
`src/routes/api/mobile/*.ts` dan `src/lib/erpnext/mobile-request.ts`).

1. Salin `.env.example` ke `.env`.
2. Isi `EXPO_PUBLIC_API_URL=https://x-sha.id` (sudah default di `.env.example`).
3. Jalankan `npm run start` — data produk, promo, login, loyalty, dan riwayat transaksi
   sekarang berasal dari ERPNext produksi yang sama dengan website.

Endpoint yang tersedia: `products`, `products/:id`, `item-groups`, `promo-products`,
`promo-banners`, `outlets`, `auth/login`, `auth/logout`, `auth/me`, `loyalty`, `orders`
(GET+POST), dan `image-proxy` (untuk file "private" ERPNext seperti banner promo). Auth
pakai token (`Authorization: Bearer <sid>`) karena mobile tidak punya cookie jar seperti
browser — login mengembalikan `sid` ERPNext sebagai token JSON, disimpan di
`expo-secure-store`.

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
