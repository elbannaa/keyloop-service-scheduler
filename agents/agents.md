# Unified Service Scheduler — Source Structure & Agent Guide

## 1. Project Overview

A full-stack appointment scheduling application for vehicle service dealerships.

- **Frontend:** React 19 + Vite + TypeScript (port `5173`)
- **Backend:** Node.js + Express + TypeScript (port `3001`)
- **Database:** PostgreSQL 16 (port `5432`)
- **Cache:** Redis 7 (port `6379`)

---

## 2. Directory Tree

```
keyloop/
├── docker-compose.yml          # PostgreSQL + Redis containers
├── README.md                   # General project documentation
├── agents/                     # Agent-facing documentation
│   └── agents.md               # This file — source structure & rules
│
├── backend/                    # Express API server
│   ├── prisma/
│   │   ├── schema.prisma       # Database schema
│   │   └── seed.ts             # Seeds ADMIN user
│   └── src/
│       ├── index.ts            # Entry point
│       ├── constants/
│       │   ├── response.ts     # ApiResponse, ErrorCode, Messages
│       │   └── role.ts         # Role enum
│       ├── middleware/
│       │   ├── auth.ts         # JWT guard + Redis blacklist
│       │   ├── errorHandler.ts # Global error handler
│       │   └── logger.ts       # Pino request logger
│       └── modules/
│           ├── appointments/   # Scheduling engine & logic
│           ├── auth/           # Authentication
│           ├── dealerships/    # Dealership & resources
│           └── users/          # User management
│
└── frontend/                   # React SPA
    ├── src/
    │   ├── main.tsx            # Entry & ConfigProvider (antd theme)
    │   ├── index.css           # Tailwind v4 setup + HSL tokens
    │   ├── lib/
    │   │   └── axios.ts        # Axios + JWT interceptor
    │   ├── store/              # Redux Toolkit
    │   ├── components/         # UI Architecture (antd-first)
    │   └── pages/              # Route components
```

---

## 3. Architecture & Tech Stack

Refer to [README.md](../README.md) for detailed architecture diagrams, sequence diagrams, and technology justifications.

---

## 4. Backend Coding Rules

### 4.1 Standard Response Structure
All API responses must follow the `ApiResponse` interface defined in `backend/src/constants/response.ts`:

```ts
export interface ApiResponse<T = any> {
  success: boolean;
  code: number;
  message: string;
  data?: T;
  errors?: any;
}
```

### 4.2 Error Handling & Centralized Constants
- **Error Codes**: Use the `ErrorCode` enum.
- **Messages**: Use the `Messages` constant object.
- **Location**: Both are in `@/constants/response.ts`.
- **Global Error Handler**: `backend/src/middleware/errorHandler.ts` automatically wraps errors in the `ApiResponse` structure.

### 4.3 Authorization & Roles
- Use the `Role` enum from `@/constants/role.ts` (ADMIN, USER, MODERATOR).
- Protect routes using the `authGuard` middleware in `@/middleware/auth.ts`.

---

## 5. Frontend Coding Rules

### 5.1 Design System — HSL & antd Tokens
- **HSL Variables**: Primary colors are defined in `src/index.css`.
- **antd Theme**: Configured via `ConfigProvider` in `src/main.tsx`.
- **Mapping**: HSL variables are mapped to Tailwind colors in `index.css` via `@theme inline`.

### 5.2 Component Priority — antd First
- **Rule**: Always use **Ant Design (antd)** components (`Button`, `Table`, `Card`, etc.) before building custom UI.
- **Styling**: Use Tailwind CSS v4 for layout (flex, grid) and spacing. Avoid hardcoding hex colors; use Tailwind classes (e.g., `bg-primary`, `text-foreground`).

### 5.3 Semantic HTML & Mobile First
- Use semantic tags (`<main>`, `<nav>`, `<section>`) instead of generic `<div>`.
- All layouts must be **responsive by default** using Tailwind's mobile-first prefixes (e.g., `w-full max-w-md md:max-w-lg`).

### 5.4 Import Alias
- Use `@/` to refer to the `src/` directory.

---

## 6. Global Enforcement Rule

> UI must be responsive, built primarily with **antd**, and backend responses MUST strictly follow the **ApiResponse** structure.