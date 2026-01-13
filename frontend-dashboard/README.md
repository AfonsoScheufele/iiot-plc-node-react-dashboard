# Frontend Dashboard - IIoT

React dashboard for monitoring industrial machines.

## Tech Stack

- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **Charts**: Chart.js + react-chartjs-2
- **Routing**: React Router
- **HTTP Client**: Axios

## Features

- ✅ Login with JWT authentication
- ✅ Machines list with real-time status
- ✅ Real-time dashboard with live charts (temperature & pressure)
- ✅ Historical data charts with time range selection
- ✅ Auto-refresh every 2-5 seconds
- ✅ Responsive design

## Getting Started

### Installation

```bash
npm install
```

### Configuration

Create a `.env` file:

```env
VITE_API_URL=http://localhost:3000
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
 ├─ components/      # Reusable components
 │  ├─ Login.tsx
 │  ├─ MachinesList.tsx
 │  ├─ RealtimeDashboard.tsx
 │  ├─ HistoricalChart.tsx
 │  └─ Layout.tsx
 ├─ pages/          # Page components
 │  └─ Dashboard.tsx
 ├─ services/        # API services
 │  └─ api.ts
 ├─ contexts/       # React contexts
 │  └─ AuthContext.tsx
 ├─ types/          # TypeScript types
 │  └─ index.ts
 └─ App.tsx         # Main app component
```

## Usage

1. **Login**: Use credentials `admin` / `admin123`
2. **Machines List**: View all machines with their current status
3. **Real-time Dashboard**: See live temperature and pressure charts
4. **Historical Chart**: View historical data with time range selection (1h, 6h, 24h)

## API Integration

The frontend connects to the backend API at `http://localhost:3000` (configurable via `.env`).

Endpoints used:
- `POST /auth/login` - Authentication
- `GET /machines` - List machines
- `GET /metrics` - Get metrics with filters
