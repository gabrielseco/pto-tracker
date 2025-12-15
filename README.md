# PTO Tracker

A Next.js application to track employee PTO (Paid Time Off), manage public holidays, and monitor when employees work on public holidays.

## Features

- **Employee Management**: Add and edit employees with their PTO allocations
- **PTO Request Tracking**: Record and manage PTO requests for each employee
- **Public Holiday Management**: Define public holidays for the year
- **Dashboard Overview**: See at-a-glance employee PTO status
- **Holiday Conflict Detection**: Automatically identify when employees are working on public holidays
- **Data Persistence**: Uses Upstash Redis for reliable data storage

## Tech Stack

- Next.js 15 with App Router
- TypeScript
- React Query (@tanstack/react-query) for data fetching
- Tailwind CSS for styling
- Upstash Redis for data storage
- date-fns for date calculations

## Getting Started

### Prerequisites

1. Node.js 18+ installed
2. An Upstash Redis account (free tier available at https://upstash.com)

### Setup Instructions

1. **Clone and Install**

```bash
cd pto-tracker
npm install
```

2. **Set Up Upstash Redis**

- Go to https://console.upstash.com/
- Create a new Redis database (free tier is fine)
- Copy your REST URL and REST TOKEN

3. **Configure Environment Variables**

Create a `.env.local` file in the project root:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Upstash credentials:

```
UPSTASH_REDIS_REST_URL=your_redis_url_here
UPSTASH_REDIS_REST_TOKEN=your_redis_token_here
```

4. **Run Development Server**

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## Deploying to Vercel

### Option 1: Deploy via Vercel Dashboard

1. Push your code to GitHub
2. Go to https://vercel.com and sign in
3. Click "New Project"
4. Import your GitHub repository
5. Add your environment variables:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
6. Click "Deploy"

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow the prompts and add your environment variables when asked
```

## Usage

### 1. Add Employees

- Go to the "Employees" tab
- Fill in the employee details:
  - Name (e.g., Habiba, Carmen, Ine)
  - Total PTO Days for the year
  - Taken Days (days already used)
  - Year
- Click "Add" to save

### 2. Add Public Holidays

- Go to the "Holidays" tab
- Add all 14 public holidays for the year
- Enter the holiday name, date, and year

### 3. Track PTO Requests

- Go to the "PTO" tab
- Select an employee
- Enter start and end dates for the PTO
- The system automatically calculates business days

### 4. View Dashboard

- The "Dashboard" tab shows:
  - Total PTO days allocated
  - Days taken
  - Remaining days
  - Number of PTO requests
  - **Working on Holidays**: Highlights when employees are working on public holidays

## Pre-populating Your Data

Based on your requirements, you should add:

**Employees:**
- Habiba: 23 days taken
- Carmen: 23 days taken
- Ine: 17 days taken

**Public Holidays:**
- Add all 14 public holidays for your region/year

## API Routes

The app includes the following API endpoints:

- `GET/POST/PUT /api/employees` - Manage employees
- `GET/POST/DELETE /api/pto-requests` - Manage PTO requests
- `GET/POST/DELETE /api/holidays` - Manage public holidays
- `GET /api/stats` - Get dashboard statistics

## License

MIT
