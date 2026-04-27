<div align="center">

<img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js" />
<img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
<img src="https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
<img src="https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white" />

# 🎵 MaiMap

**Community-driven arcade locator for maimai DX**

Find arcades, share tips, and connect with the community — across Vietnam, Australia, and beyond.

[🗺️ View Map](#) · [📋 Browse Locations](#) · [🛡️ Admin Panel](#)

</div>

---

## ✨ Features

### For Players
- 🗺️ **Interactive Map** — Leaflet-powered dark map with custom pins for all 79+ arcade locations
- 📋 **List View** — Browse locations grouped by country with search & filters
- ✅ **Verified Badges** — Community-verified locations marked by moderators
- 💬 **Community Posts** — Share tips, hours, and news for each location
- 🧵 **Threaded Comments** — Reply to posts with nested comment support
- 🚩 **Report System** — Flag inappropriate content for review
- 🔐 **Authentication** — Register/login with secure JWT-based sessions

### For Moderators
- 📥 **Content Queue** — Approve, hide, or delete pending posts and comments
- 🚩 **Report Queue** — Resolve or dismiss community reports
- 📍 **Location Management** — Verify locations and edit details inline

### For Admins
- 👥 **User Management** — Ban/unban users, assign roles (user / moderator / admin)
- ⚙️ **Site Settings** — Toggle post/comment approval requirements, keyword filters

---

## 🖼️ Preview

| Map View | Location Detail | Admin Panel |
|---|---|---|
| Interactive dark map with all pins | Posts, comments, Google Maps link | Stats dashboard + moderation tools |

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) v18 or later
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/fishuvn/maimap.git
cd maimap

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

> The SQLite database (`maimap.db`) is **automatically created and seeded** with all locations on first launch. No manual setup needed.

### Default Admin Account

| Field | Value |
|---|---|
| Username | `admin` |
| Password | `admin123` |

> ⚠️ Change this password immediately in a production environment.

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router) |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS v4 + custom glassmorphism |
| **Database** | SQLite via [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) |
| **Authentication** | JWT via [jose](https://github.com/panva/jose) + [bcryptjs](https://github.com/dcodeIO/bcrypt.js) |
| **Map** | [Leaflet](https://leafletjs.com/) / [React-Leaflet](https://react-leaflet.js.org/) |
| **Icons** | [Lucide React](https://lucide.dev/) |

---

## 📁 Project Structure

```
maimap/
├── app/
│   ├── api/                    # API routes (auth, locations, admin)
│   │   ├── auth/               # register, login, logout, me
│   │   ├── locations/          # list, detail, posts
│   │   ├── posts/              # comments
│   │   ├── reports/            # submit reports
│   │   └── admin/              # queue, reports, users, settings, stats
│   ├── admin/                  # Admin panel pages
│   │   ├── queue/              # Content moderation queue
│   │   ├── reports/            # Report management
│   │   ├── locations/          # Location verification
│   │   ├── users/              # User management
│   │   └── settings/           # Site configuration
│   ├── locations/[id]/         # Location detail page
│   ├── login/                  # Login page
│   ├── register/               # Registration page
│   ├── globals.css             # Global styles + Leaflet overrides
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Home page (map + list view)
├── components/
│   ├── auth/                   # AuthProvider, AuthModal
│   ├── layout/                 # Navbar
│   ├── location/               # LocationCard
│   └── map/                    # MapView (Leaflet)
├── lib/
│   ├── db.ts                   # SQLite connection + schema + seeding
│   ├── auth.ts                 # JWT sign/verify utilities
│   └── utils.ts                # Formatting helpers, role badges
├── middleware.ts               # Route protection for /admin/*
├── next.config.ts
├── postcss.config.mjs
└── package.json
```

---

## 🔐 Role System

| Permission | User | Moderator | Admin |
|---|:---:|:---:|:---:|
| View map & locations | ✅ | ✅ | ✅ |
| Create posts & comments | ✅ | ✅ | ✅ |
| Report content | ✅ | ✅ | ✅ |
| Approve / hide content | ❌ | ✅ | ✅ |
| Manage reports | ❌ | ✅ | ✅ |
| Verify locations | ❌ | ✅ | ✅ |
| Ban / unban users | ❌ | ❌ | ✅ |
| Assign roles | ❌ | ❌ | ✅ |
| System settings | ❌ | ❌ | ✅ |

---

## 🌍 Locations

Currently seeded with **79 arcade locations** across:

| Country | Locations |
|---|---|
| 🇻🇳 Vietnam | Ho Chi Minh City, Hanoi, and more |
| 🇦🇺 Australia | Melbourne, Adelaide, and more |

To add more locations, edit `data/locations.json` and re-seed, or use the Admin → Locations panel.

---

## ⚙️ Environment Variables

Create a `.env.local` file to override defaults:

```env
# JWT signing secret (change this in production!)
JWT_SECRET=your-super-secret-key-here
```

---

## 📄 License

[MIT](LICENSE) — feel free to fork and adapt for your own arcade community.

---

<div align="center">
Made with ❤️ for the maimai DX community
</div>
