# Pixelfront

A real-time collaborative pixel art game where players compete to claim tiles on a shared grid. Built with modern web technologies for instant, multiplayer fun.

<img width="1679" height="925" alt="image" src="https://github.com/user-attachments/assets/188b6064-ca5f-48de-9cc3-3deb6853c470" />


## 🎮 Features

- **Real-time Grid**: 50x33 pixel grid that updates instantly for all players
- **Identity System**: Customize your name and color to stand out
- **Capture Mechanics**: Click tiles to claim them in your color
- **Cooldown System**: 0.5-second cooldown between captures to prevent spam
- **Leaderboard**: See who's dominating the grid
- **Presence Tracking**: View how many players are online
- **Responsive Design**: Works on desktop and mobile devices
- **Optimistic Updates**: Instant visual feedback with server rollback on errors

## 🚀 Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend**: Supabase (PostgreSQL, Realtime, Auth)
- **State Management**: React hooks (useState, useEffect, useMemo)
- **Icons**: Lucide React
- **Notifications**: Sonner for toasts
- **Testing**: Vitest, React Testing Library
- **Linting**: ESLint with TypeScript support

## 📋 Prerequisites

Before running this project, make sure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **bun** (for package management)
- **Supabase CLI** (for local development) 

## 🛠️ Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/pixelfront.git
   cd pixelfront
   ```

2. **Install dependencies**:
   ```bash
   npm install
   # or
   bun install
   ```

3. **Set up Supabase**:
   - Install Supabase CLI if you haven't:
     ```bash
     npm install -g supabase
     ```
   - Start the local Supabase instance:
     ```bash
     supabase start
     ```
   - This will set up a local PostgreSQL database and Supabase services.

4. **Configure environment**:
   - The app uses Supabase client configuration in `src/integrations/supabase/client.ts`
   - For local development, it connects to the local Supabase instance automatically.

## 🎯 How to Play

1. **Join the Game**: Open the app in your browser
2. **Customize Identity**: Set your name and choose a color in the sidebar
3. **Capture Tiles**: Click any tile on the grid to claim it in your color
4. **Strategic Play**: Recapture opponents' tiles to expand your territory
- **Cooldown Awareness**: Wait 0.5 seconds between captures (watch the cooldown bar)
6. **Compete**: Check the leaderboard to see your ranking

### Game Rules
- Anyone can capture any tile at any time
- Tiles can be recaptured by other players
- All changes sync instantly across all connected players
- Your identity persists across sessions (stored locally)

## 🏗️ Project Structure

```
pixelfront/
├── public/                 # Static assets
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── ui/            # shadcn/ui components
│   │   ├── IdentityBar.tsx # Player identity management
│   │   ├── Leaderboard.tsx # Player rankings
│   │   ├── PixelGrid.tsx   # Main game grid
│   │   └── NavLink.tsx     # Navigation component
│   ├── hooks/             # Custom React hooks
│   ├── integrations/      # External service integrations
│   │   └── supabase/      # Supabase client and types
│   ├── lib/               # Utility functions
│   │   ├── identity.ts    # Identity management
│   │   └── utils.ts       # General utilities
│   ├── pages/             # Page components
│   │   ├── Index.tsx      # Main game page
│   │   └── NotFound.tsx   # 404 page
│   ├── test/              # Test files
│   ├── App.css            # Global styles
│   ├── App.tsx            # Main app component
│   └── main.tsx           # App entry point
├── supabase/              # Supabase configuration and migrations
│   ├── config.toml        # Supabase project config
│   └── migrations/        # Database schema migrations
├── package.json           # Dependencies and scripts
├── vite.config.ts         # Vite configuration
├── tailwind.config.ts     # Tailwind CSS configuration
└── README.md              # This file
```

## 🚀 Running the Application

1. **Start Supabase** (if not already running):
   ```bash
   supabase start
   ```

2. **Start the development server**:
   ```bash
   npm run dev
   # or
   bun run dev
   ```

3. **Open your browser** and navigate to `http://localhost:5173`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:dev` - Build for development
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run test` - Run tests once
- `npm run test:watch` - Run tests in watch mode

## 🗄️ Database Schema

The app uses a single `tiles` table in Supabase:

```sql
CREATE TABLE public.tiles (
  id BIGSERIAL PRIMARY KEY,
  x INTEGER NOT NULL,
  y INTEGER NOT NULL,
  owner_id TEXT NOT NULL,
  owner_name TEXT NOT NULL,
  color TEXT NOT NULL,
  captured_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (x, y)
);
```

- **x, y**: Grid coordinates (0-39, 0-23)
- **owner_id**: Unique player identifier
- **owner_name**: Player's display name
- **color**: Hex color code for the tile
- **captured_at**: Timestamp of last capture

## 🔧 Configuration

### Supabase
- Local development uses `http://localhost:54321`
- Configure your own Supabase project by updating `src/integrations/supabase/client.ts`

### Game Constants
Modify game settings in `src/pages/Index.tsx`:
- `COLS` and `ROWS`: Grid dimensions
- `COOLDOWN_MS`: Cooldown duration in milliseconds

### Styling
- Tailwind CSS classes are used throughout
- Custom CSS variables in `src/index.css`
- shadcn/ui theme configuration in `components.json`


**Have fun creating pixel art with friends! 🎨**
