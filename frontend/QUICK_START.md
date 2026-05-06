# Quick Start Guide

## Prerequisites
- Node.js 18+
- MySQL 8.0+

## Setup

### 1. Frontend Setup
```bash
cp .env.local.example .env.local
npm install
```

### 2. Backend Setup
```bash
cd backend
cp .env.example .env
npm install
npm run migrate  # Create database
npm run dev      # Start server on port 3001
```

### 3. Frontend Development
```bash
# In root directory
npm run dev      # Start on port 5173
```

## Environment Variables (.env.local)
```
VITE_API_URL=http://localhost:3001/api
```

## Backend .env File
```
NODE_ENV=development
PORT=3001
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=campaign_db
JWT_SECRET=your_secret_key_change_in_production
CORS_ORIGIN=http://localhost:5173
```

## Database
The backend automatically creates all tables when you run `npm run migrate`.

## Default Access
- Frontend: http://localhost:5173
- API: http://localhost:3001/api
- Health check: http://localhost:3001/health

## API Authentication
All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

Tokens are obtained after login at `/api/auth/login`.

## Troubleshooting

**Database Connection Error:**
- Ensure MySQL is running
- Check credentials in backend/.env
- Run `npm run migrate` to create database

**Port Already in Use:**
- Frontend: Change `VITE_API_URL` 
- Backend: Change `PORT` in .env

**Build Issues:**
- Delete node_modules and run `npm install` again
- Clear npm cache: `npm cache clean --force`
