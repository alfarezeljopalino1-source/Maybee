# maybee

> sweet little photobox in your browser.

Virtual photobox / photobooth berbasis web. Pilih bingkai, pose 4 kali dengan hitungan
mundur, poles filter + caption, lalu unduh PNG **300 DPI** atau simpan ke galeri.
Tanpa unduh aplikasi, foto **nggak pernah keluar dari browser** kecuali kalau kamu
sendiri yang klik "simpan ke akun".

- **Stack:** Vite + React 18 + TypeScript + Tailwind v4 + Framer Motion + Supabase
- **Hosting:** DomaiNesia (cPanel, Apache) — hasil build statis dari `dist/`
- **Repo:** `alfarezeljopalino1-source/Maybee`

---

## 1. Jalanin lokal

```bash
npm install
cp .env.example .env      # Windows: copy .env.example .env
npm run dev               # http://localhost:5173
```

Butuh **Node 20+** (dites di Node 24) dan Python + Pillow kalau mau regenerate aset.

### Script

| Perintah | Fungsi |
| --- | --- |
| `npm run dev` | dev server + HMR |
| `npm run build` | typecheck (`tsc -b`) lalu build produksi ke `dist/` |
| `npm run preview` | serve `dist/` lokal (cek hasil build) |
| `npm run typecheck` | typecheck doang |
| `npm run frames` | regenerate bingkai PNG, foto sampel, dan `src/data/frames.json` |

### Environment

```env
VITE_SUPABASE_URL=https://oalqwgtvietxvoqsvsif.supabase.co
VITE_SUPABASE_ANON_KEY=            # kosong = mode lokal penuh
VITE_CONTACT_EMAIL=hello@maybee.app
```

**Kalau `VITE_SUPABASE_ANON_KEY` kosong**, aplikasi tetap 100% jalan: kamera, editor,
unduh 300 DPI, dan galeri lokal (IndexedDB). Yang mati cuma login + galeri akun.
Itu memang desainnya — biar bisa demo tanpa backend.

> `.env` **tidak pernah** masuk git (lihat `.gitignore`). Untuk DomaiNesia, isi
> variabel yang sama di **GitHub → Settings → Secrets** kalau pakai workflow deploy.

---

## 2. Setup Supabase (Fase 5)

1. Buka project `oalqwgtvietxvoqsvsif` → **SQL Editor** → tempel isi
   [`supabase/schema.sql`](supabase/schema.sql) → **Run**. Aman diulang berkali-kali.
   Itu bikin: `profiles`, `strips`, bucket storage `user_gallery`, RLS, dan trigger
   auto-profile.
2. **Authentication → Providers → Google**: aktifkan, isi Client ID/Secret dari
   Google Cloud Console.
3. **Authentication → URL Configuration**:
   - Site URL: `https://domain-kamu.com`
   - Redirect URLs: `https://domain-kamu.com/**`, `http://localhost:5173/**`
4. **Authentication → Providers → Email**: aktifkan. Ini yang dipakai
   email/password, magic link, dan reset password sekaligus.
   - **Confirm email** nyala → setelah daftar, user dikirim tautan konfirmasi
     (app sudah nampilin pesan "cek inbox").
   - **Confirm email** mati → daftar langsung dapat sesi, enak buat demo.
   - **Redirect URL reset password**: `https://domain-kamu.com/masuk?mode=reset`
     (dan `http://localhost:5173/masuk?mode=reset` waktu lokal).
5. Copy **anon public key** → taruh di `VITE_SUPABASE_ANON_KEY`.

### Bingkai: bebas vs Koleksi

Enam bingkai bertanda `akses: 'bebas'` dipakai tanpa akun. Dua bingkai
`akses: 'koleksi'` cuma butuh login — **bukan berbayar**. Gate-nya ada di
`Booth.tsx` dan tampil sebagai panel penjelasan, bukan redirect paksa.
Kalau mau semua bingkai bebas, ubah kolom `akses` di tabel `frames`
(atau `src/data/frames.json`) jadi `'bebas'`.

Yang disimpan ke cloud cuma versi terkompresi (±150–250 KB, WebP, sisi terpanjang
1600 px). File 300 DPI tetap cuma ada di perangkat user.

---

## 3. Deploy ke DomaiNesia

### Cara manual (paling simpel)

```bash
npm run build
```

Upload **isi** folder `dist/` ke `public_html/` (File Manager cPanel atau FTP).
`public/.htaccess` ikut ke-copy otomatis oleh Vite, jadi React Router nggak 404
saat refresh di `/booth` atau `/galeri`.

### Cara otomatis (GitHub Actions + FTP)

Workflow `.github/workflows/deploy.yml` build lalu upload `dist/` tiap push ke `main`.
Isi secrets di repo:

| Secret | Isi |
| --- | --- |
| `FTP_SERVER` | host FTP DomaiNesia (mis. `ftp.domain-kamu.com`) |
| `FTP_USERNAME` | user FTP cPanel |
| `FTP_PASSWORD` | password FTP |
| `VITE_SUPABASE_URL` | URL project Supabase |
| `VITE_SUPABASE_ANON_KEY` | anon key |

Kalau nggak mau otomatis, hapus/rename file workflow-nya — nggak ngaruh ke app.

---

## 4. Struktur

```
src/
├─ pages/            Landing · Booth · Gallery · Auth · About · NotFound
├─ components/
│  ├─ booth/         CameraStage · ReviewStage · StripPreview · FrameStripPicker
│  └─ ...            SiteHeader · SiteFooter · Splash · FrameCard · FrameTrip
├─ lib/
│  ├─ canvas.ts      compositing engine: cover-crop, filter, grain, export + pHYs 300 DPI
│  ├─ audio.ts       beep countdown + shutter analog (Web Audio, tanpa file audio)
│  ├─ localGallery.ts  IndexedDB galeri perangkat
│  ├─ cloudGallery.ts  kompres WebP → upload Supabase Storage
│  └─ supabase.ts    client (null-safe kalau env kosong)
├─ data/frames.json  katalog bingkai (generated)
└─ scripts/generate_assets.py   sumber kebenaran bingkai
```

### Cara kerja rendering

1. Kanvas disusun **sandwich**: warna kertas → foto per slot (crop tengah) → overlay
   PNG transparan bingkai → teks caption/tanggal.
2. Filter diterapkan ke **piksel foto** saat komposisi, bukan CSS overlay — jadi hasil
   unduhan sama persis dengan pratinjau.
3. `exportStrip()` render ulang di kanvas off-screen pada resolusi penuh
   (contoh 1200 × 3600), lalu menyisipkan chunk PNG `pHYs` supaya file kebaca
   **300 DPI** di Photoshop / printer (canvas selalu default 72 DPI).
4. Export nunggu `document.fonts.ready` **maksimal 1,2 detik**. Kalau font CDN
   lambat/diblokir, export tetap jalan pakai font fallback — jangan sampai tombol
   unduh muter selamanya.

---

## 5. Nambah bingkai (Fase 6 — Canva Pro)

Bingkai sekarang masih **dummy** hasil generator Python. Buat bingkai asli:

1. Desain di Canva Pro, ukuran sesuai kanvas (mis. 1200 × 3600 px untuk strip 4).
2. Export **PNG transparan** — lubang foto harus benar-benar transparan (alpha 0),
   bukan putih.
3. Taruh di `public/frames/<id>.png`.
4. Daftarkan di `src/data/frames.ts` + `frames.json`: `id`, `title`, `canvasWidth`,
   `canvasHeight`, dan koordinat `slots` (`x, y, width, height` dalam px kanvas).
5. Cek: buka `/booth?frame=<id>`, pastikan crop pas dan garis bingkai nggak ketutup.

Tidak perlu ubah kode engine — katalog yang nyetir semuanya.

---

## 6. Catatan teknis

- **Kamera butuh HTTPS atau localhost.** `getUserMedia` diblokir di `http://` biasa,
  jadi di DomaiNesia pastikan SSL aktif (`.htaccess` sudah maksa redirect HTTPS).
- **iOS Safari**: video preview pakai `playsInline` + `muted`; capture lewat
  `<canvas>` supaya nggak kena batasan `ImageCapture` yang belum merata.
- **PWA**: manifest + ikon udah ada, installable di Android/desktop. Service worker
  sengaja belum dipasang biar update bingkai nggak ketahan cache.
- **Privasi**: nggak ada analitik, nggak ada upload otomatis. Strip cuma naik ke
  Supabase kalau user login dan klik "simpan ke akun".

---

Dibikin sambil ngopi. Visca el Barca. 🔴🔵
