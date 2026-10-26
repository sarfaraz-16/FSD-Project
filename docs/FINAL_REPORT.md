# SmartERP Final Report & Deployment Guide

## 1. Executive Summary
SmartERP has been successfully built and polished up to Phase 6. The application uses a robust MERN stack with highly responsive UIs, aggregation pipelines for reporting, transactional database integrity, and scalable folder structure.

## 2. Deployment Guide

### Server (Render/Heroku)
1. Push your repository to GitHub.
2. In Render, create a new **Web Service**.
3. Connect your repository and select the `server` directory as the Root Directory.
4. **Build Command**: `npm install`
5. **Start Command**: `npm start`
6. **Environment Variables**:
   - `MONGO_URI`: Your MongoDB Atlas connection string.
   - `JWT_SECRET`: A secure random string.
   - `CLIENT_URL`: The production URL of the deployed client (e.g., Vercel URL).
   - `NODE_ENV`: `production`

### Client (Vercel/Netlify)
1. In Vercel, create a new **Project**.
2. Connect your repository and select the `client` directory as the Root Directory.
3. Vercel will automatically detect **Vite**. Leave build settings as default (`npm run build`).
4. **Environment Variables**:
   - `VITE_API_URL`: The production URL of your deployed server (e.g., `https://smarterp-api.onrender.com/api`).
5. Deploy. 

## 3. Walkthrough Demo Script (5 Minutes)

1. **Login (0:00 - 0:30):** Log in as `admin@smarterp.com`. Observe the dashboard's polished UI, Recharts graphs, and low-stock alerts.
2. **HR Management (0:30 - 1:00):** Navigate to HR. Show employee records and create a new staff user.
3. **Inventory & Purchasing (1:00 - 2:30):** Go to Products. See the product list. Create a Purchase Order for 50 units. Go to the PO, click "Receive" to demonstrate the confirmation dialog. Check the Inventory stock logs to see the +50 adjustment recorded automatically via Mongoose Transactions.
4. **Sales (2:30 - 3:30):** Create a Sales Order for a customer. Attempt to sell more than the available stock to demonstrate validation errors and toast notifications. Sell valid stock, Confirm the order, and observe stock deplete.
5. **Reports (3:30 - 4:30):** Go to Reports. Show the dynamic date filters and click "Export CSV" to demonstrate the download functionality.
6. **Role-Based Access (4:30 - 5:00):** Log out and log back in as the new Staff user to demonstrate the sidebar reducing its options based on permissions (Staff cannot see Purchases, Users, or full Reports).

## 4. Test Report
All modules feature End-to-End (`e2e.test.js`) and integration tests using `jest` and `mongodb-memory-server`. 
* Coverage: Auth, Dashboard, Inventory, HR, Purchases, Sales.
* Status: 100% Passing.
* Edge Cases Tested:
  - Race conditions in stock (Transactions).
  - Cross-role route access (403 Forbidden).
  - Invalid state transitions for PO/SO.

## 5. Security & Accessibility Polish
* `helmet` added for secure HTTP headers.
* `express-mongo-sanitize` for NoSQL injection prevention.
* Skeletons and Empty States used throughout the frontend.
* Toast feedback on actions.
