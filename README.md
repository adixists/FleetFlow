# FleetFlow ERP 🚛💨

FleetFlow is a modern, full-stack Fleet Management System (ERP) designed for modularity, scalability, and real-time fleet operations. It enables managers, dispatchers, and analysts to track vehicles, manage trip lifecycles, monitor driver compliance, and analyze fleet efficiency through a polished, data-driven dashboard.

---

## ✨ Key Features

- **📊 Dynamic Dashboard**: Real-time KPI cards, status breakdowns, and system alerts.
- **🚚 Vehicle Registry**: Full CRUD for assets with automated status tracking (Available, On Trip, In Shop, Retired).
- **🛤️ Smart Dispatcher**: Advanced trip management with capacity validation, driver license expiry checks, and automated odometer updates.
- **👨‍✈️ Driver Management**: Track driver safety scores, compliance (license expiry), and trip completion rates.
- **🔧 Maintenance Logs**: Automated "In Shop" status workflows when logging vehicle repairs.
- **⛽ Fuel Management**: Log consumption and monitor cost-per-liter efficiency across the fleet.
- **📈 Advanced Analytics**: Interactive charts (Recharts) for monthly trends, cost breakdowns, and fleet utilization with CSV export support.
- **🔐 Secure RBAC**: Role-Based Access Control (Manager, Dispatcher, Analyst, Safety Officer) using JWT.
- **📡 Real-time Updates**: Instant status synchronization across all clients using Socket.io.

---

## 🛠️ Tech Stack

### Frontend
- **React (Vite)**: Fast, modular UI development.
- **Material UI (MUI)**: Premium component library with custom dark theme.
- **Recharts**: Responsive data visualization.
- **Socket.io Client**: Real-time event handling.
- **Axios**: API interaction with interceptors.

### Backend
- **Node.js & Express**: Scalable API server.
- **Prisma ORM**: Type-safe database interactions and migrations.
- **PostgreSQL**: Robust relational data storage.
- **Socket.io**: Real-time communication server.
- **JWT & Bcrypt**: Secure authentication and password hashing.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18+)
- **PostgreSQL** instance
- **npm** (comes with Node)

### Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/adixists/FleetFlow.git
   cd FleetFlow
   ```

2. **Backend Configuration**
   ```bash
   cd fleetflow-backend
   npm install
   ```
   Create a `.env` file in `fleetflow-backend/`:
   ```env
   DATABASE_URL="postgresql://postgres:password@localhost:5432/fleetflow?schema=public"
   JWT_SECRET="your_secret_key"
   PORT=5000
   ```

3. **Database Migration & Seeding**
   ```bash
   npx prisma migrate dev --name init
   node prisma/seed.js
   ```

4. **Frontend Configuration**
   ```bash
   cd ../fleetflow-frontend
   npm install
   ```

### Running the Application

- **Start Backend**: `cd fleetflow-backend && node index.js` (Server runs on port 5000)
- **Start Frontend**: `cd fleetflow-frontend && npm run dev` (Vite dev server runs on port 5173)

---

## 🔑 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| **Manager** | `manager@fleet.io` | `admin123` |
| **Dispatcher** | `dispatcher@fleet.io` | `admin123` |
| **Analyst** | `analyst@fleet.io` | `admin123` |
| **Safety Officer** | `safety@fleet.io` | `admin123` |

---

## 📁 Project Structure

```text
FleetFlow/
├── fleetflow-backend/
│   ├── prisma/             # Schema & Seed data
│   ├── routes/             # API Endpoints
│   ├── middleware/         # Auth & RBAC
│   └── index.js            # Main server entry
├── fleetflow-frontend/
│   ├── src/
│   │   ├── api/            # Axios & Socket configs
│   │   ├── components/     # Reusable UI parts
│   │   ├── context/        # Auth state
│   │   ├── pages/          # Full page views
│   │   └── theme.js        # Custom MUI Theme
│   └── ...
└── README.md
```

---

## ⚖️ License
Distributed under the MIT License.
