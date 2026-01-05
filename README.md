# Shaltabla - Friend Ranking Website

A humorous friend ranking website built with Next.js, TypeScript, and Tailwind CSS.

## Features

- 🎯 Real-time friend rankings with points
- 🎲 Random shuffle every 5 seconds
- ✨ Smooth animations and transitions
- 🌙 Dark mode support
- 📱 Fully responsive design
- 🏆 Visual rank badges with special styling for top 3
- 💾 Persistent data storage with Supabase
- 📊 Stock market-style charts and ticker
- 🔄 Automatic point updates saved to database

## Getting Started

### Prerequisites
Make sure you have Node.js installed (v18 or higher). You can check by running:
```bash
node --version
npm --version
```

If Node.js is not installed, download it from [nodejs.org](https://nodejs.org/) or use Homebrew on macOS:
```bash
brew install node
```

### Supabase Setup

1. **Create a Supabase account** at [supabase.com](https://supabase.com)

2. **Create a new project** in Supabase

3. **Get your credentials**:
   - Go to Project Settings > API
   - Copy your `Project URL` and `anon/public` key

4. **Set up the database**:
   - Go to SQL Editor in Supabase
   - Run the SQL from `supabase-setup.sql` to create the `friends` table

5. **Configure environment variables**:
   ```bash
   cp .env.example .env.local
   ```
   Then edit `.env.local` and add your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

### Running the Project

1. **Install dependencies** (first time only):
   ```bash
  npm install
   ```

2. **Start the development server**:
   ```bash
  npm run dev
   ```

3. **Open your browser** and navigate to:
   ```
   http://localhost:3000
   ```

You should now see the Shaltabla friend ranking website! The list will automatically shuffle every 5 seconds, and all data is persisted in Supabase.

### Other Commands

- `npm run build` - Build the project for production
- `npm run start` - Start the production server (after building)
- `npm run lint` - Run ESLint to check for code issues

## Project Structure

```
shaltabla/
├── components/
│   ├── FriendCard.tsx      # Individual friend card component
│   ├── FriendRankList.tsx  # Container for the friend list
│   ├── MiniChart.tsx       # Line chart component
│   └── TickerTape.tsx      # Scrolling ticker component
├── lib/
│   ├── api.ts              # API helper functions
│   ├── mockData.ts         # Hardcoded friend data (legacy)
│   ├── supabase.ts         # Supabase client configuration
│   └── types.ts            # TypeScript interfaces
├── pages/
│   ├── api/
│   │   └── friends/
│   │       ├── index.ts    # GET/POST /api/friends
│   │       └── [id].ts     # PATCH /api/friends/:id
│   ├── _app.tsx            # App wrapper
│   └── index.tsx           # Main page
├── styles/
│   └── globals.css         # Global styles and Tailwind imports
└── supabase-setup.sql     # Database schema setup
```

## Deployment

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new).

## License

MIT

