# Expense Reimbursement Management System

## Overview
This is a NestJS based Modular Monolith application for managing employee expense submissions, policy validation, approval workflows, and budget tracking.

## Architecture
- **Framework:** NestJS
- **Language:** TypeScript
- **Database:** PostgreSQL
- **ORM:** TypeORM
- **Architecture Style:** Modular Monolith / Clean Architecture / Partial DDD

## Setup

1. Setup PostgreSQL database based on credentials in `.env`
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run migrations / seeds (see `src/database/seeds`)
4. Start development server:
   ```bash
   npm run start:dev
   ```

## Modules Implementation Status
- [x] **Auth:** JWT-based authentication
- [x] **Department:** Department and budget allocation management
- [x] **Category:** Expense categories with policy limits
- [x] **Currency:** Static exchange rates
- [x] **Settings:** System-wide settings (e.g. Base Currency)
- [x] **Expense:** Core expense tracking and receipt uploads
- [x] **Claim:** Reimbursement claim state machine and bundling
- [x] **Approval:** Manager approval workflow and budget consumption
- [x] **Audit:** Entity action tracking and claim status history
- [x] **Budget:** Internal budget service
## Documentation
See `/documentation/architecture-plan.md` and `/documentation/implementation-plan.md` for full design and rollout strategy.
