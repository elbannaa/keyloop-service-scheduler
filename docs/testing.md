# Testing Documentation

This document outlines the testing strategy, the suite of tests implemented, and the latest execution results for the Unified Service Scheduler.

## Purpose

The primary goal of testing in this project is to ensure the reliability and correctness of core business logic within the backend. Testing focuses on:
- **Business Logic Integrity**: Validating complex flows like appointment scheduling, resource allocation, and cancellation.
- **Constraint Enforcement**: Ensuring that scheduling rules (e.g., technician availability, operating hours, no past-dated bookings) are strictly followed.
- **Security & RBAC**: Verifying that Role-Based Access Control (RBAC) is correctly implemented across all service methods, preventing unauthorized data access or modifications.
- **Resource Management**: Confirming that backend resources (Technicians, Vehicle Bays) are correctly tracked and released upon cancellation.

## Suite of Tests

The current test suite consists of isolated unit tests for the backend service layer, using Jest and mocked Prisma dependencies.

### 1. Appointments Service
Located at: `backend/src/modules/appointments/appointments.service.spec.ts`
- **Listing**: Tests for role-based visibility of appointments (Manager vs. User).
- **Creation**: Validates scheduling constraints, technician availability, and successful booking state.
- **Cancellation**: Tests for unauthorized cancellation attempts, error handling for missing appointments, and successful resource release in Redis/Database.

### 2. Dealerships Service
Located at: `backend/src/modules/dealerships/dealerships.service.spec.ts`
- **CRUD Operations**: Basic create, list, and update operations for dealerships.
- **Filtering**: Verifies in-memory filtering for dealership discovery (e.g., minimum technicians).
- **RBAC**: Deep testing of permissions for editing dealerships and managing associated technicians/vehicles.

## Test Results
### Unit Test Results
```text
 PASS  src/modules/appointments/appointments.service.spec.ts
  AppointmentsService         
    listAppointments          
      ✓ should list all appointments for a manager
      ✓ should filter by customer email for a basic user
    createAppointment         
      ✓ should throw error if start time is in the past
      ✓ should successfully create an appointment
      ✓ should throw error if no technician is available
    cancelAppointment         
      ✓ should throw error if appointment not found
      ✓ should throw error if user unauthorized
      ✓ should successfully cancel and release resources

 PASS  src/modules/dealerships/dealerships.service.spec.ts
  DealershipsService          
    createDealership          
      ✓ should create a dealership
    listDealerships           
      ✓ should list dealerships without filters
      ✓ should filter by minTechnicians in-memory
      ✓ should apply requesterRole USER filters
    updateDealership          
      ✓ should throw error if dealership not found
      ✓ should throw error if unauthorized
      ✓ should allow ADMIN edit
    Technicians and Vehicles  
      ✓ should create tech for owned dealer
      ✓ should throw if unauthorized tech add
      ✓ should delete vehicle when authorized

Test Suites: 2 passed, 2 total
Tests:       18 passed, 18 total
Time:        0.752 s
```

## Swagger Documentation (API Testing)

In addition to automated unit tests, Swagger UI is used for manual API exploration and verification.

- **UI Endpoint**: Available at `/api-docs/`.
- **Security**: Configured with Bearer Token (JWT) authentication.
- **Coverage**: Includes Auth, Users, Appointments, and Dealerships modules.
