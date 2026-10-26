# SmartERP

SmartERP is a comprehensive, production-ready MERN-stack ERP designed for small and medium businesses. 
It features Inventory, Sales, Purchase, and HR modules along with a robust reporting dashboard.

## Architecture

- **Frontend**: React (Vite), Tailwind CSS v4, React Router v6, Recharts, Axios, Lucide React.
- **Backend**: Node.js, Express, Mongoose, MongoDB Atlas, JWT, bcrypt, node-cron.
- **Testing**: Jest, Supertest, mongodb-memory-server.
- **Security**: Helmet, express-rate-limit, strict CORS.

## Modules & Roles

| Module      | Admin | Manager | Staff |
|-------------|-------|---------|-------|
| Inventory   | Read/Write | Read/Write | Read Only |
| Sales       | Read/Write | Read/Write | Read/Write (Drafts) |
| Purchases   | Read/Write | Read/Write | None |
| HR          | Read/Write | Read Only  | None |
| Reports     | Read/CSV   | Read/CSV   | None |

## Dedicated Role Portals & Demo Credentials
- **Role Gateway**: `/login` (Interactive Persona Selector)
- **Admin Control Portal**: `/login/admin` (`admin@smarterp.com` / `password123`) -> System Governance & Executive Overview
- **Operations Portal**: `/login/manager` (`manager@smarterp.com` / `password123`) -> Inventory, Procurement & Operational Overview
- **Staff Desk**: `/login/staff` (`staff@smarterp.com` / `password123`) -> POS, Sales Orders & Inventory Lookup

## Quick Start

### 1. Environment Setup
Create a `.env` file in the `/server` directory (reference `.env.example`):
```env
PORT=5000
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### 2. Installation
Run from the root directory:
```bash
npm run install:all
```

### 3. Seed Database
```bash
npm run seed
```

### 4. Run Development Server
```bash
npm run dev
```
