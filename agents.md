# Unified Service Scheduler — Source Structure

## Project Overview

A full-stack appointment scheduling application for vehicle service dealerships.

- **Frontend:** React 18 + Vite + TypeScript (port `5173`)
- **Backend:** Node.js + Express + TypeScript (port `3001`)
- **Database:** PostgreSQL 16 (port `5432`)
- **Cache:** Redis 7 (port `6379`)

---

## Directory Tree

```
keyloop/
├── docker-compose.yml          # PostgreSQL + Redis containers
├── agents.md                   # This file — source structure docs
├── architecture.md             # System architecture document
├── ArchitectureExpectations.md # Full architecture + observability doc
├── Requirements.txt            # Project requirements
│
├── backend/                    # Express API server
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env                    # Local env (not committed)
│   ├── .env.example            # Env template
│   ├── prisma/
│   │   ├── schema.prisma       # Database schema (User, Role enum)
│   │   └── seed.ts             # Seeds ADMIN user
│   └── src/
│       ├── index.ts            # Express app entry point
│       ├── config/
│       │   └── index.ts        # Env-based config (PORT, DB, JWT, Redis)
│       ├── lib/
│       │   ├── prisma.ts       # Prisma client singleton
│       │   └── redis.ts        # ioredis client singleton
│       ├── middleware/
│       │   ├── auth.ts         # JWT guard + Redis blacklist check
│       │   ├── errorHandler.ts # Global error handler
│       │   └── logger.ts       # Pino request logger
│       └── modules/
│           └── auth/
│               ├── auth.routes.ts      # POST register/login/logout, GET me
│               ├── auth.controller.ts  # Request handling + validation
│               └── auth.service.ts     # Business logic (bcrypt, JWT, Redis)
│
└── frontend/                   # React SPA
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts          # Vite + TailwindCSS + API proxy
    ├── index.html
    └── src/
        ├── main.tsx            # React DOM entry
        ├── index.css           # TailwindCSS v4 setup + theme
        ├── App.tsx             # Router: /login, /register, / (protected)
        ├── lib/
        │   └── axios.ts        # Axios instance + JWT interceptor
        ├── store/
        │   ├── index.ts        # Redux store config
        │   ├── hooks.ts        # Typed useAppDispatch / useAppSelector
        │   └── authSlice.ts    # Auth state + async thunks
        ├── components/
        │   └── ProtectedRoute.tsx  # Redirects to /login if unauthenticated
        └── pages/
            ├── LoginPage.tsx       # Email/password login form
            ├── RegisterPage.tsx    # Name/email/password/phone form
            └── HomePage.tsx        # White page with nav bar + logout
```

---

## Quick Start

```bash
# 1. Start infrastructure
docker-compose up -d

# 2. Start backend
cd backend
npm install
npx prisma migrate dev --name init
npx prisma db seed
npm run dev

# 3. Start frontend (new terminal)
cd frontend
npm install
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
- Admin credentials: `admin@gmail.com` / `admin123`

---

## API Endpoints

| Method | Endpoint            | Auth     | Description           |
|--------|---------------------|----------|-----------------------|
| POST   | `/api/auth/register`| Public   | Create new user       |
| POST   | `/api/auth/login`   | Public   | Login, returns JWT    |
| POST   | `/api/auth/logout`  | Bearer   | Blacklist token       |
| GET    | `/api/auth/me`      | Bearer   | Get current user      |
| GET    | `/api/health`       | Public   | Health check          |

---

## Tech Stack

| Layer      | Technology                                  |
|------------|---------------------------------------------|
| Frontend   | React 18, Vite, TypeScript, TailwindCSS v4, ShadCn UI  |
| State      | Redux Toolkit                               |
| HTTP       | Axios (with interceptors)                   |
| Routing    | React Router DOM v6                         |
| Backend    | Node.js, Express, TypeScript                |
| ORM        | Prisma                                      |
| Auth       | JWT (jsonwebtoken) + bcrypt                 |
| Database   | PostgreSQL 16                               |
| Cache      | Redis 7 (ioredis)                           |
| Logging    | Pino                                        |
| Infra      | Docker Compose                              |

---

## Backend Coding & Styling Rules

### 1. Standard Response Structure

```json
{
  "success": true,
  "code": 200,
  "message": "Request successful",
  "data": {},
  "errors": null
}
```

#### Fields

* **success**: Boolean indicating request result
* **code**: HTTP status code or internal code
* **message**: Human-readable message
* **data**: Response payload
* **errors**: Error details (if any)

---

### 2. Error Response Example

```json
{
  "success": false,
  "code": 400,
  "message": "Validation failed",
  "data": null,
  "errors": {
    "email": "Email is required"
  }
}
```

---

### 3. Best Practices

#### 3.1 Keep Response Consistent

* Always return the same structure
* Avoid changing field names between endpoints

#### 3.2 Use HTTP Status Codes Properly

* 200: Success
* 201: Created
* 400: Bad Request
* 401: Unauthorized
* 404: Not Found
* 500: Server Error

#### 3.3 Separate Concerns

* `message`: for users
* `errors`: for debugging/details

---

### 4. Centralized Enums & Constants

#### 4.1 Error Codes (Single Source)

Create a centralized enum file:

```ts
export enum ErrorCode {
  UNKNOWN = "UNKNOWN",
  VALIDATION_ERROR = "VALIDATION_ERROR",
  UNAUTHORIZED = "UNAUTHORIZED",
  NOT_FOUND = "NOT_FOUND",
  INTERNAL_ERROR = "INTERNAL_ERROR"
}
```

#### 4.2 General Messages (i18n Ready)

Store messages in a separate file for scalability:

```ts
export const Messages = {
  SUCCESS: "Request successful",
  VALIDATION_ERROR: "Validation failed",
  UNAUTHORIZED: "Unauthorized",
  NOT_FOUND: "Resource not found",
  INTERNAL_ERROR: "Something went wrong"
};
```

➡ Future expansion:

```
/messages
  ├── en.ts
  ├── vi.ts
  ├── jp.ts
```

---

### 5. Role Enum (Authorization)

Centralize role definitions:

```ts
export enum Role {
  ADMIN = "ADMIN",
  USER = "USER",
  MODERATOR = "MODERATOR"
}
```

---

### 6. Recommended Response Wrapper (TypeScript)

```ts
export interface ApiResponse<T> {
  success: boolean;
  code: number;
  message: string;
  data?: T;
  errors?: any;
}
```

---

### 7. Example Usage

```ts
return {
  success: true,
  code: 200,
  message: Messages.SUCCESS,
  data: user
};
```

---

### 8. Key Principles Summary

* Keep response structure consistent
* Centralize enums (error codes, roles)
* Externalize messages for localization (i18n)
* Avoid hardcoding strings in business logic
* Make API predictable and scalable

---

### 9. Optional Enhancements

* Add `timestamp`
* Add `requestId` for tracing
* Add `pagination` for list endpoints

```json
{
  "success": true,
  "code": 200,
  "message": "Request successful",
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100
  }
}
```

## Frontend Coding & Styling Rules

### 1. Color System — shadcn/ui Tokens Only

All colors **must** come from shadcn/ui CSS variables. Never hard-code hex/RGB/HSL values in components.

| Usage          | Variable                  | Example class                     |
|----------------|---------------------------|-----------------------------------|
| Background     | `--background`            | `bg-background`                   |
| Foreground     | `--foreground`            | `text-foreground`                 |
| Primary        | `--primary`               | `bg-primary text-primary-foreground` |
| Secondary      | `--secondary`             | `bg-secondary`                    |
| Muted          | `--muted`                 | `bg-muted text-muted-foreground`  |
| Accent         | `--accent`                | `bg-accent text-accent-foreground`|
| Destructive    | `--destructive`           | `bg-destructive`                  |
| Card           | `--card`                  | `bg-card text-card-foreground`    |
| Popover        | `--popover`               | `bg-popover`                      |
| Border         | `--border`                | `border-border`                   |
| Input          | `--input`                 | `border-input`                    |
| Ring           | `--ring`                  | `ring-ring`                       |
| Chart 1 – 5    | `--chart-1` … `--chart-5` | `fill-chart-1`                   |
| Sidebar        | `--sidebar-*`             | `bg-sidebar`                      |

> **Rule:** If you need a color that doesn't exist, add a new CSS variable in `index.css` under the shadcn theme — do **not** inline a raw color value.

---

### 2. Theme — Ocean Breeze (tweakcn)

The project follows the **Ocean Breeze** preset from [tweakcn.com/editor/theme](https://tweakcn.com/editor/theme).  
Define the following CSS variables in `src/index.css` inside the `:root` / `.dark` blocks:

```css
/* Ocean Breeze — Light mode */
:root {
  --background: 200 20% 98%;
  --foreground: 213 31% 15%;
  --card: 200 20% 98%;
  --card-foreground: 213 31% 15%;
  --popover: 200 20% 98%;
  --popover-foreground: 213 31% 15%;
  --primary: 199 89% 48%;
  --primary-foreground: 0 0% 100%;
  --secondary: 185 42% 88%;
  --secondary-foreground: 213 31% 15%;
  --muted: 200 18% 93%;
  --muted-foreground: 213 10% 42%;
  --accent: 185 42% 88%;
  --accent-foreground: 213 31% 15%;
  --destructive: 0 84% 60%;
  --destructive-foreground: 0 0% 98%;
  --border: 200 18% 86%;
  --input: 200 18% 86%;
  --ring: 199 89% 48%;
  --radius: 0.5rem;
  --chart-1: 199 89% 48%;
  --chart-2: 173 58% 39%;
  --chart-3: 213 31% 15%;
  --chart-4: 43 96% 56%;
  --chart-5: 27 87% 67%;
}

/* Ocean Breeze — Dark mode */
.dark {
  --background: 213 31% 10%;
  --foreground: 200 20% 95%;
  --card: 213 31% 13%;
  --card-foreground: 200 20% 95%;
  --popover: 213 31% 13%;
  --popover-foreground: 200 20% 95%;
  --primary: 199 89% 48%;
  --primary-foreground: 0 0% 100%;
  --secondary: 213 25% 20%;
  --secondary-foreground: 200 20% 95%;
  --muted: 213 25% 18%;
  --muted-foreground: 200 10% 60%;
  --accent: 213 25% 20%;
  --accent-foreground: 200 20% 95%;
  --destructive: 0 72% 51%;
  --destructive-foreground: 0 0% 98%;
  --border: 213 25% 22%;
  --input: 213 25% 22%;
  --ring: 199 89% 48%;
  --chart-1: 199 89% 48%;
  --chart-2: 160 60% 45%;
  --chart-3: 30 80% 55%;
  --chart-4: 280 65% 60%;
  --chart-5: 340 75% 55%;
}
```

> **Rule:** When adding new pages or components, always verify they look correct in **both** light and dark modes.

---

### 3. Component Structure

Organise components into **category sub-folders** under `src/components/`:

```
src/components/
├── ui/               # shadcn/ui primitives (Button, Input, Card, etc.)
├── layout/           # App shell, Navbar, Sidebar, Footer, PageContainer
├── forms/            # Form-related composites (LoginForm, SearchBar)
├── feedback/         # Toasts, Alerts, Modals, Skeletons
└── shared/           # Cross-cutting presentational components (Logo, Avatar)
```

Rules:
- **One component per file.** File name = PascalCase component name (e.g. `Navbar.tsx`).
- **Co-locate** styles, tests, and types next to the component when they are component-specific.
- **Re-export** from an `index.ts` barrel file per folder for clean imports.
- Keep files under **200 lines**; extract sub-components when they exceed this.

---

### 4. Semantic HTML — Minimise `<div>`

Prefer semantic HTML elements over generic `<div>` wrappers:

| Instead of `<div>` | Use                                                    |
|---------------------|--------------------------------------------------------|
| Page wrapper        | `<main>`                                               |
| Navigation bar      | `<nav>`                                                |
| Page section        | `<section>` (with `aria-labelledby`)                   |
| Sidebar / aside     | `<aside>`                                              |
| Header area         | `<header>`                                             |
| Footer area         | `<footer>`                                             |
| Standalone content  | `<article>`                                            |
| List of items       | `<ul>` / `<ol>` with `<li>`                            |
| Figure + caption    | `<figure>` + `<figcaption>`                            |

> **Rule:** Only use `<div>` for **purely presentational** wrappers that carry no semantic meaning (e.g., flex/grid containers that have no logical grouping purpose). Every `<div>` should be justifiable.

---

### 5. Import Alias — `@` Path

Use the `@` alias to refer to `src/` in all imports. **Never** use relative paths like `../../`.

```ts
// ✅ Good
import { Button } from '@/components/ui/Button';
import { useAppSelector } from '@/store/hooks';

// ❌ Bad
import { Button } from '../../components/ui/Button';
import { useAppSelector } from '../store/hooks';
```

Configuration required:

**`tsconfig.app.json`** — add `baseUrl` and `paths`:
```jsonc
{
  "compilerOptions": {
    // ... existing options ...
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

**`vite.config.ts`** — add resolve alias:
```ts
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // ... rest of config
});
```
---

## 6. Responsive Design — Mobile First

All UI **must be responsive by default** using a **mobile-first approach**.

### Breakpoints (Tailwind defaults)

- `sm` → ≥ 640px (small tablets)  
- `md` → ≥ 768px (tablets)  
- `lg` → ≥ 1024px (laptops)  
- `xl` → ≥ 1280px (desktops)  

---

### Rules

- Design **mobile first**, then scale up using breakpoint prefixes:

```tsx
className="px-4 py-3 text-sm md:px-6 md:py-4 md:text-base lg:text-lg"
```

- Avoid fixed widths:

```tsx
// ❌ Bad
className="w-[400px]"

// ✅ Good
className="w-full max-w-md"
```

- Use flexible layouts:
  - flex, grid, gap-*
  - flex-col md:flex-row
  - grid-cols-1 md:grid-cols-2 lg:grid-cols-3

- Ensure spacing scales across screen sizes:
  - padding: p-4 md:p-6
  - margin: mt-4 md:mt-6
  - gap: gap-4 md:gap-6

---

### Typography Responsiveness

Text must scale properly across devices:

```tsx
className="text-base md:text-lg lg:text-xl"
```

Guidelines:
- Headings:
  - text-xl md:text-2xl lg:text-3xl
- Body:
  - text-sm md:text-base
- Avoid extremely small text (text-xs) unless necessary

---

### Layout Constraints

- Always wrap pages with a container:

```tsx
className="mx-auto w-full max-w-7xl px-4 md:px-6"
```

- Prevent overflow issues:

```tsx
className="overflow-hidden"
```

- Handle long content gracefully:

```tsx
className="truncate md:whitespace-normal"
```

---

### Touch & Accessibility

- Minimum touch target: 44px

```tsx
className="px-4"
```

- Avoid hover-only interactions:
  - Always support click/tap

---

> Rule: Every component must be usable and visually correct on mobile, tablet, and desktop.

---

## 7. Component Priority — shadcn/ui First

Always prioritize shadcn/ui components before building custom UI.

---

### Rules

- Use built-in components whenever possible:
  - Button
  - Input
  - Card
  - Dialog
  - DropdownMenu
  - Tabs
  - Badge
  - Avatar
  - Skeleton

```tsx
// Preferred
import { Button } from '@/components/ui/button';

// Avoid reinventing
<button className="px-4 py-2 rounded-md">Click</button>
```

---

### Composition over Reinvention

```tsx
<Button variant="secondary" size="lg" className="w-full md:w-auto">
  Submit
</Button>
```

```tsx
<Card>
  <CardHeader />
  <CardContent />
</Card>
```

---

### Custom Components — When Allowed

Only create custom components when:
- No equivalent exists in shadcn
- You are composing multiple primitives into a reusable pattern

---

### Styling Rules

- Use Tailwind + shadcn tokens only  
- Never override with raw CSS unless necessary  
- Prefer variant and size props over custom classes  

---

> Rule: If a UI element can be built using shadcn primitives, it must not be custom-built from scratch.

---

## Global Enforcement Rule

> Every UI must be responsive and built primarily using shadcn/ui primitives.

## 8. Global variables:
- Should place messages, error codes, constants in a centralized file
- Should put all global variables in a centralized file
- Should put path/Pages into a centralized file