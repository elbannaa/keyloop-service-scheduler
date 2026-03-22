# Project Setup & Execution Guide

This document provides step-by-step instructions on how to set up and run the Unified Service Scheduler project locally.

## 1. Running Infrastructure via Docker Desktop

The project uses Docker Compose to manage infrastructure dependencies (PostgreSQL and Redis). Follow these steps to start them:

### Prerequisites:
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.

### Steps:
1.  Open a terminal in the project root directory.
2.  Run the following command:
    ```bash
    docker-compose up -d
    ```
3.  This will start two containers:
    - **`scheduler-postgres`**: PostgreSQL database at `localhost:5432`.
    - **`scheduler-redis`**: Redis instance at `localhost:6379`.

---

## 2. Running Backend & Frontend (Manual Local Run)

After starting the infrastructure, follow these steps to run the application components:

### A. Backend Setup
1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Configure environment variables:
    - Copy the example `.env` file:
      ```bash
      cp .env.example .env
      ```
    - Open `.env` and provide the following recommended local values:
      ```env
      PORT=3001
      DATABASE_URL=postgresql://scheduler:scheduler123@localhost:5432/scheduler_db
      FRONTEND_URL=http://localhost:5173
      REDIS_URL=redis://localhost:6379
      JWT_SECRET=your_jwt_secret_here
      JWT_EXPIRES_IN=7d
      # Seed Admin Credentials
      SEED_SUPER_ADMIN_EMAIL=admin@servicescheduler.com
      SEED_SUPER_ADMIN_PASSWORD=admin123
      ```
4.  Run database migrations and seed data:
    ```bash
    npx prisma migrate dev --name init
    npx prisma db seed
    ```
5.  Start the development server:
    ```bash
    npm run dev
    ```
    The API will be available at `http://localhost:3001`.

### B. Frontend Setup
1.  Navigate to the frontend directory:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:5173`.

---

## Default Credentials (After Seeding)
Once the database is seeded with the values above, you can log in with: (based on .env file)
- **Email**: `admin@mail.com`
- **Password**: `password`
