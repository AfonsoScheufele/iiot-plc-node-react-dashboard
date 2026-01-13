# iiot-plc-node-react-dashboard

IIoT project: PLC simulation → Node.js API → React dashboard

## Overview

Complete IIoT project simulating PLC data sent via MQTT to a Node.js backend and visualized in a React dashboard.

## Architecture

```
[PLC Simulator]
      ↓ MQTT
[Node.js API]
      ↓ REST
[React Dashboard]
```

## Tech Stack

- **PLC Simulator**: Node.js + MQTT
- **Backend API**: NestJS + TypeScript + PostgreSQL + TypeORM + JWT + Swagger
- **Frontend Dashboard**: React + TypeScript + Vite + TailwindCSS + Chart.js ✅

## Quick Start

### Prerequisites

- Node.js (v18+)
- Docker and Docker Compose
- npm or yarn

### Installation

1. **Clone the repository:**
```bash
git clone <repository-url>
cd iiot-plc-node-react-dashboard
```

2. **Start infrastructure (Docker):**
```bash
docker-compose up -d postgres mosquitto
```

3. **Install backend dependencies:**
```bash
cd backend-api
npm install
```

4. **Run the backend:**
```bash
npm run start:dev
```

5. **Run the PLC simulator (in another terminal):**
```bash
cd plc-simulator
npm install
npm start
```

## Project Structure

```
iiot-plc-node-react-dashboard/
 ├─ plc-simulator/      # MQTT publisher ✅
 ├─ backend-api/        # NestJS API ✅
 │  ├─ src/
 │  │  ├─ mqtt/         # MQTT consumer
 │  │  ├─ machines/     # Machines module
 │  │  ├─ metrics/      # Metrics module
 │  │  └─ auth/         # JWT authentication
 │  └─ Dockerfile
 ├─ frontend-dashboard/ # React dashboard ✅
 │  ├─ src/
 │  │  ├─ components/    # React components
 │  │  ├─ pages/        # Page components
 │  │  ├─ services/     # API services
 │  │  └─ contexts/     # React contexts
 ├─ docker-compose.yml  # Docker orchestration
 └─ README.md
```

## Backend API

### Implemented Features

✅ MQTT message consumption  
✅ PostgreSQL persistence  
✅ REST API (`GET /machines`, `GET /metrics`)  
✅ JWT authentication  
✅ Swagger at `/api`  

### How to Run

```bash
# Start PostgreSQL and Mosquitto
docker-compose up -d postgres mosquitto

# Run backend (development)
cd backend-api
npm run start:dev
```

### Default Credentials

- **Username:** `admin`
- **Password:** `admin123`

### Endpoints

- `POST /auth/login` - Get JWT token
- `GET /machines` - List machines (requires authentication)
- `GET /metrics?machineId=&from=&to=` - Get metrics (requires authentication)

### Documentation

- **Swagger UI:** `http://localhost:3000/api`
- **Backend README:** [backend-api/README.md](./backend-api/README.md)

## PLC Simulator

The simulator publishes data every 1 second to topic `factory/machines/M-01`.

**Data format:**
```json
{
  "machineId": "M-01",
  "temperature": 72.3,
  "pressure": 4.1,
  "status": "RUNNING",
  "timestamp": "2026-01-13T10:00:00Z"
}
```

## Security

- JWT authentication required for protected endpoints
- Passwords hashed with bcrypt
- CORS configured

## Environment Variables

### Backend (.env)

```env
DB_HOST=localhost
DB_PORT=5433
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=iiot_db

MQTT_BROKER=mqtt://localhost:1883
MQTT_TOPIC=factory/machines/+

JWT_SECRET=your-secret-key-change-in-production
PORT=3000
```

## Docker Compose

Available services:
- **mosquitto**: MQTT broker (port 1883)
- **postgres**: PostgreSQL database (port 5433)
- **backend-api**: NestJS API (port 3000)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f backend-api

# Stop services
docker-compose down
```

## Frontend Dashboard

### Features Implemented

✅ Login page with JWT authentication  
✅ Machines list with real-time status  
✅ Real-time dashboard with live charts  
✅ Historical data charts with time range selection  
✅ Auto-refresh every 2-5 seconds  
✅ Responsive design with TailwindCSS  

### How to Run

```bash
cd frontend-dashboard
npm install
npm run dev
```

The dashboard will be available at `http://localhost:5173`

**Default credentials:**
- Username: `admin`
- Password: `admin123`

## Next Steps

- [ ] Add WebSocket for real-time updates (optional)
- [ ] Implement alert system
- [ ] Add Redis cache
- [ ] Implement RBAC (Role-Based Access Control)

## License

This project is an educational example.
