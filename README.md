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
- **Database**: PostgreSQL
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS, shadcn/ui components
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL
- pnpm

### Installation

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

4. Run database migrations:
   ```bash
   pnpm prisma migrate dev
   ```

5. Start the development server:
   ```bash
   pnpm dev
   ```

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
- [Prisma](https://www.prisma.io/) 