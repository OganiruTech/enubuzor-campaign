# Campaign Management Platform

A full-stack campaign management and community engagement platform built with React, Node.js, and MySQL.

## Features

- **Events Management** - Create and manage campaign events
- **Volunteer Signup** - Community members can sign up as volunteers
- **Community Issues** - Report and track community problems
- **Donations** - Accept donations for the campaign
- **Media Gallery** - Showcase photos, videos, and press releases
- **Admin Dashboard** - Complete admin interface for managing all aspects
- **User Authentication** - Secure JWT-based authentication

## Project Structure

```
├── src/                    # React frontend
│   ├── pages/             # Page components
│   ├── components/        # Reusable React components
│   ├── api/               # API client setup
│   ├── lib/               # Utilities and context
│   └── hooks/             # Custom React hooks
├── backend/               # Node.js Express server
│   ├── routes/            # API route handlers
│   ├── middleware/        # Express middleware
│   ├── migrations/        # Database setup scripts
│   └── server.js          # Main server file
├── entities/              # Data entity definitions
└── public/                # Static files
```

## Prerequisites

- Node.js 18+
- MySQL 8.0+
- npm or yarn

## Setup Instructions

### 1. Frontend Setup

```bash
# Install frontend dependencies
npm install

# Copy environment template
cp .env.local.example .env.local

# Update .env.local with your settings
# VITE_API_URL=http://localhost:3001/api
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install backend dependencies
npm install

# Set up MySQL database
# Create .env file in backend/ directory with:
# NODE_ENV=development
# PORT=3001
# DB_HOST=localhost
# DB_PORT=3306
# DB_USER=root
# DB_PASSWORD=your_password
# DB_NAME=campaign_db
# JWT_SECRET=your_jwt_secret_key
# CORS_ORIGIN=http://localhost:5173

# Run database migrations
npm run migrate

# Start the backend server
npm run dev
```

### 3. Database Setup

Make sure MySQL is running, then:

```bash
cd backend
npm run migrate
```

This will:
- Create the campaign database
- Create all required tables (users, events, volunteers, etc.)

## Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`
The backend API will be at `http://localhost:3001/api`

### Production Build

```bash
npm run build
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile

### Events
- `GET /api/events` - Get all events
- `POST /api/events` - Create event (admin only)
- `PUT /api/events/:id` - Update event (admin only)
- `DELETE /api/events/:id` - Delete event (admin only)

### Volunteers
- `GET /api/volunteers` - Get all volunteers (admin only)
- `POST /api/volunteers` - Sign up as volunteer
- `PUT /api/volunteers/:id` - Update volunteer (admin only)

### Community Issues
- `GET /api/issues` - Get all issues
- `POST /api/issues` - Report new issue
- `POST /api/issues/:id/upvote` - Upvote an issue
- `PUT /api/issues/:id` - Update issue status (admin only)

### Donations
- `GET /api/donations` - Get donations (admin only)
- `POST /api/donations` - Create donation
- `GET /api/donations/stats/summary` - Get donation stats (admin only)

### Media
- `GET /api/media` - Get all media posts
- `POST /api/media` - Create media post (admin only)
- `POST /api/media/:id/like` - Like a media post
- `DELETE /api/media/:id` - Delete media post (admin only)

### Admin
- `GET /api/admin/stats/dashboard` - Get dashboard statistics
- `GET /api/admin/users/all` - Get all users (admin only)
- `POST /api/admin/rsvps` - Create RSVP
- `GET /api/admin/rsvps/:eventId` - Get event RSVPs (admin only)

## Available Scripts

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix linting issues

### Backend
- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm run migrate` - Run database migrations

## Default Admin Setup

After running migrations, create a default admin user by logging in and then manually updating the user role in the database, or modify the auth routes to create an admin user during setup.

## Environment Variables

See `.env.local.example` for all available configuration options.

## Troubleshooting

### Database Connection Error
- Ensure MySQL is running
- Check DB credentials in `.env` file
- Verify database name in backend/.env

### API Connection Error
- Ensure backend is running on port 3001
- Check VITE_API_URL in frontend .env.local
- Check CORS_ORIGIN in backend .env

### Port Already in Use
- Frontend: Change VITE port by running `npm run dev -- --port 3000`
- Backend: Change PORT in backend/.env

## Security Notes

- Change JWT_SECRET in production
- Use HTTPS in production
- Implement rate limiting for APIs
- Validate all user inputs
- Use environment variables for sensitive data

## License

MIT
