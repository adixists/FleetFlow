# FleetFlow ERP 🚛💨

FleetFlow is a modern, full-stack Fleet Management System (ERP) designed for modularity, scalability, and real-time operations. It enables managers, dispatchers, and analysts to track vehicles, enforce compliance rules, manage trip lifecycles, and analyze fleet efficiency through a polished, dark-themed, data-driven dashboard.

---

## ✨ Key Features

- **📊 Dynamic Command Center**: Real-time KPI cards, system alerts, and **Fleet Distribution Filters** (By Type, Status, and Region).
- **🚚 Vehicle Asset Registry**: Full CRUD for assets, tracking `Acquisition Cost`, `Max Capacity`, and automated status tracking (*Available, On Trip, In Shop, Retired*).
- **🛤️ Smart Dispatcher & Compliance**: Advanced trip management. The system strictly validates logic before dispatching:
  - Blocks dispatch if `Cargo Weight` exceeds vehicle `Max Capacity`.
  - Blocks dispatch if the assigned driver's `License Expiry` is in the past.
- **👨‍✈️ Driver Management**: Track driver safety scores, compliance, and trip completion rates.
- **🔧 Maintenance Workflows**: Automated logic changes vehicle status to "In Shop" when logging repairs, instantly removing it from the dispatcher's available pool.
- **⛽ Expenses & ROI Analytics**: Calculate fuel efficiency (KM/Liter), total maintenance costs, and **Vehicle Return on Investment** ((Revenue - Expenses) / Acquisition Cost).
- **📥 Data Exports**: One-click CSV export functionality for monthly payroll and payload health audits.
- **🔐 Secure RBAC**: Role-Based Access Control (Manager, Dispatcher, Analyst, Safety Officer) using JWT.
- **📡 Real-time Updates**: Instant status synchronization across all connected clients using Socket.io.

---

## 🛠️ Tech Stack

### Frontend
- **React (Vite)**: Fast, modular UI development.
- **Material UI (MUI)**: Premium component library heavily customized with a glassmorphism dark theme.
- **Recharts**: Responsive data visualization and gradients.
- **Socket.io Client**: Real-time event handling.
- **Axios**: API interaction with JWT interceptors.

### Backend
- **Node.js & Express**: Scalable REST API server.
- **Prisma ORM**: Type-safe database interactions and schema management.
- **SQLite**: Lightweight, zero-config local relational database (easily swappable to PostgreSQL).
- **Socket.io**: Real-time communication server.
- **JWT & Bcrypt**: Secure authentication and password hashing.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18+)
- **npm** 

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
   DATABASE_URL="file:./dev.db"
   JWT_SECRET="fleetflow_super_secret_key_2026"
   PORT=5000
   ```

3. **Database Migration & Seeding**
   ```bash
   npx prisma db push
   node prisma/seed.js
   ```

4. **Frontend Configuration**
   ```bash
   cd ../fleetflow-frontend
   npm install
   ```

### Running the Application (Development)

Open two terminal windows:

- **Terminal 1 (Backend)**: `cd fleetflow-backend && node index.js` (API runs on port 5000)
- **Terminal 2 (Frontend)**: `cd fleetflow-frontend && npm run dev` (Vite dev server runs on port 5173)

---

## 🔑 Demo Credentials

| Role | Email | Password | Access Level |
|------|-------|----------|--------------|
| **Manager** | `manager@fleet.io` | `admin123` | Full Access |
| **Dispatcher** | `dispatcher@fleet.io` | `admin123` | Trips, Drivers, Vehicles |
| **Analyst** | `analyst@fleet.io` | `admin123` | Analytics, Dashboard |
| **Safety Officer** | `safety@fleet.io` | `admin123` | Drivers, Maintenance |

---

## 📁 Project Structure

```text
FleetFlow/
├── fleetflow-backend/
│   ├── prisma/             # SQLite DB file, Schema & Seed logic
│   ├── routes/             # API Endpoints (Auth, Vehicles, Trips, etc.)
│   ├── middleware/         # Auth & RBAC guard
│   └── index.js            # Main Express/Socket.io entry
├── fleetflow-frontend/
│   ├── src/
│   │   ├── api/            # Axios & Socket configs
│   │   ├── components/     # Reusable UI (Layout, KPICards, StatusChips)
│   │   ├── context/        # AuthProvider state
│   │   ├── pages/          # Full page views (Login, Dashboard, Analytics...)
│   │   └── theme.js        # Custom MUI Theme Definition
│   └── package.json
└── README.md
```

---

## ⚖️ License
Distributed under the MIT License.
