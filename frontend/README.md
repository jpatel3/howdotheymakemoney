# HowDoTheyMakeMoney.com

A website that provides clear, digestible information about how companies make money, with simple revenue breakdowns and business model explanations.

## Features

- Search for companies to see how they make money
- Detailed revenue breakdowns with visualizations
- Simple explanations of business models
- User accounts with bookmarking functionality
- Community features (comments, voting, company requests)
- Social sharing capabilities
- AI-powered report generation for new companies

## Tech Stack

- **Frontend**: Next.js with TypeScript
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui component library
- **Charts**: Recharts for data visualization
- **Deployment**: Cloudflare Pages
- **Database**: Cloudflare D1 (SQLite)
- **Authentication**: Custom JWT-based auth system

## Development

### Prerequisites

- Node.js 18+
- pnpm

### Setup

1. Clone the repository
```bash
git clone https://github.com/jpatel3/howdotheymakemoney.git
cd howdotheymakemoney
```

2. Install dependencies
```bash
pnpm install
```

3. Set up environment variables
```bash
cp .env.example .env.local
```

4. Run the development server
```bash
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Database

The application uses Cloudflare D1 for data storage. To set up the database locally:

```bash
pnpm wrangler d1 execute DB --local --file=migrations/0001_initial.sql
```

## Deployment

The site is deployed on Cloudflare Pages. Deployments are automatically triggered when changes are pushed to the main branch.

## License

MIT
