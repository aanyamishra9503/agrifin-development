# AgriFin — Farmer Financial Management System

AgriFin is a mobile-friendly web application designed to simplify agricultural financial management. It helps farmers organise crop-related financial records, monitor operational expenses, track sales, manage payments, and understand their income across harvest cycles.

The project aims to make farm financial tracking more accessible through a straightforward interface and a centralised view of important financial information.

## Overview

Managing agricultural finances involves tracking input costs, crop sales, payments received, and outstanding balances. When these records are scattered or maintained manually, understanding the profitability of a harvest cycle can become difficult.

AgriFin addresses this problem by bringing essential farm financial records together in one application. It is being developed with a focus on usability, mobile accessibility, and the financial record-keeping needs of farmers.

**Project status:** Working first prototype; active development and testing.

## Features

### 1. Financial Dashboard
- View key financial indicators in one place.
- Review income, operational costs, and financial summaries.
- View crop profitability and monthly financial charts.
- Select a harvest cycle to review relevant information.
- Access quick actions for adding records, recording sales, and receiving payments.

### 2. Crop Management
- Access the Crops section to organise crop information associated with harvest cycles.
- View crop-related information used by the application's financial tracking workflow.

### 3. Expense Tracking
- Record agricultural expenses with an amount, crop association, and description.
- Organise operational costs for financial tracking.
- Review saved expense records.

### 4. Sales Tracking
- Record crop sales and their associated financial details.
- Maintain sales records for financial reporting.
- Connect sales information with the application's income calculations.

### 5. Payment Tracking
- Record payments received against sales.
- Track outstanding balances where applicable.
- Distinguish between recorded sales and payments received.

### 6. Reports
- Review financial information and summaries derived from recorded transactions.
- Use the available reporting views to understand income and expenditure.

### 7. Harvest-Cycle-Based Tracking
- Organise financial records around predefined agricultural harvest cycles.
- Support cycle-based financial summaries.
- Use harvest-cycle information to relate crops, expenses, and sales.

### 8. Mobile-Friendly Interface
- Access the application through a web browser on a phone or computer.
- Use responsive layouts for the main application sections.
- Navigate between financial management features through the application interface.

### 9. Authentication
- Provide an application-level sign-up and sign-in interface.
- Use Supabase Authentication for account access.
- Associate farm and profile information with authenticated users.

## Financial Calculations

AgriFin's financial tracking logic includes the following concepts:

**Net income**

Net income is calculated as sales revenue minus operational expenses for the relevant harvest cycle.

`Net Income = Total Sales − Total Operational Expenses`

**Pending payment balance**

The pending balance represents the amount from recorded sales that has not yet been received as payment.

`Pending Balance = Sale Amount − Payments Received`

The implementation prevents the pending balance from falling below zero and avoids counting duplicate payment identifiers more than once in the relevant calculation.

These figures depend on the accuracy and completeness of the records entered into the application. They represent financial tracking calculations, not audited accounts or guaranteed profit.

## Technology Stack

### Frontend
- **Next.js** — application framework and routing
- **React** — user interface
- **TypeScript** — typed application development
- **Tailwind CSS** — styling and responsive layouts
- **Lucide React** — interface icons
- **shadcn/ui** — UI component tooling

### Backend and Data
- **Supabase Authentication** — account authentication
- **Supabase PostgreSQL** — hosted relational database
- **Supabase SSR** — browser and server-side Supabase integration

### Development and Deployment
- **Git and GitHub** — source control and project collaboration
- **Vercel** — web application hosting and deployments
- **Node.js and pnpm** — JavaScript runtime and package management

## Database Structure

The application uses a relational data model with tables for:

| Table | Purpose |
|---|---|
| `profiles` | User profile information and language preference |
| `farms` | Farm information associated with an owner |
| `harvest_cycles` | Harvest-cycle names, dates, and status |
| `crops` | Crop catalogue |
| `cycle_crops` | Relationships between crops and harvest cycles |
| `expenses` | Recorded operational expenses |
| `sales` | Recorded crop sales |
| `payments` | Payments received against sales |

The exact relationships and access policies are defined by the database schema and Supabase configuration.

## Application Pages

| Page | Purpose |
|---|---|
| Home | Financial dashboard and quick actions |
| Crops | Crop information |
| Expenses | Record and review operational costs |
| Sales | Record and review sales |
| Payments | Record and track received payments |
| Reports | Review financial summaries |
| Settings | Application settings and preferences |
| Login | Account registration and sign-in |

## Getting Started

### Prerequisites

Install the following before running the project locally:

- Node.js
- pnpm through Corepack, or a compatible package-manager setup
- Git
- A Supabase project with the required database schema and authentication configuration

### 1. Clone the repository

```bash
git clone https://github.com/aanyamishra9503/agrifin-development.git
cd agrifin-development
```

### 2. Install dependencies

```bash
corepack pnpm install
```

### 3. Configure environment variables

Create a `.env.local` file in the project root and configure the required Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

Replace the example values with the appropriate credentials from your own Supabase project.

Do not commit `.env.local`, service-role keys, database passwords, or other secrets to GitHub.

### 4. Start the development server

```bash
corepack pnpm dev
```

Open the local address displayed by Next.js, normally:

`http://localhost:3000`

The application also requires the appropriate Supabase database tables, policies, and authentication settings to be configured.

## Deployment

AgriFin is deployed through Vercel and uses Supabase for hosted authentication and database services.

The application can be accessed through its deployed URL when the relevant deployment is available and publicly accessible. Production deployment and authentication reliability should be verified before treating the application as a release-ready service.

## Current Development Status

The current prototype includes the main dashboard, crop management, expense tracking, sales tracking, payment tracking, reporting views, and a Supabase-backed data workflow.

The following areas remain under development or require further validation:

- **Authentication reliability:** Investigating an intermittent issue where the first sign-in attempt may return the user to the login page, while refreshing and retrying can allow access.
- **Language switching:** Reviewing a duplicate English/Tamil language toggle in the interface. Full translation coverage requires separate verification.
- **Offline functionality:** Reliable offline record creation, local storage, and later synchronisation have not yet been established.
- **Field testing:** Further testing with intended users is needed to evaluate usability and suitability for agricultural communities.
- **Data security:** Database access policies and isolation between different users' farm records must be verified before wider release.

## Future Scope

Planned areas for future development include:

- More complete Tamil and regional-language support.
- Improved accessibility for users with limited digital literacy.
- Offline-first data entry and synchronisation when connectivity returns.
- More detailed crop-wise and harvest-cycle-wise financial analysis.
- Additional testing with farmers and other intended users.
- Improved authentication, error handling, and data-security validation.

These items describe potential improvements and should not be interpreted as already implemented features.

## Project Objective

AgriFin aims to make agricultural financial record-keeping simpler and more accessible by giving farmers a central place to track operational costs, sales, payments, and harvest-cycle financial performance.

The project is being developed as a practical application prototype, with an emphasis on usability, transparent financial calculations, and a technology stack that supports future expansion.

## Author

**Aanya Mishra**

GitHub: [aanyamishra9503](https://github.com/aanyamishra9503)

## License

No open-source license has been specified yet. All rights and permissions remain with the respective copyright holder unless a license is added to the repository.
