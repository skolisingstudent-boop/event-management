# Event Management Application

A simple event management system with React frontend and Express.js backend.

## Features

✅ Create events  
✅ View all events  
✅ View upcoming events  
✅ Responsive UI  

## Tech Stack

- **Frontend**: React 18 + Vite
- **Backend**: Node.js + Express.js
- **Database**: PostgreSQL

## Project Structure

```
event-management-app/
├── frontend/          # React Vite app
│   ├── src/
│   ├── package.json
│   └── vite.config.js
└── backend/           # Express API server
    ├── server.js
    ├── database.sql
    ├── package.json
    └── .env.example
```

## Setup Instructions

### Prerequisites

- Node.js (v16+)
- PostgreSQL installed and running
- npm or yarn

### 1. Database Setup

1. Create PostgreSQL database:
```bash
createdb event_management
```

2. Run the schema:
```bash
psql event_management < backend/database.sql
```

### 2. Backend Setup

```bash
cd backend

# Copy environment file
cp .env.example .env

# Edit .env with your database credentials
# DATABASE_URL=postgresql://user:password@localhost:5432/event_management

# Install dependencies
npm install

# Start the server
npm run dev
```

Server will run on `http://localhost:5000`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

App will be available at `http://localhost:3000`

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/events` | Get all events |
| GET | `/api/events/upcoming` | Get upcoming events only |
| GET | `/api/events/:id` | Get single event |
| POST | `/api/events` | Create new event |

### Create Event Payload

```json
{
  "title": "Event Name",
  "description": "Event description",
  "event_date": "2024-06-15T10:30:00",
  "location": "Event Location"
}
```

## Running the Application

1. Make sure PostgreSQL is running
2. Start backend: `cd backend && npm run dev`
3. Start frontend: `cd frontend && npm run dev`
4. Open browser to `http://localhost:3000`

## Development

- Frontend hot reloading works automatically with Vite
- Backend auto-restarts with nodemon on file changes
- API proxy configured in `vite.config.js`

## Next Steps

- Add event editing functionality
- Add event deletion
- Add authentication
- Add event categories
- Add email notifications
- Deploy to production
