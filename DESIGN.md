# Freddy Finance App — Design Document

> **Source:** Stitch Project "Interactive 3D Particle Globe" (`projects/11338038450918731363`)
> **Design System:** Celestial Monochrome
> **Last Updated:** 2026-05-14

---

## 1. App Overview

**Freddy** is a premium personal finance management app. The design aesthetic is futuristic, cinematic, and immersive — a hybrid of **Minimalism** and **Atmospheric Glassmorphism**. It should feel like a high-end console from a near-future spacecraft: functional, clean, and ethereal.

The entire interface is **strictly monochromatic** (pure black + pure white). Depth and hierarchy come from **translucency, backdrop blurs, glow effects, and particle textures** — never from color.

---

## 2. Design System — "Celestial Monochrome"

### 2.1 Colors

| Token                  | Value                          | Usage                                      |
|------------------------|--------------------------------|---------------------------------------------|
| `--bg-primary`         | `#000000`                      | Pure black. Page backgrounds. Non-negotiable |
| `--bg-surface`         | `#131313`                      | Slightly lifted surface                     |
| `--bg-surface-container` | `#1f1f1f`                    | Cards, containers                           |
| `--bg-surface-high`    | `#2a2a2a`                      | Elevated containers                         |
| `--bg-surface-highest` | `#353535`                      | Highest elevation surfaces                  |
| `--text-primary`       | `#FFFFFF`                      | Headlines, high-priority text               |
| `--text-secondary`     | `#e2e2e2`                      | Body text                                   |
| `--text-muted`         | `#c4c7c8` / `rgba(255,255,255,0.7)` | Descriptions, labels               |
| `--border`             | `rgba(255, 255, 255, 0.1)`     | Card borders, dividers                      |
| `--border-subtle`      | `#333333` / `rgba(255,255,255,0.06)` | Very subtle structure lines        |
| `--glow`               | `0 0 8px rgba(255,255,255,0.4)` | White glow on interactive elements         |
| `--outline`            | `#8e9192`                      | Focused outlines                            |
| `--error`              | `#ffb4ab`                      | Error text                                  |
| `--error-container`    | `#93000a`                      | Error background                            |

### 2.2 Typography

| Style          | Font            | Size  | Weight | Spacing      | Usage                        |
|----------------|-----------------|-------|--------|-------------|-------------------------------|
| `display-xl`   | Geist           | 72px  | 200    | 0.05em       | Hero headlines                |
| `headline-lg`  | Geist           | 48px  | 300    | 0.03em       | Section titles                |
| `headline-lg-mobile` | Geist     | 32px  | 300    | 0.02em       | Section titles (mobile)       |
| `title-md`     | Inter           | 24px  | 500    | 0.01em       | Card titles, sub-headers      |
| `body-base`    | Inter           | 16px  | 400    | 0            | Body text, descriptions       |
| `label-sm`     | JetBrains Mono  | 12px  | 500    | 0.1em        | Labels, metadata, buttons     |

**Font CDN sources:**
- Geist: `cdn.jsdelivr.net/gh/vercel/geist-font@v1.0.0/fonts/geist-sans/`
- Inter + JetBrains Mono: Google Fonts

### 2.3 Spacing

| Token            | Value    |
|------------------|----------|
| `unit`           | 4px      |
| `gutter`         | 24px     |
| `margin-safe`    | 40px     |
| `section-gap`    | 120px    |
| `container-max`  | 1440px   |

### 2.4 Border Radius

| Token     | Value     |
|-----------|-----------|
| `sm`      | 0.125rem  |
| `DEFAULT` | 0.25rem   |
| `md`      | 0.375rem  |
| `lg`      | 0.5rem    |
| `xl`      | 0.75rem   |
| `full`    | 9999px    |

### 2.5 Elevation & Depth

| Level | Background                         | Treatment                              |
|-------|------------------------------------|-----------------------------------------|
| L1    | Pure black                         | Animated particles behind               |
| L2    | `rgba(255,255,255,0.03)`           | `backdrop-filter: blur(20-40px)`        |
| L3    | `rgba(20,20,20,0.8)`              | 1px white border at 10% opacity         |

---

## 3. Component Patterns

### Buttons
- **Primary:** Solid white `#fff`, black text `#0a0a0a`. Hover → white glow (`box-shadow: 0 0 24px rgba(255,255,255,0.25)`). Active → `scale(0.98)`.
- **Secondary/Ghost:** 1px white border at 20% opacity, no fill. Hover → text brightens to white.
- **Typography:** `label-sm` style (JetBrains Mono, 12px, 500, uppercase, 0.1em+ tracking).

### Cards
- No solid background.
- `border: 1px solid rgba(255,255,255,0.1)`
- `backdrop-filter: blur(10px)`
- `background: rgba(255,255,255,0.03)`
- Hover: subtle brightness increase `rgba(255,255,255,0.05)`

### Inputs
- Bottom-border only: `1px solid rgba(255,255,255,0.2)`
- Focus: border becomes fully white + subtle glow
- Or: full-border ghost style with `background: rgba(255,255,255,0.03)`

### Navigation (Sidebar — Dashboard pages)
- Fixed left sidebar, dark background (`#0e0e0e` or `#131313`)
- Icons from Material Symbols Outlined (weight 300)
- Active state: white text + subtle left indicator
- Inactive: `rgba(255,255,255,0.4)`

### Data/Stats
- Large numbers in Geist (light weight)
- Sub-labels in JetBrains Mono (uppercase, tracked)
- Trend indicators: ↑ up / ↓ down with opacity changes (no color)

---

## 4. Screen Inventory

### 4.1 Existing Files (already built)

| File               | Screen Title                      | Status |
|--------------------|-----------------------------------|--------|
| `herosection.html` | Aetheris — Interactive Particle Sphere (Landing/Hero) | ✅ Done |
| `signin.html`      | Freddy — Sign In                  | ✅ Done |

### 4.2 Screens To Build (from Stitch)

| # | Screen Title                   | Target File            | Stitch Screen ID                         | Description |
|---|-------------------------------|------------------------|------------------------------------------|-------------|
| 1 | **Freddy — Main Dashboard**    | `dashboard.html`       | `2d64b9dc201d448d959e114a851c4277`       | Core financial overview. Balance cards, recent transactions summary, quick actions, mini charts. |
| 2 | **Freddy — Transaction History** | `transactions.html`  | `df36d090de2b48c0813897a345d308bc`       | Full transaction list with search, filters (date, category, type), sort options. |
| 3 | **Freddy — Add Expense**       | `add-expense.html`     | `91786ec502a348418a060449f4c6f598`       | Form to log a new expense. Category picker, amount, date, notes, recurring toggle. |
| 4 | **Freddy — Add Income**        | `add-income.html`      | `edd69068956646a8a758b9ae9f2392bf`       | Form to log new income. Source, amount, date, notes. |
| 5 | **Freddy — Savings Goals**     | `savings.html`         | `722aa169a1d140d9930262b663487739`       | Savings targets with progress bars, goal cards, add new goal. |
| 6 | **Freddy — Budget Management** | `budgets.html`         | `c8a806eaf7e74429ace55334fa0d194d`       | Budget allocation per category, spent vs. remaining, doughnut/bar charts. |
| 7 | **Freddy — Analytics & Insights** | `analytics.html`    | `0b88da850fc442ac9602283210e31752`       | Spending trends, income vs expense charts, category breakdowns, insights cards. |
| 8 | **Freddy — Account Settings**  | `settings.html`        | `a6f0fe93b0d44633b802d1c43456bacd`       | Profile info, notification preferences, security (change password), appearance toggle, data export. |

---

## 5. Navigation Map

```
herosection.html (Landing Page)
  └── [Sign In] → signin.html
                    └── [Auth Success] → dashboard.html

dashboard.html (Main Hub)
  ├── Sidebar Navigation:
  │   ├── Dashboard     → dashboard.html
  │   ├── Transactions  → transactions.html
  │   ├── Budgets       → budgets.html
  │   ├── Savings       → savings.html
  │   ├── Analytics     → analytics.html
  │   └── Settings      → settings.html
  │
  ├── Quick Actions:
  │   ├── [+ Add Expense] → add-expense.html
  │   └── [+ Add Income]  → add-income.html
  │
  └── [Sign Out] → herosection.html (clear session)
```

---

## 6. File Structure (Target)

```
FREDDYS FINANCE APP/
├── DESIGN.md                ← This file
├── README.md
├── herosection.html         ✅ Landing page with 3D particle sphere
├── signin.html              ✅ Authentication page (hardcoded: freddy/freddy)
├── dashboard.html           🔲 Main dashboard
├── transactions.html        🔲 Transaction history
├── add-expense.html         🔲 Add expense form
├── add-income.html          🔲 Add income form
├── savings.html             🔲 Savings goals
├── budgets.html             🔲 Budget management
├── analytics.html           🔲 Analytics & insights
└── settings.html            🔲 Account settings
```

---

## 7. Shared Layout (Dashboard Pages)

All dashboard pages (everything except `herosection.html` and `signin.html`) share a common layout:

```
┌─────────────────────────────────────────────────────┐
│  Fixed Sidebar (240px)  │      Main Content Area      │
│                         │                             │
│  ┌─────────────────┐    │  ┌───────────────────────┐  │
│  │  Logo: Freddy   │    │  │  Top Bar (breadcrumb  │  │
│  │                 │    │  │  + user avatar)        │  │
│  │  ─────────────  │    │  └───────────────────────┘  │
│  │  📊 Dashboard   │    │                             │
│  │  📋 Transactions│    │  Page-specific content      │
│  │  💰 Budgets     │    │  ...                        │
│  │  🎯 Savings     │    │                             │
│  │  📈 Analytics   │    │                             │
│  │                 │    │                             │
│  │  ─────────────  │    │                             │
│  │  ⚙️ Settings    │    │                             │
│  │  🚪 Sign Out    │    │                             │
│  └─────────────────┘    │                             │
└─────────────────────────────────────────────────────┘
```

- Sidebar: `width: 240px`, `background: #0e0e0e`, `position: fixed`
- Main: `margin-left: 240px`, `padding: 40px`
- Top bar: User greeting + avatar + current date
- Mobile: Sidebar collapses into a hamburger menu

---

## 8. Auth Flow

1. `signin.html` validates against hardcoded credentials (`freddy` / `freddy`)
2. On success → `sessionStorage.setItem('freddy_authenticated', 'true')`
3. Redirects to `dashboard.html`
4. All dashboard pages check `sessionStorage.getItem('freddy_authenticated')`
   - If not authenticated → redirect to `signin.html`
5. Sign out → `sessionStorage.clear()` → redirect to `herosection.html`

---

## 9. Interaction & Motion Guidelines

- **Transitions:** 300ms default, ease or ease-out
- **Card entry:** Fade-in + translateY(20px→0) on page load, staggered 100ms
- **Hover states:** Subtle border brighten + background luminance shift
- **Button press:** `scale(0.98)` + `opacity(0.9)`
- **Page transitions:** Keep snappy — no full-page animations between HTML files
- **Charts:** Use CSS-only or lightweight canvas (no heavy chart libraries unless needed)
- **Particles:** Optional subtle background particles on dashboard (lighter than hero)

---

## 10. Implementation Notes

- **No framework** — Pure HTML + CSS + vanilla JS (each page is a standalone `.html` file)
- **Tailwind CDN** used in `herosection.html` — dashboard pages will use **vanilla CSS** with CSS custom properties for the design tokens (cleaner, no CDN dependency for inner pages)
- **Icons:** Material Symbols Outlined (Google Fonts CDN)
- **Fonts:** Geist (Vercel CDN), Inter + JetBrains Mono (Google Fonts)
- **Data:** All financial data is hardcoded/mock (no backend)
- **Auth:** `sessionStorage` based, hardcoded credentials
- **Responsive:** Desktop-first, with mobile breakpoints at 768px and 480px
