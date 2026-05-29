# Event Management API

Express.js backend for event management application with PostgreSQL.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up PostgreSQL database:
```bash
# Create database
createdb event_management

# Run SQL schema
psql event_management < database.sql
```

3. Create `.env` file:
```
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/event_management
NODE_ENV=development
```

4. Start the server:
```bash
npm run dev
```

## API Endpoints

- `GET /api/health` - Health check
- `GET /api/events` - Get all events
- `GET /api/events/upcoming` - Get upcoming events
- `GET /api/events/:id` - Get single event
- `POST /api/events` - Create new event
