# NEXORA – AI-Powered Lost and Found Management System

> **"Lost Today, Found Tomorrow."**

NEXORA is a professional, full-stack-ready web application built for VVITU College. It features AI-assisted matching, secure ownership verification, role-based access control, and a polished SaaS-grade UI.

---

## 🚀 Quick Start

```bash
# Clone or navigate to project directory
cd NEXORAA

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at **http://localhost:5173**

---

## 🌐 How to Deploy (Vercel, Netlify, Render)

The project is pre-configured with all SPA routing redirect rules (`vercel.json`, `netlify.toml`, and `_redirects`):

### Option A: Deploy to Vercel (Recommended - 1 Click)
1. Push this folder to a GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "Initial NEXORA release"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<repo-name>.git
   git push -u origin main
   ```
2. Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Import your GitHub repository.
4. Vercel will automatically detect **Vite**:
   * Build Command: `npm run build`
   * Output Directory: `dist`
5. Click **"Deploy"**. The pre-configured `vercel.json` ensures all sub-routes (`/dashboard`, `/browse`, `/admin`, etc.) work without 404 errors on refresh!

### Option B: Deploy to Netlify (Drag & Drop or Git)
* **Drag & Drop (Instant):**
  1. Run `npm run build` locally.
  2. Log in to [app.netlify.com](https://app.netlify.com/drop).
  3. Drag and drop the generated `dist/` folder directly into Netlify Drop.
* **Via Git:**
  1. Connect your repository on Netlify.
  2. The pre-configured `netlify.toml` will handle the build and SPA redirect rules automatically.

---

## 👤 Demo Accounts

> ⚠️ **DEMO ONLY** – These credentials are for hackathon demonstration purposes only. Do NOT use in production.

| Role | Email | Password | Dashboard |
|------|-------|----------|-----------|
| General User | `arjun@vvitu.edu` | `demo1234` | `/dashboard` |
| Administrator | `admin@vvitu.edu` | `admin1234` | `/admin` |
| Super Admin | `superadmin@vvitu.edu` | `super1234` | `/system` |

You can also use the **Demo Role Switcher** (floating card in bottom-right corner) to switch roles instantly without logging out.

---

## 🏗️ Project Structure

```
NEXORAA/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── README.md
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── index.css
    │
    ├── context/
    │   ├── AuthContext.jsx      # Authentication & role management
    │   └── AppContext.jsx       # Global app state (items, claims, etc.)
    │
    ├── data/
    │   └── sampleData.js        # Sample data for demo
    │
    ├── services/
    │   ├── storageService.js    # LocalStorage abstraction
    │   ├── matchingEngine.js    # AI matching algorithm
    │   └── notificationService.js
    │
    ├── components/
    │   ├── Logo.jsx
    │   ├── Sidebar.jsx          # Role-aware navigation sidebar
    │   ├── Navbar.jsx           # Top navigation bar
    │   ├── DemoRoleSwitcher.jsx # Demo-only role switching
    │   ├── ProtectedRoute.jsx   # Route guards
    │   ├── StatCard.jsx
    │   ├── ItemCard.jsx
    │   ├── Badge.jsx
    │   ├── Modal.jsx
    │   ├── SearchBar.jsx
    │   ├── ImageUpload.jsx
    │   ├── NotificationPanel.jsx
    │   ├── LoadingSpinner.jsx
    │   └── EmptyState.jsx
    │
    └── pages/
        ├── Landing.jsx          # Public landing page
        ├── Login.jsx            # Login + demo accounts
        ├── Register.jsx         # User registration
        │
        ├── UserDashboard.jsx    # General user home
        ├── ReportLost.jsx       # Report lost item (3-step form)
        ├── ReportFound.jsx      # Report found item (3-step form)
        ├── BrowseItems.jsx      # Browse all items + search/filter
        ├── AIMatching.jsx       # AI match results
        ├── MyActivity.jsx       # Profile + activity tabs
        │
        ├── AdminDashboard.jsx   # Admin analytics
        ├── ItemManagement.jsx   # Admin item CRUD
        ├── OwnershipVerification.jsx  # Claim review workflow
        │
        └── SystemManagement.jsx # Super admin controls
```

---

## ✨ Features

### General Users
- 📋 Report lost items with detailed descriptions
- 🔍 Report found items with storage location
- 🤖 AI-powered matching between lost and found items
- 📊 Browse all items with search and filters
- 📝 Submit ownership claims with private identifying details
- 🔔 Real-time notifications for matches and claim updates
- 👤 Profile management and activity history

### Administrators
- 📊 Analytics dashboard with charts
- ✅ Review and manage all item reports
- 🔒 Secure ownership verification workflow
- 📋 Compare claimant answers with private item details
- ✍️ Approve/reject claims with handover records
- 🚩 Flag suspicious reports

### Super Admins
- 👥 Manage all user accounts and roles
- ➕ Create administrator accounts
- 🏛️ Configure campus locations and categories
- 📜 View complete audit logs
- ⚙️ System settings management
- 🔐 Security monitoring

---

## 🤖 AI Matching Engine

NEXORA uses a **transparent, weighted text-similarity algorithm** to match lost and found items:

| Signal | Weight |
|--------|--------|
| Category exact match | 25 pts |
| Color similarity | 20 pts |
| Item name token overlap | 20 pts |
| Brand match | 15 pts |
| Description keyword overlap | 10 pts |
| Location match | 5 pts |
| Date proximity | 5 pts |
| **Total** | **100 pts** |

**Score interpretation:**
- 🟢 **70–100:** High confidence match
- 🟡 **40–69:** Medium confidence
- 🔴 **0–39:** Low confidence

> **Note:** Image comparison requires integration with an external AI service (e.g., Google Vision API, CLIP). The matching engine is designed for drop-in extension. See `src/services/matchingEngine.js`.

---

## 🔐 Security Notes

> ⚠️ **This is a frontend hackathon demo.** The following apply ONLY to the demo:

- Authentication uses hardcoded demo credentials (see above)
- Data is stored in `localStorage` (browser-only, not secure)
- Role switching is available to all users for demo purposes

**For production, the following must be implemented:**
- Supabase Auth with JWT tokens
- Row Level Security (RLS) policies
- Server-side authorization checks
- Encrypted storage for private item details
- Proper session management

The codebase is structured to support Supabase integration with minimal changes to context files.

---

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 18.x | UI framework |
| Vite | 6.x | Build tool |
| React Router DOM | 6.x | Client-side routing |
| Tailwind CSS | 3.x | Styling |
| Lucide React | latest | Icons |
| LocalStorage | Browser API | Demo data persistence |

---

## 📍 Campus Locations

Main Block · Library · Canteen · Computer Laboratory · Electronics Laboratory · Mechanical Laboratory · Seminar Hall · Parking Area · Sports Ground · Hostel · Auditorium

## 🏷️ Item Categories

Mobile Phones · Wallets · ID Cards · Laptops · Earphones · Books · Bags · Keys · Watches · Other

---

## 🔄 Resetting Demo Data

To reset all demo data to the original sample data:
1. Login as Super Admin
2. Go to System Management → Security tab
3. Click "Reset All Demo Data"

Or open browser console:
```js
localStorage.clear(); location.reload();
```

---

## 📄 License

Built for VVITU College Hackathon 2024. All rights reserved.

---

*NEXORA – Making lost items findable, one AI match at a time.*
