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
│  │ • Login    │ │ • Search   │ │  Availability│ │  MailService │    │
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
│ • technicians           │      │ • Session Store (JWT    │
│ • vehicles (bays)       │      │   blacklist)            │
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
- Handles all dealership-related operations: CRUD (create, read, update, delete), search by name/address, and filtering by vehicle compatibility (make/model/year) or minimum technician count.

#### Booking Module
- Orchestrates the appointment lifecycle: 
  - Checking availability of time slots based on resource state (Technicians & Vehicles).
  - Locking resources via Redis bitsets to prevent double-booking.
  - Creating a booking request (Status: `PENDING`).
  - Manager review and approval (Status: `SCHEDULED`).

#### Notification Module
- Sends transactional emails (booking confirmations, reminders, status updates) using `MailService` (Nodemailer) as the email transport.

#### Availability Engine (Core Service)
- The central scheduling brain. Manages Redis-based slot locking, detects time-slot collisions, matches appointments to available technicians and vehicle bays, and calculates service durations to ensure conflict-free scheduling.

### Database
#### PostgreSQL Database
The primary relational data store. Persists all domain entities: users, dealerships, technicians, vehicles (acting as service bays), and appointments.

#### Redis
An in-memory data store used for three purposes: slot locks with a 5-minute TTL to prevent race conditions during booking, availability caching for fast read access, and a session store for JWT blacklisting (e.g., on logout).

## 3. Data Flow
1. **Resource Management**: Admin/Manager adds technicians and vehicle bays (represented by `Vehicle` model) to a dealership.
2. **Availability Lookup**: Customer selects a service type and date; the `Availability Engine` queries Redis bitsets to find conflict-free slots.
3. **Booking Request**: Customer submits details (Name, Email, Vehicle info); the system creates a `PENDING` appointment and locks the resources in Redis.
4. **Manager Approval**: Manager reviews pending requests in the `Schedule` view, assigns/confirms a technician, and updates status to `SCHEDULED`.

## 4. Techstacks:
| Technology | Justification |
|---|---|
| **React 18 + Vite** | Vite provides lightning-fast HMR and build times. React is the specified requirement. |
| **TypeScript** | Catches bugs at compile time, improves developer experience with autocompletion, mandatory per requirements. |
| **Ant Design (antd) + TailwindCSS** | Enterprise-grade UI library (antd) for complex components + Tailwind CSS v4 for layout and custom styling. |
| **Redux Toolkit** | Specified in requirements. Handles complex booking state, auth tokens, and search filters cleanly. |
| **Axios** | Specified in requirements. Built-in interceptors for JWT token attachment and error handling. |
| **React Router DOM** | Specified in requirements. Handles protected routes (auth guard) and page navigation. |
| **Node.js + Express** | Backend runtime and web framework for the REST API. |
| **PostgreSQL** | Primary relational database for persistent storage of users, appointments, and dealership data. |
| **Redis** | High-performance in-memory store for slot locks, availability caching, and JWT blacklisting. |
| **MailService (Nodemailer)** | Handles transactional emails (confirmations, reminders) via SMTP. |
| **JSON Web Tokens** | Stateless authentication mechanism for secure API access. |
| **Prisma ORM** | Type-safe database client and schema management. |
| **DayJS** | Lightweight library for date and time parsing, validation, and manipulation. |
| **Pino** | High-performance JSON logger for structured request and error tracking. |
| **Docker + Docker Compose** | Containerization for consistent development and deployment environments. |