# Woreda Digital Service Portal

A modern, bilingual (Amharic/English) digital service portal for woreda administration.

## Features

- 🎨 **Glassmorphism Design** - Modern, app-like interface with translucent glass effects
- 🌍 **Bilingual Support** - One-click toggle between Amharic (default) and English
- 📋 **Service Directory** - Comprehensive list of all available services with requirements and fees
- 📝 **Complaint System** - File grievances with automatic 5-day escalation logic
- 📅 **Appointment Booking** - Digital appointment scheduling system
- 👥 **Leadership Directory** - Directory of all officials and leaders
- 📊 **Live Analytics** - Real-time statistics dashboard

## Technology Stack

- **Frontend**: React 19 + Vite
- **Styling**: Tailwind CSS 4
- **Icons**: Lucide React
- **Backend**: Supabase (PostgreSQL + Real-time)

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Copy your project URL and anon key
3. Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Set Up Database

1. Open your Supabase project dashboard
2. Go to SQL Editor
3. Run the SQL script from `supabase-schema.sql`

### 4. Set Up Cron Job for Escalation

The 5-day escalation logic requires a scheduled job. In Supabase:

1. Go to Database → Extensions
2. Enable `pg_cron` extension
3. Schedule the escalation function:

```sql
SELECT cron.schedule(
  'escalate-complaints-daily',
  '0 0 * * *', -- Run daily at midnight
  $$SELECT escalate_complaints()$$
);
```

### 5. Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Project Structure

```
src/
├── components/       # Reusable UI components
├── views/           # Page views
├── hooks/           # Custom React hooks
├── lib/             # Utilities and configurations
├── data/           # Static data (services, officials)
└── App.jsx         # Main application component
```

## Key Features Explained

### 5-Day Escalation Logic

Complaints automatically escalate through the hierarchy:
1. Department Head (Day 1)
2. CEO Office Head (Day 6)
3. Chief Executive (Day 11)
4. Council (Day 16)

### Mandatory Resolution Notes

Officials cannot close a complaint without providing at least 20 characters of resolution notes explaining the action taken.

### Bilingual Translation

All text is stored in a translation dictionary (`src/lib/translations.js`) and switches instantly without page reload.

## Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## License

This project is developed for woreda administration (configurable via `src/config/site.js`).

## Credentials

Portal logins, Supabase keys, and sample codes: see **[CREDENTIALS.md](./CREDENTIALS.md)**.
