# Project Requirements & TODO

This document tracks the features, improvements, and tasks for the 'How Do They Make Money' project.

## Core Functionality

- [x] Basic user signup (Email/Password)
- [x] Basic user login (Email/Password) & session management (JWT cookie)
- [x] Publicly accessible company list page (`/companies`)
- [x] Dynamic company detail page using slugs (`/company/[slug]`)
- [x] Basic search functionality (`/api/search`)
- [x] Allow logged-in users to request a company (`/request` page UI)
- [x] Company Request Submission API (`POST /api/company-requests`)
- [x] Simple Admin view for pending company requests (`/admin/requests`)
- [x] Admin action API to approve/reject requests (`PATCH /api/admin/company-requests/[id]`)
- [x] Middleware for route protection (public, authenticated, admin)

## Data Handling & Management

- [x] Add `requestedByUserId` column to `companies` schema.
- [ ] **Admin Company Request Actions:** 
    - [ ] Update PATCH API (`/api/admin/company-requests/[requestId]`) to retrieve `userId` before update.
- [ ] **Admin Company Management Interface:** Build UI for admins to:
    - [ ] View/Approve/Reject company requests (UI part done, needs API integration for actions).
    - [ ] Manually add new company data (including private companies), populating `requestedByUserId` on creation from approved requests.
    - [ ] Edit existing company data.
- [ ] **Data Enrichment (Manual Phase):** Establish process for admins to research and populate data for approved requests/new companies.
- [ ] **Web Agent/Automation (Future):** Explore building an agent to automatically fetch and structure company data upon approval (complex).

## Frontend Enhancements

- [x] Add search/filter box to `/companies` page.
- [ ] **Search Autocomplete:** Implement suggestions dropdown on the homepage search bar using `/api/search`.
- [ ] **Company Page Robustness:** 
    - [ ] Make sections (Revenue Breakdown chart, Financials, etc.) render conditionally based on data availability (especially for private companies).
    - [ ] Handle different `revenueBreakdown` formats gracefully (object vs. string, percentages vs. categories).
- [ ] **User Credit Display:**
    - [ ] Update company page (`/company/[slug]`) to fetch and display "Requested by [User Name]" link if `requestedByUserId` is present.
    - [ ] Create user profile page (`/profile/[userId]`).
- [ ] **User Bookmarks Page:** Create a `/bookmarks` page for logged-in users to see their saved companies.
- [ ] **UI Polishing:** General improvements to layout, styling, and user experience based on feedback.
- [ ] **Recently Viewed Companies:** Implement display of recently viewed companies (potentially on dashboard or home page, using localStorage data).
- [ ] **Add Missing Data Fields:** Populate database schema and seeding with fields currently missing but used in components (e.g., `founded`, `publiclyTraded`, `employees`, `financials`, `sources`, `lastUpdated`).

## Authentication

- [ ] Implement Social Logins (Google, Apple, X)
- [ ] Implement "Forgot Password" functionality.

## Deployment

- [ ] Prepare for deployment (Cloudflare Pages/Workers likely target based on D1 usage).
- [ ] Set up environment variables for production (JWT Secret, DB bindings). 