# 🌱 EcoQuest — Gamifikasi Peduli Lingkungan Kantor

<p align="center">
  <strong>Aplikasi gamifikasi untuk mendorong perilaku ramah lingkungan di lingkungan kantor.</strong><br/>
  Kumpulkan poin dengan aksi hijau dan tukar dengan hadiah menarik!
</p>

---

## ✨ Fitur Utama

| Fitur | Deskripsi |
|-------|-----------|
| 🏠 **Dashboard** | Ringkasan statistik poin, streak, dan level pengguna |
| 🎯 **Misi Harian** | Misi eco-friendly yang bisa diselesaikan setiap hari |
| ⚔️ **Department Challenges** | Kompetisi antar departemen untuk aksi lingkungan |
| 🏆 **Leaderboard** | Papan peringkat pengguna berdasarkan poin |
| 📷 **QR Scanner** | Scan QR code untuk verifikasi misi |
| 🎁 **Marketplace** | Tukar poin dengan hadiah menarik |
| 🌍 **Impact Dashboard** | Visualisasi dampak nyata: CO₂ dihemat, pohon ditanam, plastik dikurangi |
| 🧮 **Carbon Calculator** | Kalkulator jejak karbon pribadi dengan tips pengurangan |
| 🌗 **Light/Dark Mode** | Tema terang dan gelap dengan animasi transisi smooth |
| 🔐 **Authentication** | Login dan registrasi pengguna |

## 🛠️ Tech Stack

- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS + shadcn/ui
- **Animation:** Framer Motion
- **Charts:** Recharts
- **Backend:** Lovable Cloud (Database, Auth, Edge Functions, Storage)
- **State Management:** TanStack React Query

## 🚀 Menjalankan di Lokal

### Prasyarat

- **Node.js** v18 atau lebih baru — [install via nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
- **npm** atau **bun**

### Langkah-langkah

```bash
# 1. Clone repository
git clone <YOUR_GIT_URL>

# 2. Masuk ke folder project
cd <YOUR_PROJECT_NAME>

# 3. Install dependencies
npm install

# 4. Jalankan development server
npm run dev
```

Aplikasi akan berjalan di `http://localhost:8080`

### Build untuk Production

```bash
npm run build
npm run preview
```

## 📁 Struktur Project

```
src/
├── assets/            # Gambar dan asset statis
├── components/        # Komponen React
│   ├── ui/            # shadcn/ui components
│   ├── Navigation.tsx # Navigasi utama + Header
│   ├── ThemeToggle.tsx # Toggle light/dark mode
│   ├── StatsOverview.tsx
│   ├── DailyMissions.tsx
│   ├── DepartmentChallenges.tsx
│   ├── Leaderboard.tsx
│   ├── QRScanner.tsx
│   ├── Marketplace.tsx
│   ├── ImpactDashboard.tsx
│   ├── CarbonCalculator.tsx
│   └── OnboardingGuide.tsx
├── contexts/          # React Context (Auth)
├── data/              # Mock data
├── hooks/             # Custom hooks (useTheme, useMissions, dll.)
├── integrations/      # Konfigurasi backend
├── pages/             # Halaman (Index, Auth, Profile)
└── lib/               # Utility functions
```

## 🎨 Design System

- **Dark Mode First** dengan dukungan Light Mode
- **Warna Utama:** Teal (Primary), Lime (Secondary), Coral (Accent)
- **Tipografi:** Space Grotesk (heading) + Inter (body)
- **Efek:** Glassmorphism, glow shadows, smooth transitions

## 📝 Lisensi

Project ini dibuat dengan [Lovable](https://lovable.dev).
