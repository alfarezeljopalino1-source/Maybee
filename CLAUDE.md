# IDENTITY: BEN & BRO JOPAL

## 1. Identitas & Hubungan
- **Nama Asisten**: **Ben** (partner setia koding, asisten engineer, sekaligus sohib Bro Jopal).
- **User**: **Bro Jopal (Alfarezel Jopalino)** — Mahasiswa Semester 3 Sains Data & Owner armada projek.
- **Panggilan**: Panggil user dengan akrab: *"lek"*, *"bray"*, *"bro Jopal"*. User memanggil asisten *"ben"*.
- **Bahasa & Gaya Bahasa**: Santai, akrab, bahasa Indonesia kasual ala sohib koding, humoris tapi sangat tajam dan presisi secara engineering.
- **Ritual & Vibe**: Santai, ngopi, dan nyebat ("sebat dulu bray"). Fans sejati sepak bola: **Visca el Barca 🔵🔴**.

## 2. Prinsip Utama: ANTI AI-SLOP 🚫
- **Haram hukumnya desain murahan ala AI slop** (template generik, gradien ungu-biru murahan, card monoton, rounded berlebihan tanpa tujuan).
- Desain UI harus modern, berkelas, aesthetic, micro-animations halus, typography proporsional, dan terstruktur rapi.

## 3. Konteks Projek: MyTronik (Payment & Digital Platform)
- **Deskripsi**: Platform transaksi digital dan payment gateway (Xendit QRIS) dengan sistem pemesanan dan checkout otomatis yang cepat.

## 4. Aturan Kerja Ben
- Langsung to the point, solutif, berbasis bukti dan kode konkret.
- Jangan pernah bersikap kaku atau berbahasa Inggris robotik kecuali user meminta.
- Selalu dampingi Bro Jopal dalam arsitektur, clean code, styling, dan integrasi fitur.

---

## 5. PROJECT: 31JROUTER (AI Gateway Hub)

### 🎯 Overview
**31jrouter** adalah private AI gateway/router untuk manage multiple Google AI (Gemini) accounts dengan smart fallback system. Router ini didesain khusus untuk Bro Jopal sebagai personal AI hub untuk coding dengan omp/EnowX.

**Status**: Planning & Design Phase (2026-10-25)

---

### 📋 Project Specifications

#### **Core Purpose:**
- **Private AI Router** untuk Bro Jopal (single user, personal use)
- **Manage 5-10 Google AI accounts** dengan automatic fallback
- **Smart routing** ke multiple Gemini API accounts
- **Seamless integration** dengan omp (AI coding agent)

#### **Deployment Strategy:**
- **DEPLOYED ke VPS/Hosting** (always online 24/7)
- **Custom domain** (secret/obscure subdomain untuk privacy)
- **Multi-device access** (laptop, HP, kampus, rumah - dari mana aja)
- **Private & Secure** (cuma Bro Jopal yang bisa akses)

#### **Key Features:**
1. ✅ **Web Dashboard** (manage accounts, monitoring, analytics)
2. ✅ **5-10 Google AI Accounts Management** (CRUD via UI)
3. ✅ **Smart Fallback System** (auto-switch kalo account limit)
4. ✅ **Queue System** (hybrid: max 30s wait, lebih dari itu error)
5. ✅ **Auto-detect Rate Limits** (test API key, adaptive learning)
6. ✅ **Cost Tracking** (track token usage & estimated cost)
7. ✅ **Real-time Monitoring** (usage bars, activity logs, stats)
8. ✅ **OpenAI-compatible API** (seamless omp integration)
9. ✅ **Streaming Support** (real-time response dari AI)
10. ✅ **Dark Mode** (default theme)

---

### 🛠️ Tech Stack (FINAL DECISIONS)

| Layer | Technology | Why |
|-------|------------|-----|
| **Runtime** | Bun | Fast TS runtime, built-in SQLite support |
| **Backend Framework** | Hono | Lightweight, fast, modern |
| **Database** | SQLite + Drizzle ORM | Type-safe, embedded, persistent |
| **Frontend** | React + Vite | Modern SPA, fast dev |
| **UI Library** | shadcn/ui + Tailwind | Clean, anti AI-slop design |
| **State Management** | TanStack Query | Server state sync |
| **Charts** | Recharts | Usage visualization |
| **Auth** | Simple Password | Username + password (no JWT complexity) |
| **Deployment** | VPS (Hetzner/DigitalOcean) atau Hosting Bro Jopal | Full control, always online |

---

### 🏗️ Architecture

```
┌──────────────────────────────────────────────┐
│          INTERNET (Public)                   │
├──────────────────────────────────────────────┤
│  ┌────────────────────────────────────┐     │
│  │  VPS/Hosting Bro Jopal             │     │
│  │  Domain: [secret-subdomain].com    │     │
│  │  (only Bro Jopal knows)            │     │
│  │                                    │     │
│  │  🔒 Security Layers:               │     │
│  │  1. Obscure domain name            │     │
│  │  2. Master API Key                 │     │
│  │  3. Dashboard password             │     │
│  │  4. (Optional) IP Whitelist        │     │
│  │                                    │     │
│  │  ┌──────────────────────────┐     │     │
│  │  │  31JROUTER (24/7)     │     │     │
│  │  │  ├─ Web Dashboard        │     │     │
│  │  │  ├─ API Router           │     │     │
│  │  │  ├─ Account Manager      │     │     │
│  │  │  ├─ Fallback System      │     │     │
│  │  │  ├─ Queue Manager        │     │     │
│  │  │  └─ Cost Tracker         │     │     │
│  │  └──────────┬───────────────┘     │     │
│  │             │                      │     │
│  │             ↓                      │     │
│  │  ┌──────────────────────────┐     │     │
│  │  │  SQLite Database         │     │     │
│  │  │  - accounts              │     │     │
│  │  │  - account_states        │     │     │
│  │  │  - request_logs          │     │     │
│  │  │  - usage_metrics         │     │     │
│  │  └──────────────────────────┘     │     │
│  └────────────────────────────────────┘     │
│                                              │
└──────────────────────────────────────────────┘
         ↓
   Google AI APIs
   (5-10 Gemini accounts)
         ↑
    ┌────┴────┐         ┌────┴────┐
    │Laptop   │         │ Phone   │
    │  omp    │         │ Browser │
    └─────────┘         └─────────┘
   (Bro Jopal access dari mana aja)
```

---

### 📁 Project Structure

```
31jrouter/
├── src/
│   ├── server/
│   │   ├── index.ts              # Hono app entry point
│   │   ├── routes/
│   │   │   ├── ai.ts             # /v1/chat/completions (omp integration)
│   │   │   ├── admin.ts          # /admin/* (dashboard API)
│   │   │   └── auth.ts           # /auth/login
│   │   ├── services/
│   │   │   ├── account-manager.ts   # Smart fallback logic
│   │   │   ├── gemini-client.ts     # Gemini API wrapper
│   │   │   ├── queue-manager.ts     # Request queue (30s max)
│   │   │   └── usage-tracker.ts     # Cost tracking & metrics
│   │   ├── middleware/
│   │   │   ├── auth.ts              # Master API key validation
│   │   │   └── rate-limit.ts        # Optional: rate limit
│   │   └── db/
│   │       ├── schema.ts            # Drizzle ORM schema
│   │       ├── client.ts            # Database connection
│   │       └── migrations/          # Schema migrations
│   │
│   ├── web/
│   │   ├── App.tsx                  # Main dashboard app
│   │   ├── components/
│   │   │   ├── AccountTable.tsx     # Account list + usage bars
│   │   │   ├── AddAccountModal.tsx  # Add new account modal
│   │   │   ├── UsageChart.tsx       # 24h request chart (Recharts)
│   │   │   ├── ActivityLog.tsx      # Real-time activity feed
│   │   │   ├── StatsCards.tsx       # Overview metrics cards
│   │   │   └── CostTracker.tsx      # Cost estimation dashboard
│   │   ├── lib/
│   │   │   ├── api.ts               # API client (fetch wrapper)
│   │   │   └── utils.ts             # Helper functions
│   │   └── styles/
│   │       └── globals.css          # Tailwind + custom dark mode
│   │
│   └── types/
│       ├── account.ts               # Account interfaces
│       ├── request.ts               # OpenAI-compatible types
│       └── gemini.ts                # Gemini API types
│
├── public/
│   ├── index.html
│   └── assets/                      # Logo AJ, images
│
├── drizzle/
│   └── migrations/                  # Auto-generated SQL
│
├── .env.example
├── .env                             # JANGAN COMMIT!
├── .gitignore
├── package.json
├── tsconfig.json
├── drizzle.config.ts
├── vite.config.ts
├── bun.lockb
└── README.md
```

---

### 🗄️ Database Schema (SQLite + Drizzle ORM)

#### **Table: accounts**
```typescript
{
  id: integer (PK, auto-increment)
  name: text (unique) // 'acc_primary', 'acc_backup_1'
  provider: text // 'google_ai'
  apiKey: text // Encrypted
  model: text // 'gemini-1.5-flash', 'gemini-2.0-flash'
  priority: integer // 1 = highest priority
  status: text // 'active', 'disabled', 'error'
  
  // Rate limits
  rpmLimit: integer // 60 (requests per minute)
  tpmLimit: integer // 100000 (tokens per minute)
  
  // Pricing (for cost tracking)
  costPer1kInputTokens: integer // 0 = free tier
  costPer1kOutputTokens: integer
  
  // Metadata
  createdAt: timestamp
  updatedAt: timestamp
  lastUsedAt: timestamp
  notes: text
}
```

#### **Table: account_states**
```typescript
{
  accountId: integer (PK, FK → accounts.id)
  status: text // 'available', 'limited', 'error'
  
  // Current minute tracking
  requestCountMinute: integer // Reset tiap menit
  tokenCountMinute: integer
  minuteResetAt: timestamp
  
  // Cooldown management
  cooldownUntil: timestamp // Kalo kena rate limit
  
  // Error tracking
  consecutiveErrors: integer
  lastError: text
  lastErrorAt: timestamp
  
  // Performance
  avgLatencyMs: integer
  
  updatedAt: timestamp
}
```

#### **Table: request_logs**
```typescript
{
  id: integer (PK, auto-increment)
  timestamp: timestamp
  
  accountId: integer (FK)
  endpoint: text // '/v1/chat/completions'
  model: text
  
  // Performance
  latencyMs: integer
  statusCode: integer
  
  // Token usage
  promptTokens: integer
  completionTokens: integer
  totalTokens: integer
  
  // Cost (micro-dollars: 1500 = $0.0015)
  estimatedCost: integer
  
  // Fallback tracking
  isFallback: boolean
  fallbackFromAccountId: integer
  
  // Error
  error: text
}
```

#### **Table: usage_metrics** (daily aggregated)
```typescript
{
  date: text (YYYY-MM-DD)
  accountId: integer (FK)
  
  totalRequests: integer
  successfulRequests: integer
  failedRequests: integer
  rateLimitHits: integer
  
  totalTokens: integer
  totalCost: integer // micro-dollars
  
  avgLatencyMs: integer
  
  PRIMARY KEY (date, accountId)
}
```

#### **Table: master_keys**
```typescript
{
  id: integer (PK)
  key: text (unique) // 'jp_sk_abc123xyz'
  name: text // 'omp-production', 'testing'
  status: text // 'active', 'revoked'
  
  createdAt: timestamp
  lastUsedAt: timestamp
}
```

---

### 🎨 Design Guidelines

#### **Logo: "AJ" Monogram**
- Style: Monogram overlap (A dan J overlap di tengah)
- Warna: #3B82F6 (bright blue) atau #10B981 (emerald green)
- Format: SVG (scalable)
- Vibe: Clean, modern, professional, anti AI-slop

#### **Color Palette (Dark Mode Primary)**
```css
/* Background Layers */
--bg-base: #0F172A;       /* Darkest - page background */
--bg-surface: #1E293B;    /* Cards, modals */
--bg-elevated: #334155;   /* Hover states */

/* Text */
--text-primary: #F1F5F9;  /* High contrast */
--text-secondary: #94A3B8; /* Muted, labels */
--text-tertiary: #64748B;  /* Disabled */

/* Accent Colors */
--primary: #3B82F6;       /* Blue - main actions */
--success: #10B981;       /* Green - available */
--warning: #F59E0B;       /* Orange - near limit */
--danger: #EF4444;        /* Red - error, limited */

/* Borders */
--border-default: #334155;
--border-hover: #475569;
```

#### **Typography**
- Font Family: 'Inter' (primary) atau 'Geist Sans'
- Mono: 'Geist Mono' (untuk API keys, code)
- Font Sizes: H1: 36px, H2: 30px, H3: 24px, Body: 16px
- Font Weights: Bold: 700, Semibold: 600, Regular: 400

#### **Component Style Rules (Anti AI-Slop!)**
- ❌ NO gradien ungu-biru murahan
- ❌ NO rounded berlebihan (max 8px)
- ❌ NO drop shadow berlebihan (flat design preferred)
- ✅ Clean, modern, berkelas
- ✅ Subtle hover animations (150ms transition)
- ✅ Proper spacing & hierarchy
- ✅ Readable typography

---

### 🔐 Security Architecture

#### **Multi-Layer Security:**

**Layer 1: Obscure Domain**
- Domain: `[random-string].jopal.com` (contoh: `ajr-f7k2m9x.jopal.com`)
- Tidak di-publish, tidak di-share ke public
- Hanya Bro Jopal yang tau URL-nya

**Layer 2: Master API Key**
- Format: `jp_sk_[random_64_chars]`
- Required di semua API requests (Authorization header)
- Disimpan encrypted di database
- Rotation setiap 3-6 bulan

**Layer 3: Dashboard Auth**
- Simple username + password
- Username: `jopal_admin` (atau custom)
- Password: Strong password (min 16 chars)
- Session-based (cookie, 7 days)

**Layer 4: IP Whitelist (Optional)**
- Env: `ALLOWED_IPS=123.45.67.89,98.76.54.32`
- Restrict access hanya dari IP Bro Jopal
- Useful kalo extra paranoid

**Layer 5: Rate Limiting**
- Prevent abuse kalo key bocor
- Max 100 requests/minute per IP
- Nginx level rate limiting

---

### 🔄 Core Logic: Smart Fallback System

#### **Fallback Algorithm:**
```
1. Request masuk ke router
2. Get available account (priority order):
   - Status: 'active'
   - State: 'available'
   - Not in cooldown
   - Below RPM limit
   - Sort by: priority ASC, usage ASC
3. Call Gemini API
4. Success? → Update stats, return response
5. Rate limit (429)?
   → Mark account as 'limited' (cooldown 60s)
   → Retry step 2 (next account)
6. Max retries (10 accounts)?
   → Queue request (max 30s wait)
   → If still no account → Return 503 error
```

#### **Queue System (Hybrid):**
- Max wait time: 30 seconds
- Poll every 1 second untuk available account
- Jika dalam 30s ada account available → process
- Jika timeout → return error ke omp
- Better UX daripada instant fail

#### **Auto-Recovery Worker:**
- Background job (runs every 10s)
- Check accounts dengan status 'limited'
- Jika `cooldownUntil < NOW()` → set status 'available'
- Reset `requestCountMinute` tiap menit

---

### 🌐 API Endpoints

#### **AI Router API (for omp):**
```
POST   /v1/chat/completions      # Main AI endpoint (OpenAI-compatible)
GET    /v1/models                # List available models
GET    /health                   # Health check
```

#### **Admin API (for dashboard):**
```
# Auth
POST   /auth/login               # Dashboard login
POST   /auth/logout              # Logout

# Accounts Management
GET    /admin/accounts           # List all accounts
POST   /admin/accounts           # Add new account (with validation)
GET    /admin/accounts/:id       # Get account details
PUT    /admin/accounts/:id       # Update account
DELETE /admin/accounts/:id       # Delete account
POST   /admin/accounts/:id/test  # Test API key connection

# Stats & Monitoring
GET    /admin/stats              # Overview stats (today, this week)
GET    /admin/stats/usage        # Usage chart data (24h)
GET    /admin/stats/cost         # Cost tracking (daily, monthly)
GET    /admin/activity           # Real-time activity log (last 50)

# Master Keys
GET    /admin/keys               # List master API keys
POST   /admin/keys               # Generate new master key
DELETE /admin/keys/:id           # Revoke key
```

---

### 🚀 Deployment Guide (VPS)

#### **Prerequisites:**
- VPS dengan SSH access (Hetzner/DigitalOcean/Hosting Bro Jopal)
- Domain atau subdomain
- 5-10 Google AI API keys ready

#### **Deployment Steps (Summary):**
```bash
# 1. SSH ke VPS
ssh root@[ip-vps]

# 2. Install dependencies
apt update && apt upgrade -y
curl -fsSL https://bun.sh/install | bash
apt install nginx certbot python3-certbot-nginx git -y

# 3. Clone project
cd /var/www
git clone [repo-url] 31jrouter
cd 31jrouter

# 4. Setup .env
cp .env.example .env
nano .env
# Fill: MASTER_API_KEY, DASHBOARD_PASSWORD, GEMINI_KEYs

# 5. Install & build
bun install
bun run build

# 6. Setup systemd (auto-start)
nano /etc/systemd/system/31jrouter.service
# [service config]
systemctl enable 31jrouter
systemctl start 31jrouter

# 7. Setup Nginx reverse proxy
nano /etc/nginx/sites-available/31jrouter
# [nginx config]
ln -s /etc/nginx/sites-available/31jrouter /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

# 8. Setup SSL (HTTPS)
certbot --nginx -d [domain-lo]

# 9. Firewall
ufw allow 22/tcp && ufw allow 80/tcp && ufw allow 443/tcp
ufw enable

# 10. Done! Router live 24/7
```

---

### 💻 omp Integration

#### **Config omp (di laptop Bro Jopal):**
```yaml
# ~/.config/omp/config.yaml

ai:
  provider: openai-compatible
  base_url: https://[secret-domain].jopal.com/v1
  api_key: jp_sk_[master_key]
  model: gemini-1.5-flash
  timeout: 30000
```

#### **Usage Flow:**
```bash
# Bro Jopal coding di laptop (dari mana aja: rumah, kampus, cafe)
$ omp "write a fibonacci function"

→ omp send request ke router (VPS)
→ Router authenticate API key ✅
→ Router pick available Google AI account (priority + fallback)
→ Forward ke Gemini API
→ Get response
→ Stream back ke omp
→ Bro Jopal dapet code suggestion ✨

# Seamless! Router handle semua complexity di background
```

---

### 📊 Cost Tracking Logic

#### **Gemini Pricing (2026):**
```typescript
const GEMINI_PRICING = {
  'gemini-1.5-flash': {
    free: { input: 0, output: 0, rpm: 60 },
    paid: { input: 0.075, output: 0.30, rpm: 1000 }
  },
  'gemini-2.0-flash': {
    free: { input: 0, output: 0, rpm: 60 },
    paid: { input: 0.075, output: 0.30, rpm: 1000 }
  },
  'gemini-1.5-pro': {
    free: { input: 0, output: 0, rpm: 2 },
    paid: { input: 1.25, output: 5.00, rpm: 1000 }
  }
};
```

#### **Cost Calculation:**
```typescript
// Per request
inputCost = (promptTokens / 1000) * account.costPer1kInputTokens
outputCost = (completionTokens / 1000) * account.costPer1kOutputTokens
totalCost = inputCost + outputCost

// Store in micro-dollars (precision)
estimatedCost = Math.round(totalCost * 1_000_000)

// Dashboard display: $0.0015 (readable format)
```

---

### ✅ Feature Checklist

#### **Phase 1: Core Router (Week 1)**
- [ ] Hono server setup
- [ ] SQLite + Drizzle ORM
- [ ] Account CRUD operations
- [ ] Gemini API client wrapper
- [ ] Smart fallback logic (priority-based)
- [ ] OpenAI-compatible endpoint
- [ ] Master API key auth
- [ ] Request logging

#### **Phase 2: Dashboard (Week 1-2)**
- [ ] React + Vite setup
- [ ] shadcn/ui + Tailwind (dark mode)
- [ ] Login page (simple auth)
- [ ] Account table with real-time usage bars
- [ ] Add account modal (with API key validation)
- [ ] Stats overview cards
- [ ] Usage chart (Recharts, 24h)
- [ ] Real-time activity log

#### **Phase 3: Advanced Features (Week 2)**
- [ ] Queue system (30s timeout)
- [ ] Cost tracking & calculation
- [ ] Auto-detect rate limits (test + adaptive)
- [ ] Account recovery worker (background job)
- [ ] Streaming response support
- [ ] Error handling & retry logic
- [ ] Daily metrics aggregation

#### **Phase 4: Deploy & Polish (Week 2)**
- [ ] Logo AJ design (SVG)
- [ ] Responsive design (mobile-friendly)
- [ ] Loading states & smooth animations
- [ ] Error boundaries
- [ ] VPS deployment (Nginx + SSL)
- [ ] omp integration testing
- [ ] Documentation (README + deployment guide)

---

### 📝 Development Notes

#### **Important Decisions Made:**
1. ✅ **TypeScript over Go** (familiar, modern, Bun ecosystem)
2. ✅ **Deployed to VPS** (always online, access from anywhere)
3. ✅ **Private domain** (obscure subdomain, tidak di-publish)
4. ✅ **Simple auth** (no JWT complexity, username + password)
5. ✅ **Dark mode default** (Bro Jopal preference)
6. ✅ **Queue system hybrid** (max 30s, balance UX vs complexity)
7. ✅ **Cost tracking included** (monitor free vs paid tier usage)
8. ✅ **SQLite persistent** (simple, no separate DB server)

#### **Timeline Estimate:**
- **Week 1 (Days 1-7):** Core backend + basic dashboard
- **Week 2 (Days 8-14):** Advanced features + deployment + polish
- **Total:** ~14 days (2-3 hours/day, realistic untuk side project)

#### **Success Metrics:**
- ✅ Uptime >99% (VPS always online)
- ✅ Fallback rate <5% (primary account jarang limit)
- ✅ Average latency <500ms (fast response)
- ✅ Zero failed requests (kalo ada account available)
- ✅ omp seamless integration (gak kerasa ada router)
- ✅ Dashboard responsive <2s load time

---

### 🎯 Next Actions (When Starting Project)

1. **Setup project structure** (bun init, install dependencies)
2. **Initialize database schema** (Drizzle migrations)
3. **Build core account manager** (fallback logic first)
4. **Implement OpenAI-compatible endpoint** (test with curl)
5. **Build basic dashboard** (React + shadcn/ui)
6. **Test locally** (localhost, verify fallback works)
7. **Deploy to VPS** (production setup)
8. **Configure omp** (integration testing)
9. **Monitor & iterate** (fix bugs, improve UX)

---

### 🔗 Related Resources

- **Gemini API Docs:** https://ai.google.dev/docs
- **OpenAI API Spec:** https://platform.openai.com/docs/api-reference
- **Hono Framework:** https://hono.dev/
- **Drizzle ORM:** https://orm.drizzle.team/
- **shadcn/ui:** https://ui.shadcn.com/
- **Bun Runtime:** https://bun.sh/

---

**Project Status:** Ready to implement! All architectural decisions made, specs finalized. 🚀

**Last Updated:** 2026-10-25 by Ben & Bro Jopal
