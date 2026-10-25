# Gallery Idea

Portofolio ide pribadi: unggah ide lengkap (teks, foto, video, HTML, GLB, CAD), atasan menilai via link privat tanpa login, admin mengunci ide, grafik aktivitas per bulan.

## Isi

- **Landing page publik** (`/`) — galeri ide terbuka; ide terkunci "judul saja" hanya menampilkan judul; ide tersembunyi tidak muncul.
- **Admin** (`/admin`) — login satu akun, CRUD ide, upload file < 100 MB langsung ke Vercel Blob, 3 status kunci, grafik bar ide/bulan, jejak penilaian + riwayat versi.
- **Review page** (`/review/<token>`) — atasan nilai tanpa login; link bisa diregenerasi.

## Setup

```bash
npm install
cp .env.example .env.local
# isi .env.local:
#   DATABASE_URL          -> connection string Neon (neon.tech, gratis)
#   BLOB_READ_WRITE_TOKEN -> dari Vercel > Storage > Blob store
#   SESSION_SECRET        -> string acak 32+ karakter
#   ADMIN_USERNAME / ADMIN_PASSWORD

npm run db:push   # push schema ke Neon
npm run db:seed   # buat admin (password di-hash bcrypt)
npm run dev
```

## Deploy ke Vercel

1. Push repo ini ke GitHub.
2. Import project di vercel.com, hubungkan GitHub repo.
3. Tambahkan env vars yang sama: `DATABASE_URL`, `SESSION_SECRET` (Blob token otomatis kalau stream Blob diconnect lewat dashboard Storage).
4. Setelah di-deploy: jalankan `npm run db:push` lokal dengan `DATABASE_URL` production + `npm run db:seed`.

## Stack

Next.js 16 (App Router) · serverless Postgres (Neon HTTP) + Drizzle ORM · Vercel Blob upload murni browser (multipart, bypass limit 4,5 MB serverless) · session cookie HMAC · GSAP reveal (reduced-motion). Desain mengikuti sistem token editorial otomatis: oklch warna paper oat + Fraunces/IBM Plex Sans + Geist Mono.
