
# PokéDex Manager Pro

A complete full-stack solution for managing your personal Pokémon collection.

## Stack
- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide Icons, Recharts (for stats).
- **Backend**: Node.js, Express, TypeScript, Prisma (SQLite).
- **Auth**: JWT, Bcrypt.
- **AI**: Google Gemini (via `@google/genai`).

## Setup Instructions

### 1. Prerequisites
- Node.js (v18+)
- npm or yarn

### 2. Backend Setup
```bash
# Navigate to the server folder (simulated in this structure)
cd server
npm install
# Configure your .env (see .env.example)
npx prisma migrate dev --name init
npm run dev
```

### 3. Frontend Setup
```bash
npm install
npm run dev
```

## Environment Variables (.env)
Create a `.env` file in the root:
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your_ultra_secure_secret_key"
API_KEY="your_gemini_api_key"
PORT=3001
```

## Project Structure
- `/components`: Reusable UI components.
- `/pages`: Main view components (Login, Explore, Collection, Detail).
- `/server`: Express backend (controllers, routes, services).
- `/services`: Frontend API communication layer.
- `/types`: Shared TypeScript interfaces.

## User Flow
1. **Register/Login**: Secure access with JWT.
2. **Explore**: Search and filter the global PokéDex via proxy.
3. **Collect**: Save Pokémon to your personal list with custom notes.
4. **AI Insight**: Get deep strategic analysis from Gemini for any Pokémon.
