# Unified Service Scheduler — Architecture Design Document

---

## 1. Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                          CLIENT LAYER                               │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │              React SPA (Vite + TypeScript)                    │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────────┐ ┌────────────┐    │  │
│  │  │  Auth    │ │Dealership│ │   Booking    │ │   Admin    │    │  │
│  │  │  Pages   │ │Dashboard │ │    Flow      │ │  Dashboard │    │  │
│  │  └──────────┘ └──────────┘ └──────────────┘ └────────────┘    │  │
│  └───────────────────────────────────────────────────────────────┘  │
└────────────────────────────────┬────────────────────────────────────┘
                                 │ HTTPS (REST)
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   NODE.JS BACKEND (Express + TypeScript)            │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                      Middleware Layer                        │   │
│  │         JWT Guard · Logger · Error Handler · CORS            │   │
│  └──────────────────────────────────────────────────────────────┘   │
│  ┌────────────┐ ┌────────────┐ ┌──────────────┐ ┌──────────────┐    │
│  │    Auth    │ │ Dealership │ │   Booking    │ │ Notification │    │
│  │   Module   │ │   Module   │ │   Module     │ │    Module    │    │
│  │            │ │            │ │              │ │              │    │
│  │ • Register │ │ • CRUD     │ │ • Check      │ │ • Email via  │    │
│  │ • Login    │ │ • Search   │ │  Availability│ │   Nodemailer │    │
│  │ • JWT      │ │ • Sort     │ │ • Lock Slot  │ │              │    │
│  │            │ │ • Paginate │ │ • Confirm    │ │              │    │
│  │            │ │            │ │ • Approve    │ │              │    │
│  └────────────┘ └────────────┘ └──────┬───────┘ └──────────────┘    │
│  ┌────────────────────────────────────┴─────────────────────────┐   │
│  │              Availability Engine (Core Service)              │   │
│  │  Redis lock management · Time-slot collision detection       │   │
│  │  Technician + ServiceBay matching · Duration calculation     │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
           │                                  │
           ▼                                  ▼
┌─────────────────────────┐      ┌─────────────────────────┐
│     PostgreSQL DB       │      │         Redis           │
│─────────────────────────│      │─────────────────────────│
│ • users                 │      │ • Slot Locks (TTL 5 min)│
│ • dealerships           │      │ • Availability Cache    │
│ • service_bays          │      │ • Session Store (JWT    │
│ • technicians           │      │   blacklist)            │
│ • vehicles              │      │                         │
│ • appointments          │      │                         │
└─────────────────────────┘      └─────────────────────────┘
```
Preview Link: https://mermaid.ai/view/064bb723-d18e-48c2-9780-b9d710236b59

## 2. Component Descriptions
### Front End
#### Client Layer — Web page
- The front-end single-page application built with React, Vite, and TypeScript. 
- It contains four main UI areas: Auth Pages (login/register), Dealership Dashboard (manage dealership info), Booking Flow (schedule appointments), and Admin Dashboard (administrative controls). Communicates with the backend over HTTPS using REST APIs.

### Back End
#### Middleware Layer
- A cross-cutting layer in the backend that intercepts every incoming request. 
- Handles JWT authentication guards, request logging, centralized error handling, and CORS policy enforcement before requests reach the business modules.

#### Auth Module
- Manages user identity — registration, login, and JWT token issuance/validation. Ensures only authenticated users can access protected resources.

#### Dealership Module
- Handles all dealership-related operations: CRUD (create, read, update, delete), search by criteria, sorting, and pagination of dealership listings.

#### Booking Module
- Orchestrates the appointment lifecycle: 
  - Checking availability of time slots
  - Locking a slot (via Redis) to prevent double-booking
  - Confirming a booking
  - Approving it (e.g., by dealership staff)

#### Notification Module
- Sends transactional emails (booking confirmations, reminders, status updates) using Nodemailer as the email transport.

#### Availability Engine (Core Service)
- The central scheduling brain. Manages Redis-based slot locking, detects time-slot collisions, matches appointments to available technicians and service bays, and calculates service durations to ensure conflict-free scheduling.

### Database
#### PostgreSQL Database
The primary relational data store. Persists all domain entities: users, dealerships, service_bays, technicians, vehicles, and appointments.

#### Redis
An in-memory data store used for three purposes: slot locks with a 5-minute TTL to prevent race conditions during booking, availability caching for fast read access, and a session store for JWT blacklisting (e.g., on logout).

## 3. Data Flow
Dealership create deals

User search and select a deal for checking their availability

User confirm booking

## 4. Techstacks:
| Technology | Justification |
|---|---|
| **React 18 + Vite** | Vite provides lightning-fast HMR and build times. React is the specified requirement. |
| **TypeScript** | Catches bugs at compile time, improves developer experience with autocompletion, mandatory per requirements. |
| **Shadcn UI + TailwindCSS** | Pre-built, accessible components with full customization. No vendor lock-in (you own the code). Free and open-source. |
| **Redux Toolkit** | Specified in requirements. Handles complex booking state, auth tokens, and search filters cleanly. |
| **Axios** | Specified in requirements. Built-in interceptors for JWT token attachment and error handling. |
| **React Router DOM** | Specified in requirements. Handles protected routes (auth guard) and page navigation. |
| **Node.js + Express** | Specified in requirements. Lightweight, mature, huge ecosystem. Express is simple enough for a monolith. |
| **PostgreSQL** | Specified in requirements. Excellent for structured relational data (appointments ↔ technicians ↔ bays). Free and open-source. |
| **Redis** | Specified in requirements. Perfect for TTL-based distributed locks (`SET NX EX`). Sub-millisecond reads for availability checks. Free and open-source. |
| **Nodemailer + Gmail SMTP** | **Free solution.** Gmail allows 500 emails/day for free — more than enough for a demo. No API key or paid service needed, just a Gmail account with an App Password. |
| **JSON Web Tokens (jsonwebtoken)** | Stateless auth tokens. No session storage needed server-side. Free library. Pair with `bcrypt` for password hashing. |
| **Prisma ORM** | Type-safe database queries auto-generated from schema. Migrations built-in. Free and open-source. Excellent TypeScript integration. |
| **Docker + Docker Compose** | Free. One command (`docker-compose up`) spins up the entire stack (app, PostgreSQL, Redis, Nginx) for demo. |