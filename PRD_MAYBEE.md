# 📸 PRODUCT REQUIREMENT DOCUMENT (PRD)
## PROJECT: maybee (Virtual Photobox & Aesthetic Photo Strip Platform)

**Document Version:** 1.1.0  
**Status:** Approved & Ready for Implementation  
**Date:** 2026-10-28  
**Author:** Ben & Bro Jopal (Alfarezel Jopalino)  
**Target Platform:** Web (Desktop & Mobile Browser - Responsive PWA/SPA)  
**GitHub Repository:** `https://github.com/alfarezeljopalino1-source/Maybee.git`  
**Supabase Project URL:** `https://oalqwgtvietxvoqsvsif.supabase.co`  
**Live Hosting:** DomaiNesia (Connected to GitHub)  
**Backend & Database:** Supabase (Free Tier Optimized)
---

## 1. EXECUTIVE SUMMARY & BRAND IDENTITY

### 1.1 Overview
**maybee** adalah platform *virtual photobox* / *online photobooth* modern berbasis web browser tanpa perlu unduh aplikasi. Terinspirasi dari kultur photobox Korea (*Life4Cuts*, *Haru Film*, *Fremio*), **maybee** memungkinkan siapa saja mengambil foto strip beruntun dengan hitungan mundur, efek flash, suara shutter analog, serta memasang bingkai estetik beresolusi tinggi (300 DPI) langsung dari gawai (HP atau laptop).

### 1.2 Brand Philosophy: ANTI AI-SLOP 🚫
* **Nama Brand:** `maybee` (lowercase, friendly, sweet, aesthetic).
* **Tagline:** *"sweet little photobox in your browser."*
* **Desain:** **Light Theme (Warm Paper & Honey Warmth)**. 
  * Haram hukumnya gradien ungu-biru murahan, tombol pil lonjong menyala, *glassmorphism* buram berat, dan ilustrasi generik.
  * Sentuhan editorial analog: tekstur kertas foto, garis bidik kamera (*viewfinder*), palet warna susu-oat hangat, dan bayangan alami realistis.

### 1.3 Target Audience
1. **Gen Z & Anak Muda**: Gemar foto estetik, selfie couple, tongkrongan, dan pamer hasil foto strip di Instagram Story & TikTok.
2. **Event & Komunitas**: Kebutuhan photobooth instan untuk acara kampus, ulang tahun, dan pernikahan via pemindaian QR Code.
3. **Pengguna Santai**: Ingin membuat kolase foto kenangan tanpa perangkat lunak pengedit foto yang rumit.

---

## 2. TECH STACK & INFRASTRUCTURE

| Komponen | Teknologi | Justifikasi |
|---|---|---|
| **Runtime & Bundler** | Vite + React (TypeScript) | Super cepat, hot-reload instan, build static ringan. |
| **Styling** | Tailwind CSS + Lucide Icons | Utility-first, clean design system, anti-slop. |
| **Animation Engine** | Framer Motion | Animasi mikro berbasis kode murni (0 KB video, 60 FPS). |
| **Graphics Engine** | HTML5 Canvas 2D + OffscreenCanvas | Dual-Canvas pattern (Sandwich Compositing 300 DPI). |
| **Media Subsystem** | WebRTC (`getUserMedia`) + Web Audio API | Akses kamera native & zero-latency shutter audio. |
| **Database & Auth** | Supabase (PostgreSQL + Google OAuth) | Cepat, handal, tanpa setup backend rumit dari nol. |
| **Cloud Storage** | Supabase Storage (`user_gallery`) | Penyimpanan hasil foto terkompresi WebP (Free Tier). |
| **Version Control** | Git + GitHub | Kolaborasi rapi, CI/CD, backup source code aman. |
| **Hosting Platform** | DomaiNesia | Hosting milik Bro Jopal, terhubung via Git / GitHub. |

---

## 3. ZERO-COST ARCHITECTURE (TRIK SUPABASE GRATISAN)

Sistem mengintegrasikan **3 lapisan pertahanan biaya (Rp 0 Biaya Operasional)**:

```
                              [ USER BUKA MAYBEE ]
                                      │
                                      ▼
                        Aset Bingkai Canva Dimuat
                   (Gratis lewat Vercel / DomaiNesia)
                                      │
                                      ▼
                             [ SESI FOTO BOOTH ]
                                      │
                                      ▼
                            HASIL FOTO JADI DI LAYAR
                                      │
                  ┌───────────────────┴───────────────────┐
                  │                                       │
                  ▼                                       ▼
       [ KLIK "UNDUH KE HP" ]                  [ KLIK "SIMPAN KE AKUN" ]
                  │                                       │
         Download Langsung                   Dikompres Otomatis ke WebP
        dari Browser ke Galeri                  (Cuma ~200KB) ke Supabase
       (0 Byte Kuota Supabase)               (Muat 5.000+ Foto di Free Tier)
```

1. **Aset Bingkai di Hosting Statis**: Semua gambar PNG transparan bingkai disimpan di folder `/public/frames/`, bukan di Supabase Storage. Menyelamatkan 100% kuota storage Supabase.
2. **Download Langsung (Client-Side)**: Tombol "Unduh" mengekspor langsung dari memori Canvas browser ke galeri lokal pengguna via Blob. 0 byte traffic server.
3. **Kompresi Klien WebP (Quality 80%)**: Saat pengguna login dan menekan "Simpan ke Galeri", gambar 2-3MB dikompresi di browser menjadi ~150-200 KB WebP sebelum diunggah ke Supabase Storage.

---

## 4. DESIGN SYSTEM & VISUAL GUIDELINES

### 4.1 Color Tokens (Warm Light Theme)
```css
/* Background & Surfaces */
--bg-base: #FBF9F5;         /* Warm Cream / Oat Milk */
--bg-surface: #FFFFFF;      /* Clean Milk White (Cards & Slots) */
--border-subtle: #EAE6DF;   /* 1px Fine Warm Border */
--border-hover: #D6D0C5;

/* Typography */
--text-main: #1C1917;       /* Warm Espresso Black (High Contrast) */
--text-muted: #78716C;      /* Muted Warm Stone */
--text-tertiary: #A8A29E;   /* Subtle Captions */

/* Brand Accent */
--brand-honey: #FBBF24;     /* Honey Gold (Warm Energy) */
--brand-butter: #FEF3C7;    /* Soft Butter Cream (Badges/Hover) */
--brand-dark: #0F172A;      /* Deep Slate (Main CTAs & Textures) */
```

### 4.2 Typography Hierarchy
* **Primary Sans:** `Plus Jakarta Sans` atau `Geist Sans` (Modern, humanis, ramah).
* **Editorial Accent:** `Instrument Serif` atau `Playfair Display` (Sentuhan majalah seni).
* **Technical/Mono:** `Geist Mono` atau `JetBrains Mono` (Viewfinder metadata, timestamp tanggal, info shutter).

---

## 5. DETAILED FEATURE SPECIFICATIONS

### MODULE 1: INTRO SPLASH SCREEN (PURE CODE ANIMATION)
* **Pemicu:** Tampil saat pertama kali pengguna membuka web dalam satu sesi browser (`sessionStorage`).
* **Durasi:** Maksimal 2.0 – 2.4 detik (dapat dilewati seketika via tombol "Lewati / Skip" di kanan atas).
* **Alur Visual (Framer Motion):**
  1. *0.0s – 0.6s:* Layar latar warm cream (`#FBF9F5`), muncul aperture lensa kamera minimalis yang berputar dan fokus.
  2. *0.6s – 1.4s:* Teks `maybee` muncul lembut bersamaan dengan 4 kotak strip foto yang meluncur turun (*staggered spring animation*).
  3. *1.4s – 1.8s:* Kilatan cahaya putih tipis (*soft white flash*) dengan audio shutter halus.
  4. *1.8s – 2.2s:* Layar intro terangkat ke atas secara mulus (exit transition) membuka halaman utama.

---

### MODULE 2: LANDING PAGE & KATALOG BINGKAI
* **Hero Section:**
  * Headline editorial: *"sweet memories, one strip at a time."*
  * Subheadline lugas: *"Photobox instan langsung dari browser kamu. Pilih bingkai, pose 4 kali, simpan atau unduh gratis."*
  * Pratinjau interaktif: Mockup strip foto fisik nyata miring artistik dengan bayangan lembut realistis.
* **Filter Kategori Bingkai:**
  * `Semua` | `Classic 4-Cut (2x6)` | `2x2 Grid (4R)` | `Polaroid / Wide`
* **Card Bingkai:**
  * Menampilkan pratinjau thumbnail bingkai, rasio foto, dan tombol aksi: **"Pilih Bingkai Ini"**.

---

### MODULE 3: THE BOOTH ENGINE (KAMERA & WEBRTC)
* **Inisialisasi Hardware:**
  * Meminta izin kamera melalui `navigator.mediaDevices.getUserMedia`.
  * **Safari iOS Guard:** Wajib menyertakan `<video autoPlay playsInline muted />`.
  * Tombol switch kamera: Kamera depan (`user`) vs Kamera belakang (`environment`).
  * Tombol **Mirror Mode** (flip horizontal) untuk kenyamanan pose.
* **Live Guide Masking:**
  * Di atas video live kamera, terdapat *overlay guide* semi-transparan yang membatasi area pose sesuai rasio slot bingkai (mencegah kepala terpotong).
* **Shutter & Timing Engine:**
  * **Hitungan Mundur:** Timer 3 atau 5 detik dengan bunyi audio *beep* presisi via Web Audio API.
  * **Efek Flash:** Layar berkedip putih 100ms tepat saat pengambilan gambar + efek suara *cekrek!*.
  * **Otomatisasi Multi-Shot:** Kamera menjepret berurutan sesuai jumlah slot bingkai (misal 4 kali) dengan jeda 3 detik antar pose untuk berganti gaya.
* **Retake per Slot:**
  * Pengguna dapat memilih foto spesifik (misal Foto #3) untuk dijepret ulang tanpa harus mengulang foto #1, #2, dan #4.
* **Opsi Unggah Galeri:**
  * Alternatif tombol bagi pengguna yang ingin memilih foto dari penyimpanan gawai alih-alih menggunakan kamera live.

---

### MODULE 4: CANVAS COMPOSITING ("TEKNIK SANDWICH")
Penggabungan gambar dilakukan 100% di sisi klien menggunakan HTML5 Canvas:

```
┌────────────────────────────────────────────────────────┐
│                   TEKNIK SANDWICH                      │
├────────────────────────────────────────────────────────┤
│ Layer 4: STIKER & CAPTION (Teks kustom & Tanggalan)    │
├────────────────────────────────────────────────────────┤
│ Layer 3: OVERLAY BINGKAI CANVA (PNG Transparan)        │
├────────────────────────────────────────────────────────┤
│ Layer 2: FOTO PENGGUNA (Crop Center object-fit: cover) │
├────────────────────────────────────────────────────────┤
│ Layer 1: BACKGROUND DASAR (Warna pastel / Kertas)      │
└────────────────────────────────────────────────────────┘
```

* **Pola Dual-Canvas:**
  * *Preview Canvas (600–800px):* Ringan, hemat daya, performa mulus 60 FPS saat pengguna mengatur filter atau warna.
  * *Export Canvas (300 DPI, misal 1200x3600px):* Dirender di memori (*OffscreenCanvas*) hanya saat pengguna menekan tombol "Unduh" atau "Simpan".
* **Koleksi Filter Foto:**
  1. *Natural / Original*: Warna asli tanpa perubahan.
  2. *B&W Noir*: Hitam putih kontras klasik photobox Korea.
  3. *Retro 90s Grain*: Penambahan bintik-bintik film vintage.
  4. *Warm Korean Soft*: Peningkatan saturasi hangat dan pelembutan kulit.
* **Fitur Tanggal & Caption:**
  * Tanggal hari ini otomatis tercetak di bagian bawah bingkai (contoh: `2026.10.28 • maybee booth`).
  * Kolom opsional bagi pengguna untuk menambahkan teks pendek (nama pasangan/sahabat).

---

### MODULE 5: SISTEM BINGKAI & WORKFLOW CANVA PRO
* **Spesifikasi Template Canva:**
  * **Format Strip 4-Cut:** Resolusi kanvas `1200 x 3600 px`.
  * **Format 2x2 Grid:** Resolusi kanvas `2400 x 2400 px` atau `2400 x 3200 px`.
  * **Export Setting Canva Pro:** Format `PNG` dengan centang **"Latar belakang transparan"** (area foto wajib bolong/transparan 100%).
* **Struktur Data JSON Bingkai:**
```json
{
  "id": "frame-maybee-classic-strip",
  "title": "Honey 4-Cut Classic",
  "type": "strip",
  "canvasWidth": 1200,
  "canvasHeight": 3600,
  "overlayUrl": "/frames/classic-strip.png",
  "defaultBgColor": "#FBF9F5",
  "slots": [
    { "index": 1, "x": 100, "y": 180, "width": 1000, "height": 750 },
    { "index": 2, "x": 100, "y": 980, "width": 1000, "height": 750 },
    { "index": 3, "x": 100, "y": 1780, "width": 1000, "height": 750 },
    { "index": 4, "x": 100, "y": 2580, "width": 1000, "height": 750 }
  ]
}
```

---

### MODULE 6: AUTHENTICATION & CLOUD GALLERY (SUPABASE)
* **Autentikasi Pengguna:**
  * 1-Click Login via **Google OAuth** (didukung oleh Supabase Auth).
  * Opsi Email Magic Link / Password.
* **Fitur "My Cloud Gallery":**
  * Halaman galeri pribadi bagi pengguna terdaftar untuk melihat seluruh riwayat strip foto mereka.
  * Opsi unduh ulang kapan saja atau hapus foto.
* **Skema Database (PostgreSQL):**

```sql
-- 1. Profil Pengguna
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default now()
);

-- 2. Master Katalog Bingkai
create table public.frames (
  id text primary key,
  title text not null,
  category text default 'strip',
  overlay_url text not null,
  canvas_width integer not null,
  canvas_height integer not null,
  slots_data jsonb not null,
  is_active boolean default true,
  created_at timestamp with time zone default now()
);

-- 3. Galeri Foto Strip Pengguna
create table public.photo_strips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  frame_id text references public.frames(id),
  image_url text not null,
  created_at timestamp with time zone default now()
);
```

---

## 6. DEPLOYMENT & CI/CD WORKFLOW (DOMAINESIA & GITHUB)

1. **Repositori GitHub:**
   * **Git Remote URL:** `https://github.com/alfarezeljopalino1-source/Maybee.git`

2. **Aturan Keamanan Mutlak (.gitignore Guard) 🔒:**
   > ⚠️ **HARAM HUKUMNYA COMMIT FILE `.env` KE GITHUB!**  
   > File `.gitignore` wajib dipasang di root project sejak awal sebelum commit perdana:
   ```gitignore
   # Sensitive Credentials (JANGAN SAMPAI BOCOR KE GITHUB!)
   .env
   .env.local
   .env.*.local
   node_modules/
   dist/
   .DS_Store
   ```

3. **Environment Variables Configuration:**
   * Yang boleh masuk ke GitHub **HANYA** file `.env.example` (berisi template kunci kosong).
   * File `.env` lokal di laptop Bro Jopal:
     ```env
     VITE_SUPABASE_URL=https://oalqwgtvietxvoqsvsif.supabase.co
     VITE_SUPABASE_ANON_KEY=<isi_anon_key_rahasia_bro_jopal>
     ```
4. **Build Pipeline:**
   * Build statis via Vite: `npm run build` menghasilkan bundel aset statis murni di folder `dist/`.

5. **Deployment ke DomaiNesia:**
   * Metode 1 (Otomatis): Menggunakan **GitHub Actions** dengan runner yang mengunggah output folder `dist/` ke direktori `public_html` DomaiNesia via SFTP / cPanel Deployment.
   * Metode 2: Menggunakan fitur **cPanel Git™ Version Control** di DomaiNesia dengan trigger build otomatis.
---

## 7. PROJECT ROADMAP & MILESTONES

| Fase | Target Pekerjaan | Output / Milestone |
|---|---|---|
| **Fase 1** | Setup Project, Vite + React + Tailwind + Supabase Client | Repositori GitHub terinisialisasi, auth login Google aktif. |
| **Fase 2** | Intro Splash Screen & Desain Landing Page Anti-Slop | Animasi kode Framer Motion, katalog bingkai warm cream. |
| **Fase 3** | Core Booth Engine (WebRTC, Guide Mask, Timer & Audio) | Kamera live, countdown beep, multi-shot 4x jepret jalan mulus. |
| **Fase 4** | Canvas Compositing Engine & Instant Download | Sandwich renderer, filter B&W/Retro, ekspor 300 DPI ke galeri HP. |
| **Fase 5** | Cloud Gallery & WebP Compression | Simpan ke akun Supabase terkompresi ~200KB. |
| **Fase 6** | **CHECKPOINT HANDOFF & CANVA PRO FRAMES** | 🔔 **BEN MENGINGATKAN BRO JOPAL UNTUK MEMASUKKAN FRAME CANVA PRO** |
| **Fase 7** | Deployment ke DomaiNesia & Smoke Testing | Web live di domain DomaiNesia, uji coba di iOS Safari & Chrome Android. |

---

## 8. HANDOFF CONTRACT & REMINDER NOTICE

> ⚠️ **CATATAN KHUSUS ASISTEN (BEN):**  
> Pada saat implementasi Fase 1 sampai Fase 5 selesai dan diverifikasi menggunakan **1 Dummy Frame Tester**, asisten (Ben) **WAJIB MEMBERIKAN PEMBERITAHUAN KHUSUS KEPADA BRO JOPAL** untuk:
> 1. Mengunduh bingkai karya Bro Jopal dari Canva Pro dalam format PNG Transparan.
> 2. Mencatat koordinat slot (X, Y, W, H) dari Canva Position Inspector.
> 3. Memasukkan bingkai resmi tersebut ke dalam katalog `maybee`.

---

## 9. AI AGENT BOOTSTRAP GUIDE (PANDUAN EKSEKUSI UNTUK AI AGENT)

Bagi AI Agent / Developer yang mengeksekusi proyek ini di folder kerja:
1. **Inisialisasi Project:**
   ```bash
   npm create vite@latest . -- --template react-ts
   # Atau gunakan bun:
   # bun create vite . --template react-ts
   ```
2. **Instalasi Dependencies:**
   ```bash
   npm install tailwindcss @tailwindcss/vite lucide-react framer-motion @supabase/supabase-js canvas-confetti
   npm install -D @types/canvas-confetti
   ```
3. **Konfigurasi Git Remote:**
   ```bash
   git init
   git remote add origin https://github.com/alfarezeljopalino1-source/Maybee.git
   git branch -M main
   ```
4. **Setup Environment & Security (.gitignore Wajib Pertama Kali!):**
   * **LANGKAH PERTAMA SEBELUM COMMIT:** Pastikan `.gitignore` sudah ada dan memuat `.env` & `.env.local`!
   * Buat `.env.example` (ini yang di-push ke GitHub):
     ```env
     VITE_SUPABASE_URL=https://oalqwgtvietxvoqsvsif.supabase.co
     VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
     ```
   * Buat `.env` lokal (JANGAN DI-COMMIT!):
     ```env
     VITE_SUPABASE_URL=https://oalqwgtvietxvoqsvsif.supabase.co
     VITE_SUPABASE_ANON_KEY=
     ```
   * Periksa dengan `git status` sebelum push: pastikan `.env` **TIDAK PERNAH** muncul dalam daftar *untracked/staged files*!

5. **Eksekusi Fitur Bertahap:**
   * Ikuti tahapan dari Fase 1 sampai Fase 5 di Section 7.
   * Terapkan palet warna Light Theme (Warm Cream) sesuai Section 4.
   * Sediakan 1 dummy frame tester di `public/frames/` untuk pembuktian engine.
   * Saat Fase 5 selesai dan teruji, **STOP dan ingatkan Bro Jopal** untuk input bingkai dari Canva Pro (Fase 6).
*Dokumen ini sah sebagai panduan teknis rekayasa perangkat lunak untuk armada projek **maybee**.*
