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
│       ├── middleware/
│       │   ├── auth.ts         # JWT guard + Redis blacklist check
│       │   ├── errorHandler.ts # Global error handler
│       │   └── logger.ts       # Pino request logger
│       └── modules/
│           ├── appointments/   # Appointment scheduling & availability
│           ├── auth/           # Login, register, logout, me
│           ├── dealerships/    # Dealership & tech/vehicle management
│           └── users/          # User management (Admin only)

└── frontend/                   # React SPA
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts          # Vite + TailwindCSS + API proxy
    ├── index.html
    └── src/
        ├── main.tsx            # React DOM entry
        ├── index.css           # TailwindCSS v4 setup + theme
        ├── App.tsx             # Main router & provider setup
        ├── lib/
        │   └── axios.ts        # Axios instance + JWT interceptor
        ├── store/
        │   ├── index.ts        # Redux store config
        │   ├── hooks.ts        # Typed useAppDispatch / useAppSelector
        │   └── authSlice.ts    # Auth state + async thunks
        ├── components/                   # Sub-divided UI components
        │   ├── appointments/           # Appointment specific components
        │   ├── forms/                  # Form composites
        │   ├── layout/                 # App shell, Navbar, Sidebar
        │   ├── shared/                 # Common UI (ProtectedRoute, etc.)
        │   └── ui/                     # antd primitives
        ├── pages/
            ├── AppointmentsPage.tsx # List of appointments
            ├── BookingPage.tsx      # Customer booking flow
            ├── DealershipsPage.tsx  # Dealership management
            ├── LoginPage.tsx        # Login form
            ├── RegisterPage.tsx     # Registration form
            ├── SchedulePage.tsx     # Admin/Manager calendar view
            ├── UsersPage.tsx        # User management list
            └── UnauthorizedPage.tsx # 403 access denied page
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

### Auth
| Method | Endpoint            | Auth     | Description           |
|--------|---------------------|----------|-----------------------|
| POST   | `/api/auth/register`| Public   | Create new user       |
| POST   | `/api/auth/login`   | Public   | Login, returns JWT    |
| POST   | `/api/auth/logout`  | Bearer   | Blacklist token       |
| GET    | `/api/auth/me`      | Bearer   | Get current user      |

### Users (Admin Only)
| Method | Endpoint            | Auth     | Description           |
|--------|---------------------|----------|-----------------------|
| GET    | `/api/users`        | Admin    | List all users        |
| POST   | `/api/users`        | Admin    | Create new user       |
| GET    | `/api/users/:id`    | Admin    | Get user details      |
| PATCH  | `/api/users/:id`    | Admin    | Update user info      |
| PATCH  | `/api/users/:id/status`| Admin | Activate/Deactivate   |

### Dealerships
| Method | Endpoint                    | Auth     | Description           |
|--------|-----------------------------|----------|-----------------------|
| GET    | `/api/dealerships`          | Bearer   | List dealerships      |
| POST   | `/api/dealerships`          | Admin    | Create dealership     |
| GET    | `/api/dealerships/:id`      | Bearer   | Get dealership details|
| PATCH  | `/api/dealerships/:id`      | Admin/Mgr| Update dealership     |
| PATCH  | `/api/dealerships/:id/status`| Admin/Mgr| Toggle active state   |
| POST   | `/api/dealerships/:id/technicians`| Admin/Mgr| Add technician  |
| DELETE | `/api/dealerships/:id/technicians/:tid`| Admin/Mgr| Remove tech |
| POST   | `/api/dealerships/:id/vehicles`| Admin/Mgr| Add vehicle        |
| DELETE | `/api/dealerships/:id/vehicles/:vid`| Admin/Mgr| Remove vehicle |

### Appointments
| Method | Endpoint                    | Auth     | Description           |
|--------|-----------------------------|----------|-----------------------|
| GET    | `/api/appointments`         | Bearer   | List appointments     |
| POST   | `/api/appointments`         | Public   | Create appointment    |
| PATCH  | `/api/appointments/:id`     | Admin/Mgr| Update appointment    |
| GET    | `/api/appointments/availability`| Public| Check available slots|
| GET    | `/api/appointments/schedule`| Admin/Mgr| Get calendar schedule |
| PATCH  | `/api/appointments/:id/cancel`| Admin/Mgr| Cancel appointment  |

### General
| Method | Endpoint            | Auth     | Description           |
|--------|---------------------|----------|-----------------------|
| GET    | `/api/health`       | Public   | Health check          |

---

## Tech Stack

| Layer      | Technology                                  |
|------------|---------------------------------------------|
| Frontend   | React 19, Vite, TypeScript, TailwindCSS v4, Ant Design (antd) |
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

### 1. Color System — HSL Variables & Ant Design Tokens

The project uses a hybrid color system. Core colors are defined as HSL variables in `index.css` and mapped to Tailwind colors and Ant Design tokens via `ConfigProvider` in `main.tsx`.

| Usage          | CSS Variable (HSL)      | Tailwind Class (v4)               |
|----------------|-------------------------|-----------------------------------|
| Background     | `--background`          | `bg-background`                   |
| Foreground     | `--foreground`          | `text-foreground`                 |
| Primary        | `--primary`             | `bg-primary`                      |
| Secondary      | `--secondary`           | `bg-secondary`                    |
| Muted          | `--muted`               | `bg-muted`                        |
| Accent         | `--accent`              | `bg-accent`                       |
| Destructive    | `--destructive`         | `bg-destructive`                  |
| Border         | `--border`              | `border-border`                   |

> **Rule:** For `antd` components, the theme is automatically applied via `ConfigProvider`. For custom elements, use Tailwind classes mapped to these variables. Never hard-code hex/RGB values.

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
├── ui/               # antd primitives
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

## 7. Component Priority — Ant Design (antd) First

Always prioritize Ant Design components before building custom UI.

---

### Rules

- Use built-in `antd` components whenever possible:
  - `Button`, `Input`, `Select`, `DatePicker`
  - `Card`, `Table`, `List`
  - `Modal`, `Drawer`, `Message`, `Notification`
  - `Tabs`, `Steps`, `Badge`, `Avatar`
  - `Typography` (`Title`, `Text`)

```tsx
// Preferred
import { Button, Table } from 'antd';

// Avoid reinventing
<button className="px-4 py-2 rounded-md">Submit</button>
```

---

### Composition over Reinvention

```tsx
<Card title="Appointment Detail" variant="borderless">
  <Table columns={columns} dataSource={data} />
</Card>
```

---

### Custom Components — When Allowed

Only create custom components when:
- No equivalent exists in Ant Design
- You are composing multiple `antd` primitives into a unique domain pattern (e.g., `AppointmentDetailModal`)

---

### Styling Rules

- Use `antd` tokens via `ConfigProvider` for global consistency.
- Use Tailwind CSS v4 for layout (flex, grid, spacing) and minor visual tweaks.
- Prefer `antd` props (`type`, `size`, `danger`, `variant`) over custom classes for standard components.

---

> Rule: If a UI element can be built using Ant Design primitives, it must not be custom-built from scratch.

---

## Global Enforcement Rule

> Every UI must be responsive and built primarily using Ant Design (antd) components.

## 8. Global variables:
- Should place messages, error codes, constants in a centralized file
- Should put all global variables in a centralized file
- Should put path/Pages into a centralized file