# SmartServe - Restaurant Ordering & Management System

SmartServe is a modern web application designed for restaurants to streamline digital ordering and order management. Customers can browse menus and order directly to their tables, while administrators have dedicated tools to manage live orders and menu catalog items.

---

## Architecture & Tech Stack

### Frontend (`client/`)
- **Framework:** React 19 + Vite 8
- **Routing:** React Router v7
- **Styling:** Custom CSS with Glassmorphism UI, Responsive Design, and CSS custom variables
- **State & Contexts:** 
  - `AuthContext`: Authentication, token persistence, and role-based access
  - `ThemeContext`: Dark/Light theme toggle
  - `ToastContext`: Dynamic notifications
- **HTTP Client:** Axios (configured with auth interceptors at `client/src/services/api.js`)

### Backend (`server/`)
- **Runtime:** Node.js + Express 5
- **Database:** MongoDB with Mongoose 9 ODM
- **Authentication:** JWT (JSON Web Tokens) with role-based authorization (`customer`, `admin`)
- **Password Security:** bcryptjs hashing
- **File Uploads:** Multer (stores food images in `server/uploads/`)
- **CORS & Environment:** cors, dotenv

---

## Prerequisites

1. **Node.js** (v18 or higher recommended; v22+ tested)
2. **MongoDB Atlas** (Cloud Database Cluster)

---

## Quick Start Guide

### 1. Backend Setup

1. Open a terminal and navigate to the `server` directory:
   ```bash
   cd SmartServe/server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure your environment in `server/.env`:
   ```env
   PORT=5000
   MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxxx.mongodb.net/test?retryWrites=true&w=majority
   JWT_SECRET=your_secret_key_here
   ```
   *(Note: If your password contains `@`, encode it as `%40` in the URI)*

4. Start the backend server:
   ```bash
   npm start
   ```
   *The server will connect directly to MongoDB Atlas on port 5000.*

---

### 2. Frontend Setup

1. Open a second terminal and navigate to the `client` directory:
   ```bash
   cd SmartServe/client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The client will start (typically on `http://localhost:5173`).*

---

## Managing the Single Admin via MongoDB Atlas

All users who register on the website are assigned the role `customer` by default. To make an account the **sole Admin**:

1. **Register the Account:**
   - Run the frontend and go to the Registration page (`/register`).
   - Create your account (e.g. `youremail@example.com` and password).

2. **Open MongoDB Atlas:**
   - Log in to your [MongoDB Atlas](https://cloud.mongodb.com/) dashboard.
   - Go to **Database** -> **Browse Collections**.
   - Navigate to the `smartserve` database and click the `users` collection.

3. **Promote the User to Admin:**
   - Find your user document (search `{ "email": "youremail@example.com" }`).
   - Click the pencil/edit icon on the document.
   - Change `"role": "customer"` to `"role": "admin"`.
   - Click **Update**.

4. **Log In:**
   - Log into the app with that email and password.
   - The user now has full administrative access to Orders (`/admin/orders`) and Product Management (`/admin/add-product`).

*Note: Any new account registered via the UI registers as a `customer` by default.*
