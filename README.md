# How Do They Make Money?

A modern web application that helps users understand how companies generate revenue and their business models, inspired by platforms like Product Hunt but focused solely on company financials and strategies.

## Features

- **User Management:** Signup, Login (Email/Password), Admin Roles
- **Company Browsing:** Public list (`/companies`), search/filter
- **Company Details:** Dynamic pages (`/company/[slug]`) showing:
    - Description, Logo, Website, Headquarters
    - Business Model Summary
    - Revenue Breakdown (Chart & List)
    - *Placeholder for Comments, Bookmarks, Sharing*
- **Company Requests:** Users can request new companies; Admins can view/approve/reject requests.
- **Admin Access:** Dedicated section for Admins (link in header) to manage requests.
- **Secure:** Uses JWT cookies (httpOnly) for session management, middleware protection.

*See `REQUIREMENTS.md` for a detailed feature checklist and TODOs.*

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Database:** SQLite (via `better-sqlite3`)
- **ORM:** Drizzle ORM
- **Authentication:** Custom JWT (using `jose` library)
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **Charting:** Chart.js / react-chartjs-2

## Getting Started

### Prerequisites

- Node.js (v18 or later recommended)
- npm (comes with Node.js)

### Local Development

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/jpatel3/howdotheymakemoney.git
    cd howdotheymakemoney
    ```

2.  **Navigate to Frontend:**
    ```bash
    cd frontend
    ```

3.  **Install dependencies:**
    ```bash
    npm install
    ```

4.  **Set up environment variables (Optional but Recommended):**
    Create a `.env.local` file in the `frontend` directory. You can set a custom JWT secret:
    ```
    JWT_SECRET=your-strong-secret-key-here
    ```
    If omitted, a default key will be used (less secure).

5.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The application will start, typically on `http://localhost:3000`.

6.  **Database Initialization:**
    The first time you run `npm run dev`, the SQLite database (`local.db`) will be automatically created in the `frontend` directory. It will also be seeded with sample companies (Tesla, Google, etc.) and a default **admin user**.

    *   **Admin Email:** `admin@app.com`
    *   **Admin Password:** `password`

### Resetting the Database

If you need to reset the database to its initial seeded state:
1.  Stop the development server.
2.  Delete the `local.db` file in the `frontend` directory.
3.  Restart the development server (`npm run dev`).

## Project Structure (Simplified)

```
howdotheymakemoney/
├── frontend/
│   ├── public/            # Static assets
│   ├── src/
│   │   ├── app/           # Next.js App Router (Pages & API Routes)
│   │   ├── components/    # Reusable React components (UI & domain)
│   │   ├── lib/           # Core logic (DB, Auth, Schema)
│   │   └── styles/        # (If any global styles beyond globals.css)
│   ├── drizzle/           # Drizzle ORM migrations/config (if used)
│   ├── local.db           # Local SQLite database file (created on run)
│   ├── next.config.mjs    # Next.js configuration
│   ├── package.json       # Project dependencies & scripts
│   ├── tailwind.config.ts # Tailwind configuration
│   └── tsconfig.json      # TypeScript configuration
├── .gitignore
├── README.md
└── REQUIREMENTS.md
```

## Contributing

Contributions are welcome! Please follow standard fork/branch/PR workflow.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Cloudflare](https://www.cloudflare.com/)
- [Cloudflare Pages](https://pages.cloudflare.com/)
- [Cloudflare D1](https://developers.cloudflare.com/d1/) 