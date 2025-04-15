# How Do They Make Money

A modern web application that helps users understand how companies generate revenue and their business models.

## Features

- 🔍 Company Search and Discovery
- 📊 Detailed Revenue Breakdowns
- 💬 Interactive Comment System
- 📱 Modern, Responsive UI
- 🔐 Secure Authentication
- 📈 Trending Companies
- 📌 Bookmarking System
- 🔄 Real-time Updates

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Database**: PostgreSQL (Cloudflare D1)
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS, shadcn/ui components
- **Deployment**: Cloudflare Pages
- **Storage**: Cloudflare R2 (for static assets)
- **Edge Functions**: Cloudflare Workers

## Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm
- Cloudflare account
- Domain name (optional)

### Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/jpatel3/howdotheymakemoney.git
   cd howdotheymakemoney
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory with the following variables:
   ```
   DATABASE_URL=your_database_url
   NEXTAUTH_SECRET=your_secret
   NEXTAUTH_URL=http://localhost:3000
   ```

4. Start the development server:
   ```bash
   pnpm dev
   ```

### Cloudflare Deployment

1. Install Wrangler CLI:
   ```bash
   pnpm add -g wrangler
   ```

2. Login to Cloudflare:
   ```bash
   wrangler login
   ```

3. Create a new D1 database:
   ```bash
   wrangler d1 create howdotheymakemoney-db
   ```

4. Deploy to Cloudflare Pages:
   ```bash
   wrangler pages deploy frontend
   ```

5. Set up environment variables in Cloudflare Dashboard:
   - Go to your project settings
   - Add the following environment variables:
     - `DATABASE_URL`
     - `NEXTAUTH_SECRET`
     - `NEXTAUTH_URL` (your production URL)

6. Configure custom domain (optional):
   - In Cloudflare Pages dashboard
   - Go to your project settings
   - Under "Custom domains", add your domain
   - Follow the DNS configuration instructions

## Project Structure

```
howdotheymakemoney/
├── frontend/              # Next.js frontend application
│   ├── src/
│   │   ├── app/          # Next.js app router pages
│   │   ├── components/   # React components
│   │   └── lib/          # Utility functions and configurations
├── docs/                  # Project documentation
└── migrations/            # Database migrations
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Cloudflare](https://www.cloudflare.com/)
- [Cloudflare Pages](https://pages.cloudflare.com/)
- [Cloudflare D1](https://developers.cloudflare.com/d1/) 