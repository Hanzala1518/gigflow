# GigFlow - Freelance Marketplace

A full-stack mini freelance marketplace built with Node.js, Express, MongoDB, React, and Socket.io. Features real-time notifications, secure JWT authentication, and atomic hiring transactions.

![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![React](https://img.shields.io/badge/React-18-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-7+-green)
![Socket.io](https://img.shields.io/badge/Socket.io-4.7-black)

## 🚀 Features

- **User Authentication** - Secure JWT-based auth with HttpOnly cookies
- **Gig Management** - Post and browse freelance gigs
- **Bidding System** - Place bids on open gigs
- **Atomic Hiring** - Race-condition-free hiring with MongoDB transactions
- **Real-time Notifications** - Instant notifications via Socket.io
- **Protected Routes** - Role-based access control
- **Search** - Filter gigs by title

## 📋 Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js | Runtime environment |
| Express.js | Web framework |
| MongoDB | Database |
| Mongoose | ODM for MongoDB |
| JWT | Authentication tokens |
| bcrypt | Password hashing |
| Socket.io | Real-time communication |
| cookie-parser | Cookie handling |
| cors | Cross-origin requests |

### Frontend
| Technology | Purpose |
|------------|---------|
| React 18 | UI library |
| Vite | Build tool |
| Redux Toolkit | State management |
| React Router | Client-side routing |
| Tailwind CSS | Styling |
| Axios | HTTP client |
| Socket.io Client | Real-time events |
| React Hot Toast | Notifications |

## 📁 Project Structure

```
GigFlow/
├── backend/                  # Backend API (Node.js/Express)
│   ├── config/
│   │   ├── cors.js          # CORS configuration
│   │   ├── database.js      # MongoDB connection
│   │   └── socket.js        # Socket.io setup
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── bidController.js
│   │   └── gigController.js
│   ├── middleware/
│   │   ├── auth.js          # JWT verification
│   │   └── error.js         # Error handling
│   ├── models/
│   │   ├── User.js
│   │   ├── Gig.js
│   │   └── Bid.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── bidRoutes.js
│   │   └── gigRoutes.js
│   ├── utils/
│   │   ├── appError.js
│   │   ├── catchAsync.js
│   │   ├── jwt.js
│   │   └── validators.js
│   ├── .env.example         # Backend env template
│   ├── index.js             # Entry point
│   └── package.json
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── store/
│   │   └── App.jsx
│   ├── .env.production      # Frontend prod env
│   ├── package.json
│   └── vite.config.js
├── .gitignore
├── package.json             # Root workspace scripts
├── render.yaml              # Render deployment config
├── DEPLOYMENT.md            # Deployment guide
└── README.md
```

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/auth/register` | Register new user | Public |
| POST | `/api/auth/login` | Login user | Public |
| POST | `/api/auth/logout` | Logout user | Private |
| GET | `/api/auth/me` | Get current user | Private |

### Gigs
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/gigs` | List open gigs | Public |
| GET | `/api/gigs?search=term` | Search gigs | Public |
| GET | `/api/gigs/:id` | Get gig details | Public |
| POST | `/api/gigs` | Create new gig | Private |

### Bids
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/bids` | Place a bid | Private |
| GET | `/api/bids/my-bids` | Get user's bids | Private |
| GET | `/api/bids/:gigId` | Get bids for gig | Private (Owner) |
| PATCH | `/api/bids/:bidId/hire` | Hire freelancer | Private (Owner) |

## ⚡ Hiring Transaction Flow

The hiring process uses MongoDB transactions to ensure data consistency:

```
┌─────────────────────────────────────────────────────────────────┐
│                    ATOMIC HIRE TRANSACTION                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. Start MongoDB Session                                        │
│  2. Begin Transaction (snapshot isolation)                       │
│                                                                  │
│  ┌─────────────── VALIDATION ──────────────┐                    │
│  │  • Validate bid exists & is pending     │                    │
│  │  • Validate gig exists & is open        │                    │
│  │  • Verify requester is gig owner        │                    │
│  └─────────────────────────────────────────┘                    │
│                                                                  │
│  ┌─────────────── ATOMIC WRITES ───────────┐                    │
│  │  • Gig.status → "assigned"              │                    │
│  │  • Selected Bid.status → "hired"        │                    │
│  │  • Other Bids.status → "rejected"       │                    │
│  └─────────────────────────────────────────┘                    │
│                                                                  │
│  3. Commit Transaction                                           │
│  4. Send Socket.io notification to hired freelancer              │
│  5. End Session                                                  │
│                                                                  │
│  ON ERROR: Abort transaction (rollback all changes)              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Why Transactions?

Without transactions, race conditions could occur:
- Two concurrent hire requests pass the "gig is open" check
- Both attempt to hire different freelancers
- Result: Multiple hired bids, inconsistent data

Transactions ensure:
- **Atomicity**: All operations succeed or all fail
- **Isolation**: Concurrent requests are serialized
- **Consistency**: Database remains in valid state

## 🔔 Real-time Architecture

```
┌──────────────┐     hire()      ┌──────────────┐
│  Gig Owner   │ ──────────────► │   Backend    │
│   (Client)   │                 │   (Server)   │
└──────────────┘                 └──────┬───────┘
                                        │
                                        │ emitToUser()
                                        ▼
                                 ┌──────────────┐
                                 │  Socket.io   │
                                 │   Server     │
                                 └──────┬───────┘
                                        │
                                        │ "hired" event
                                        ▼
                                 ┌──────────────┐
                                 │  Freelancer  │ ◄── Toast: "You have been
                                 │   (Client)   │     hired for [Gig Title]"
                                 └──────────────┘
```

### Socket.io Flow:
1. User authenticates → Socket connection established
2. User joins personal room (`user:{userId}`)
3. On hire → Server emits to freelancer's room
4. Client receives event → Shows toast notification

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 18+
- MongoDB 7+ (with replica set for transactions)
- npm or yarn

### 1. Clone & Install

```bash
# Clone repository
git clone <repository-url>
cd GigFlow

# Install all dependencies (backend + frontend)
npm run install:all

# Or install individually:
cd backend
npm install

cd ../frontend
npm install
```

### 2. Environment Setup

```bash
# Backend environment
cd backend
cp .env.example .env
# Edit backend/.env with your MongoDB URI and JWT secret

# Frontend environment (for production deployment)
cd ../frontend
# frontend/.env.production is already configured
# Update VITE_API_URL after deploying backend
```

### 3. MongoDB Replica Set

Transactions require a replica set. For local development:

```bash
# Start MongoDB as replica set
mongod --replSet rs0 --dbpath "C:\data\db"

# Initialize replica set (in mongo shell)
rs.initiate()
```

**Note:** For production deployment, use MongoDB Atlas which has replica sets enabled by default.

For detailed production deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md).

### 4. Run Development Servers

```bash
# Option 1: Run from root (opens both in same terminal)
npm run backend    # Backend only
npm run frontend   # Frontend only

# Option 2: Run in separate terminals

# Terminal 1: Backend (port 5000)
cd backend
npm run dev

# Terminal 2: Frontend (port 3000)
cd frontend
npm run dev
```

### 5. Access Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Health Check: http://localhost:5000/health

## 🔐 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment | `development` |
| `MONGODB_URI` | MongoDB connection | `mongodb://localhost:27017/gigflow` |
| `JWT_SECRET` | JWT signing key | `your-secret-key` |
| `JWT_EXPIRES_IN` | Token expiry | `7d` |
| `COOKIE_MAX_AGE` | Cookie lifetime (ms) | `604800000` |
| `CORS_ORIGIN` | Allowed origins | `http://localhost:3000` |

## 🚀 Production Deployment

### Backend Checklist
- [ ] Set `NODE_ENV=production`
- [ ] Use strong `JWT_SECRET`
- [ ] Configure `CORS_ORIGIN` for production domain
- [ ] Enable HTTPS (cookies require secure flag)
- [ ] Use MongoDB Atlas or production replica set

### Frontend Build

```bash
cd frontend
npm run build
# Serve dist/ folder with nginx or similar
```

### Cookie Configuration (Production)

Cookies are automatically configured for production:
- `httpOnly: true` - Prevents XSS attacks
- `secure: true` - HTTPS only
- `sameSite: 'strict'` - CSRF protection

## 📊 Data Models

### User
```javascript
{
  name: String,        // 2-50 chars
  email: String,       // unique, indexed
  password: String,    // hashed with bcrypt
  createdAt: Date,
  updatedAt: Date
}
```

### Gig
```javascript
{
  title: String,       // 5-100 chars
  description: String, // 20-2000 chars
  budget: Number,      // min 1
  ownerId: ObjectId,   // ref: User
  status: String,      // "open" | "assigned"
  createdAt: Date,
  updatedAt: Date
}
```

### Bid
```javascript
{
  gigId: ObjectId,        // ref: Gig, indexed
  freelancerId: ObjectId, // ref: User
  message: String,        // 10-1000 chars
  price: Number,          // min 1
  status: String,         // "pending" | "hired" | "rejected"
  createdAt: Date,
  updatedAt: Date
}
```

## 🧪 Testing the Application

1. **Register** two users (Owner and Freelancer)
2. **Login** as Owner and create a gig
3. **Login** as Freelancer and place a bid
4. **Login** as Owner, view bids, click "Hire"
5. **Freelancer** sees real-time toast notification! 🎉

## � Deployment

For detailed instructions on deploying to production:

- **Frontend:** Vercel
- **Backend:** Render  
- **Database:** MongoDB Atlas

See [DEPLOYMENT.md](DEPLOYMENT.md) for complete step-by-step deployment guide and [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) for a quick checklist.

## �📝 License

ISC

---

Built with ❤️ for learning full-stack development
