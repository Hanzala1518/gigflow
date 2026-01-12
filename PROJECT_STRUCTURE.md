# GigFlow - Project Structure

This document describes the complete folder structure of the GigFlow application.

## 📂 Root Level

```
GigFlow/
├── backend/                      # Backend API (Node.js/Express)
├── frontend/                     # Frontend UI (React/Vite)
├── .gitignore                    # Git ignore rules
├── package.json                  # Root workspace scripts
├── render.yaml                   # Render deployment configuration
├── deploy-prepare.ps1            # Windows deployment helper
├── deploy-prepare.sh             # Unix deployment helper
├── DEPLOYMENT.md                 # Complete deployment guide
├── DEPLOYMENT_CHECKLIST.md       # Deployment checklist
├── PROJECT_STRUCTURE.md          # This file
└── README.md                     # Main documentation
```

## 🔙 Backend Structure (`/backend`)

```
backend/
├── config/
│   ├── cors.js                   # CORS middleware configuration
│   ├── database.js               # MongoDB connection setup
│   ├── socket.js                 # Socket.io server configuration
│   └── index.js                  # Config barrel export
├── controllers/
│   ├── authController.js         # Auth logic (register, login, logout)
│   ├── bidController.js          # Bid logic (create, hire, list)
│   ├── gigController.js          # Gig logic (create, list, search)
│   └── index.js                  # Controllers barrel export
├── middleware/
│   ├── auth.js                   # JWT authentication middleware
│   ├── error.js                  # Global error handler
│   └── index.js                  # Middleware barrel export
├── models/
│   ├── User.js                   # User schema & methods
│   ├── Gig.js                    # Gig schema & indexes
│   ├── Bid.js                    # Bid schema & indexes
│   └── index.js                  # Models barrel export
├── routes/
│   ├── authRoutes.js             # /api/auth/* routes
│   ├── bidRoutes.js              # /api/bids/* routes
│   ├── gigRoutes.js              # /api/gigs/* routes
│   └── index.js                  # Routes barrel export
├── utils/
│   ├── appError.js               # Custom error class
│   ├── catchAsync.js             # Async error wrapper
│   ├── jwt.js                    # JWT token utilities
│   ├── validators.js             # Input validation helpers
│   └── index.js                  # Utils barrel export
├── .env                          # Environment variables (DO NOT COMMIT)
├── .env.example                  # Environment template
├── index.js                      # Main entry point
├── package.json                  # Backend dependencies & scripts
└── package-lock.json             # Locked dependency versions
```

### Backend Tech Stack
- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Database:** MongoDB (Mongoose ODM)
- **Authentication:** JWT (HttpOnly cookies)
- **Real-time:** Socket.io
- **Security:** bcrypt, cors, cookie-parser

## 🎨 Frontend Structure (`/frontend`)

```
frontend/
├── public/                       # Static assets
│   └── vite.svg
├── src/
│   ├── assets/                   # Images, fonts, etc.
│   ├── components/
│   │   ├── auth/                 # Auth-related components
│   │   │   ├── LoginForm.jsx
│   │   │   └── RegisterForm.jsx
│   │   ├── bids/                 # Bid components
│   │   │   ├── BidCard.jsx
│   │   │   ├── PlaceBidModal.jsx
│   │   │   └── index.js
│   │   ├── common/               # Reusable components
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── Spinner.jsx
│   │   │   └── index.js
│   │   ├── gigs/                 # Gig components
│   │   │   ├── GigCard.jsx
│   │   │   ├── GigForm.jsx
│   │   │   └── index.js
│   │   └── layout/               # Layout components
│   │       ├── Footer.jsx
│   │       ├── Header.jsx
│   │       ├── Layout.jsx
│   │       └── index.js
│   ├── pages/
│   │   ├── auth/                 # Auth pages
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   └── index.js
│   │   ├── dashboard/            # Dashboard
│   │   │   ├── Dashboard.jsx
│   │   │   └── index.js
│   │   └── gigs/                 # Gig pages
│   │       ├── GigDetail.jsx
│   │       ├── GigFeed.jsx
│   │       └── index.js
│   ├── services/
│   │   ├── api.js                # Axios instance config
│   │   ├── authService.js        # Auth API calls
│   │   ├── bidService.js         # Bid API calls
│   │   ├── gigService.js         # Gig API calls
│   │   ├── socket.js             # Socket.io client
│   │   └── index.js              # Services barrel export
│   ├── store/
│   │   ├── slices/
│   │   │   ├── authSlice.js      # Auth state & thunks
│   │   │   ├── bidSlice.js       # Bid state & thunks
│   │   │   └── gigSlice.js       # Gig state & thunks
│   │   └── index.js              # Redux store config
│   ├── App.jsx                   # Root component
│   ├── App.css                   # App styles
│   ├── index.css                 # Global styles
│   └── main.jsx                  # React entry point
├── .env.production               # Production env vars
├── index.html                    # HTML template
├── package.json                  # Frontend dependencies & scripts
├── package-lock.json             # Locked dependency versions
├── postcss.config.js             # PostCSS configuration
├── tailwind.config.js            # Tailwind CSS config
├── vercel.json                   # Vercel deployment config
└── vite.config.js                # Vite build config
```

### Frontend Tech Stack
- **UI Library:** React 18
- **Build Tool:** Vite
- **State Management:** Redux Toolkit
- **Routing:** React Router v6
- **Styling:** Tailwind CSS
- **HTTP Client:** Axios
- **Real-time:** Socket.io Client
- **Notifications:** React Hot Toast

## 🔐 Environment Variables

### Backend (`backend/.env`)
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/gigflow
JWT_SECRET=your_secret_key_here
JWT_EXPIRES_IN=7d
COOKIE_MAX_AGE=604800000
CORS_ORIGIN=http://localhost:3000
```

### Frontend (`frontend/.env.production`)
```env
VITE_API_URL=https://your-backend.onrender.com
```

## 📦 Package.json Files

### Root (`package.json`)
Workspace-level scripts for convenience:
- `npm run backend` - Start backend in dev mode
- `npm run frontend` - Start frontend in dev mode
- `npm run install:all` - Install all dependencies

### Backend (`backend/package.json`)
- `npm start` - Production start
- `npm run dev` - Development with nodemon

### Frontend (`frontend/package.json`)
- `npm run dev` - Development server
- `npm run build` - Production build
- `npm run preview` - Preview production build

## 🚀 Deployment Structure

### Render (Backend)
- Deploy from `backend/` folder
- Root directory: `backend`
- Build: `npm install`
- Start: `npm start`

### Vercel (Frontend)
- Deploy from `frontend/` folder
- Root directory: `frontend`
- Build: `npm run build`
- Output: `dist/`

## 📝 Important Notes

1. **Do NOT commit:**
   - `node_modules/` folders
   - `.env` files
   - `package-lock.json` (optional, but recommended to commit)
   - `dist/` or `build/` folders

2. **Backend runs on:** Port 5000 (development), 10000 (production/Render)

3. **Frontend runs on:** Port 3000 (development), Vercel handles production

4. **Database:** MongoDB with replica sets (required for transactions)

5. **Authentication:** JWT tokens stored in HttpOnly cookies

6. **Real-time:** Socket.io for hire notifications

## 🛠️ Development Workflow

1. **Install dependencies:**
   ```bash
   npm run install:all
   ```

2. **Setup environment:**
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your values
   ```

3. **Start MongoDB:**
   ```bash
   mongod --replSet rs0 --dbpath "C:\data\db"
   # In another terminal: mongosh --eval "rs.initiate()"
   ```

4. **Run backend:**
   ```bash
   cd backend
   npm run dev
   ```

5. **Run frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

6. **Access application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - Health check: http://localhost:5000/health

---

**Last Updated:** January 13, 2026
**Version:** 1.0.0
