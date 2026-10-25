# PRD — Gallery Idea

> Portofolio ide pribadi dengan galeri publik, penilaian atasan via link privat, dan jejak digital bulanan.

- **Status:** Draft (menunggu pengembangan)
- **Penulis:** El
- **Tanggal:** 25 Oktober 2026
- **Hosting:** Vercel
- **Jenis:** Proyek pribadi (bukan sistem resmi perusahaan)

---

## 1. Latar Belakang

Perusahaan sudah menyediakan platform input ide, tetapi platform tersebut hanya mendukung teks dan gambar (seperti di MS Word). Ide yang lebih kaya — video demo, model 3D, prototipe HTML, file CAD — tidak bisa diunggah ke sana, sehingga ide tidak tertuang secara utuh dan sulit dinilai atasan secara menyeluruh.

Pemilik ide belum punya tempat terpusat untuk menyimpan seluruh ide dalam format apa pun, dengan jejak digital penilaian yang rapi per bulan. Dokumen-dokumen ini penting karena ide dimasukkan setiap bulan dan penilaiannya menumpuk seiring waktu.

## 2. Masalah

1. Ide multi-format (video, 3D, CAD, HTML) tidak bisa masuk ke platform perusahaan.
2. Proses penilaian dari atasan tidak terdokumentasi — tidak ada riwayat siapa menilai apa dan kapan.
3. Beberapa ide sifatnya sensitif/belum siap dipamerkan, tetapi tidak ada mekanisme untuk menyembunyikan sebagian isinya.
4. Tidak ada ringkasan visual mengenai seberapa produktif dan konsisten pembuatan ide dari bulan ke bulan.

## 3. Tujuan & Ukuran Sukses

| # | Tujuan | Ukuran sukses |
|---|--------|---------------|
| G1 | Satu tempat untuk mengunggah ide lengkap dalam format apa pun (< 100 MB/file) | 1 ide baru dapat dibuat lengkap dalam < 10 menit |
| G2 | Atasan dapat menilai dan berkomentar tanpa login | Atasan selesai menilai dalam < 2 menit sejak klik link |
| G3 | Ada jejak digital penilaian yang rapi | Riwayat penilaian dapat dilihat kembali kapan pun di dashboard |
| G4 | Ide sensitif dapat disembunyikan atau ditampilkan sebagian | Terdapat kemampuan kunci: tersembunyi total / hanya judul |
| G5 | Galeri publik menampilkan ide terbuka yang rapi | Landing page publik dapat diakses tanpa login |
| G6 | Ringkasan aktivitas per bulan terlihat | Grafik batang jumlah ide per bulan tampil di dashboard |

## 4. Pengguna & Peran

### 4.1 Admin (pemilik ide — "saya")
- Satu-satunya yang bisa mengunggah, mengedit, dan mengunci ide.
- Satu-satunya yang bisa melihat skor dan komentar atasan.
- Login dengan username + password (satu akun saja).
- Mengirim link penilaian (token) ke atasan melalui kanal sendiri (WhatsApp/email/chat).

### 4.2 Atasan (penilai)
- **Tanpa login.** Mendapat link unik per ide yang hanya dibagikan via chat/WhatsApp.
- Melalui link tersebut dapat melihat ide lengkap dan memberi: skor + komentar/saran.
- Link hanya berlaku untuk satu ide, tidak bisa membuka ide lain.
- Hasil penilaiannya **hanya tampil di dashboard admin**.

### 4.3 Pengunjung publik
- Tanpa login, melihat landing page berisi **hanya ide yang tidak dikunci**.
- Untuk ide yang dikunci "judul saja": hanya melihat judul (tanpa konten apa pun).
- Untuk ide yang dikunci "tersembunyi": tidak muncul sama sekali.
- Tidak bisa melihat skor, komentar, atau data internal apa pun.

## 5. Ruang Lingkup Fungsional

### 5.1 Landing Page (publik, tanpa login)
- **F-01** Hero/header sederhana berisi judul situs dan tagline singkat.
- **F-02** Galeri kartu ide terbuka: judul, kategori, bulan, thumbnail/logo, status penilaian ("Sudah dinilai" / "Menunggu penilaian" — tanpa menampilkan skornya).
- **F-03** Klik kartu → halaman detail publik: seluruh konten ide (deskripsi, penjelasan, media, file unduhan yang diperbolehkan).
- **F-04** Ide berstatus kunci "judul saja" muncul sebagai kartu bernada redup + label "Terkunci", tidak bisa dibuka detailnya.
- **F-05** Ide berstatus kunci "tersembunyi" tidak muncul di daftar maupun di URL (akses langsung ke URL-nya → 404 / halaman tidak tersedia).
- **F-06** Filter sederhana di galeri: per bulan dan per kategori.
- **F-07** Halaman detail publik mendukung pratinjau setiap jenis konten:
  - Teks: deskripsi + penjelasan (rich text sederhana).
  - Foto: galeri gambar (lightbox).
  - Video MP4: video player inline.
  - HTML: pratinjau embed via iframe (jika file html/js/css diunggah sebagai paket).
  - GLB: viewer 3D (mis. `<model-viewer>`).
  - CAD & format lain: tombol unduh (tanpa pratinjau).
- **F-08** Tanpa iklan, tanpa tracking pihak ketiga.

### 5.2 Admin — Manajemen Ide (di balik login)
- **F-09** Login admin (username + password, satu akun).
- **F-10** Buat ide baru, berisi:
  - Judul, kategori, deskripsi teks, penjelasan panjang (rich text sederhana).
  - Unggahan multi-file per ide: foto (JPG/PNG/WebP), video (MP4), HTML (html/css/js), 3D (GLB), CAD (dwg/dxf/step/stl — bisa diunggah sebagai file mentah), dan file lain < 100 MB.
  - Status siklus hidup: draft (belum tampil) → publik.
- **F-11** Edit dan hapus ide kapan pun.
- **F-12** Ubah status kunci per ide — 3 pilihan:
  - **Terbuka (publik):** tampil penuh di landing page.
  - **Kunci "judul saja":** hanya judul yang tampil, konten dan detail diblokir.
  - **Kunci "tersembunyi":** tidak tampak sama sekali.
- **F-13** Buat **link penilaian ber-token unik** per ide, untuk dibagikan ke atasan (tombol "salin link").
- **F-14** Buat ulang (regenerasi) token jika link bocor/berubah atasan.

### 5.3 Atasan — Penilaian via Token Link
- **F-15** Link format: `/review/<token-acak>` — hanya berlaku untuk satu ide.
- **F-16** Halaman penilaian menampilkan ide lengkap (konten + media), sama seperti halaman detail admin, tetapi read-only.
- **F-17** Form penilaian: skor (skala 1–10) + komentar/saran teks bebas + tombol kirim.
- **F-18** Atasan bisa **mengubah penilaian** selama link masih aktif (memperbarui skor/komentar).
- **F-19** Setelah sukses kirim: tampilan konfirmasi ringkas.
- **F-20** Token invalid/kadaluarsa/di-non-aktifkan → halaman "Link tidak valid".
- **F-21** Deteksi plagiarisme/penyalahgunaan link tidak diperlukan — asumsi: link hanya dibagikan via chat pribadi.

### 5.4 Dashboard Admin
- **F-22** Ringkasan: jumlah total ide, jumlah terbuka/terkunci, jumlah sudah dinilai / menunggu penilaian.
- **F-23** **Grafik batang: jumlah ide per bulan** selama 12 bulan terakhir (tanpa rata-rata skor).
- **F-24** Daftar semua ide dengan: judul, bulan,.status kunci, status penilaian, skor (hanya di sini), tautan cepat ke detail & link penilaian.
- **F-25** Daftar riwayat penilaian (jejak digital): ide, skor, tanggal, isi komentar — bisa difilter per bulan.

## 6. Model Data (konseptual)

```
Idea
- id
- title
- category
- description (rich text)
- explanation (rich text)
- month (YYYY-MM — dikelola otomatis dari tanggal buat, bisa di-override)
- lockStatus: open | title_only | hidden
- createdAt, updatedAt

IdeaFile
- id, ideaId
- type: image | video | html | model3d | cad | other
- fileName, fileType (MIME), sizeBytes
- storagePath / blobUrl
- sort order

Review
- id, ideaId (unique per idea untuk 1 penilai)
- score (1–10)
- comment (text)
- tokenHash (hash dari token link)
- submittedAt, updatedAt

AdminUser
- id, username, passwordHash

ReviewToken
- id, ideaId
- token (disimpan sebagai hash)
- active: boolean
- createdAt, regeneratedAt
```

## 7. Arsitektur & Teknologi (rekomendasi)

| Lapisan | Pilihan | Alasan |
|---|---|---|
| Framework | Next.js (App Router) di Vercel | Sesuai hosting; SSR untuk landing page publik cepat |
| Database | Postgres serverless (Neon / Vercel Postgres) | Tier gratis tersedia, cocok pola serverless |
| Storage file | **Vercel Blob** dengan upload langsung dari browser | Menhindari batas body 4,5 MB di serverless Vercel; file besar (< 100 MB) lewat jalur presigned/multipart |
| Viewer 3D | `<model-viewer>` (web component) | Pratinjau GLB di browser, tanpa plugin |
| Auth | NextAuth/Clerk atau login sederhana berbasis cookie + password hash | Cukup 1 akun — pilih yang paling ringan |
| Grafik | Recharts / Chart.js | Bar chart sederhana di dashboard |

### Catatan teknis penting (risiko)
- **R1 — Limit upload Vercel:** Fungsi serverless Vercel hanya menerima body ± 4,5 MB. Semua file > 4 MB **harus** diunggah langsung browser → Vercel Blob, bukan lewat API server. Ini wajib dites di awal (spike) sebelum build penuh.
- **R2 — Kuota Blob gratis:** Paket hobby Vercel punya kuota penyimpanan/bandwidth terbatas. Video 50–100 MB bisa menghabiskan kuota cepat. Perlu pemantauan, atau pertimbangkan Cloudflare R2 (tanpa biaya egress) sebagai cadangan.
- **R3 — Token penilaian:** Token harus cukup panjang/acak (minimal 32 karakter, disimpan sebagai hash) supaya tidak bisa ditebak dan tidak bisa dipakai untuk menilai ide lain.
- **R4 — Konten publik HTML:** File HTML yang diunggah bisa berisi script sembarang. Harus dijalankan di iframe **sandboxed** (bukan domain utama) untuk keamanan pengunjung publik.
- **R5 — Format CAD:** dwg/dxf tidak bisa dipratinjau di browser secara realistis — hanya tombol unduh; itu bukan hambatan, tapi perlu kesepakatan UI yang jelas.

## 8. Alur Utama

### 8.1 Alur admin menambah ide
1. Login → dashboard → "Tambah Ide".
2. Isi judul, kategori, deskripsi, penjelasan.
3. Unggah file (foto/video/html/glb/cad, total per file < 100 MB).
4. Simpan sebagai **draft** (belum tampil publik).
5. Saat siap: ubah status jadi "Terbuka" atau "Kunci judul saja" / "Kunci tersembunyi".

### 8.2 Alur atasan menilai
1. Admin menekan "Salin link penilaian" pada satu ide, kirim ke atasan via chat.
2. Atasan membuka link → melihat ide lengkap (tanpa login).
3. Atasan isi skor 1–10 + komentar → kirim.
4. Konfirmasi tampil. Admin melihat hasilnya di dashboard + riwayat penilaian.

### 8.3 Alur pengunjung publik
1. Buka landing page → lihat kartu ide terbuka + kartu "terkunci judul saja".
2. Klik kartu terbuka → halaman detail dengan semua konten dan pratinjau media.
3. Filter per bulan/kategori bila perlu.

## 9. Non-Fungsional

- **Kinerja:** Landing page ter-fetch < 2 detik di koneksi 4G; thumbnail/preview gambar dioptimasi (Next/Image).
- **Keamanan:**
  - Password admin di-hash (bcrypt/argon2), bukan plain text.
  - Semua endpoint admin dilindungi session.
  - Token review disimpan sebagai hash.
  - Pola CORS dan header keamanan standar (Vercel default + tambahan).
- **Audit/Jejak digital:** Setiap penilaian tercatat dengan timestamp tidak dapat diubah (immutable log sederhana — hanya update, tetapi simpan riwayat revisi komentar bila diubah).
- **Backup:** Database Postgres + blob penting; lakukan ekspor berkala (weekly, manual ok).
- **Mobil-friendly:** Landing page + halaman penilaian harus nyaman dibuka dari HP (atasan mungkin buka link dari WhatsApp).

## 10. Di Luar Cakupan (Out of Scope)

- Login/multi-user untuk pengirim ide lain (hanya 1 admin).
- Integrasi dua arah dengan platform ide perusahaan.
- Ekspor PDF / laporan penilaian.
- Analitik rata-rata skor, tren skor, atau leaderboard.
- Komentar publik/like dari pengunjung.
- Notifikasi email otomatis ke atasan (pengiriman manual via chat).
- Versi aplikasi mobile native.

## 11. Tahapan Pengembangan (Phase)

### Fase 1 — Fondasi (1 pekan)
- Setup Next.js di Vercel, database Postgres, login admin.
- CRUD ide dasar (teks + foto dulu).
- **Spike upload Vercel Blob dengan file > 10 MB — harus hijau dulu sebelum lanjut.**

### Fase 2 — Konten Lengkap & Kunci (1 pekan)
- Upload semua tipe file (video, glb, cad, html).
- Status kunci: terbuka / judul saja / tersembunyi.
- Landing page publik + halaman detail + viewer 3D + iframe sandbox.

### Fase 3 — Penilaian (1 pekan)
- Token link per ide + halaman penilaian tanpa login.
- Form skor + komentar, penyimpanan hash token.
- Riwayat penilaian di dashboard admin.

### Fase 4 — Dashboard & Poles (1 pekan)
- Grafik batang ide per bulan.
- Filter galeri, status ringkasan, riwayat revisi komentar.
- Responsive polish, tes akhir di HP, deployment produksi.

## 12. Kriteria Penerimaan (Acceptance)

1. Admin dapat membuat ide lengkap dengan minimal 1 foto, 1 video < 100 MB, 1 GLB, dan 1 file CAD — semua tersimpan dan tampil/terunduh sesuai jenisnya.
2. Ide berstatus "judul saja" hanya menampilkan judul di publik; gagal dibuka detailnya.
3. Ide berstatus "tersembunyi" tidak muncul di galeri maupun diakses via URL langsung.
4. Atasan yang buka link token dapat menilai dan berkomentar tanpa login; token salah → halaman "Link tidak valid".
5. Skor dan komentar hanya muncul di dashboard admin.
6. Grafik batang dashboard menampilkan jumlah ide per bulan yang sesuai dengan data nyata.
7. Semua halaman nyaman dibuka dari ponsel.
