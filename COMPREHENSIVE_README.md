# Event Management Application - Full Stack

A complete event management system with user authentication, CRUD operations, search, filtering, admin panel, and input validation.

## ✨ Features

### User Management
- ✅ User Registration with validation
- ✅ Secure Login with bcrypt password hashing
- ✅ Session management with localStorage
- ✅ Admin role support

### Event Management  
- ✅ Create events with validation
- ✅ Read/View all events and upcoming events
- ✅ Update/Edit existing events
- ✅ Delete events with confirmation
- ✅ Search events by title, description, or location
- ✅ Filter events (upcoming vs all)

### Validation
- ✅ Backend input validation
- ✅ Frontend form validation
- ✅ Password strength requirements
- ✅ Email format validation
- ✅ Character length limits

### Admin Features
- ✅ Admin panel with user management
- ✅ View all users and their roles
- ✅ View all events system-wide
- ✅ User statistics

## 🏗️ Project Structure

```
event-management-app/
├── frontend/
│   ├── src/
│   ├── App.jsx          # Main React component with all features
│   ├── App.css          # Comprehensive styling
│   ├── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── README.md
├── backend/
│   ├── server.js        # Express API with validation & auth
│   ├── events.db        # SQLite database (auto-created)
│   ├── database.sql     # Database schema
│   ├── .env             # Environment variables
│   ├── .env.example
│   ├── package.json
│   └── README.md
└── README.md            # This file
```

## 🚀 Tech Stack

**Frontend:**
- React 18
- Vite (dev server & build tool)
- Axios (HTTP client)
- CSS3 (responsive design)

**Backend:**
- Node.js + Express.js
- SQLite3 (database)
- bcrypt (password hashing)
- CORS (cross-origin support)

## 🔧 Installation & Setup

### Prerequisites
- Node.js (v16+)
- npm or yarn

### 1. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Start the server
npm start
```

Server runs on `http://localhost:5000`

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

Frontend runs on `http://localhost:3000`

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Events (CRUD)
- `GET /api/events` - Get all events (supports ?search=term)
- `GET /api/events/upcoming` - Get upcoming events only
- `GET /api/events/:id` - Get single event
- `POST /api/events` - Create event
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event

### Admin
- `GET /api/admin/users?adminKey=admin123` - Get all users
- `POST /api/admin/users/:id/make-admin` - Make user admin

### Health
- `GET /api/health` - Health check

## 📝 Request/Response Examples

### Register User
```bash
POST /api/auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "confirmPassword": "SecurePass123"
}
```

### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "username": "john_doe",
  "password": "SecurePass123"
}
```

Response:
```json
{
  "message": "Login successful",
  "userId": 1,
  "username": "john_doe",
  "isAdmin": false
}
```

### Create Event
```bash
POST /api/events
Content-Type: application/json

{
  "title": "Team Meeting",
  "description": "Quarterly planning meeting",
  "event_date": "2024-06-15T10:30:00",
  "location": "Conference Room A"
}
```

## ✅ Input Validation

### Username
- Minimum 3 characters
- Must be unique
- Alphanumeric recommended

### Email
- Valid email format
- Must be unique

### Password
- Minimum 6 characters
- Must match confirmation password

### Event Title
- Required
- Maximum 255 characters
- Cannot be empty

### Event Date
- Required
- Must be valid ISO datetime string

### Event Description
- Optional
- Maximum 1000 characters

### Event Location
- Optional
- Maximum 255 characters

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  is_admin BOOLEAN DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
)
```

### Events Table
```sql
CREATE TABLE events (
  id INTEGER PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  event_date TIMESTAMP NOT NULL,
  location VARCHAR(255),
  created_by INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY(created_by) REFERENCES users(id)
)
```

## 🔐 Security Features

- ✅ Password hashing with bcrypt
- ✅ CORS enabled for frontend
- ✅ Input validation on both frontend and backend
- ✅ SQL injection prevention (parameterized queries)
- ✅ Admin key protection (simple, use JWT in production)
- ✅ Unique constraints on username/email

## 🎨 UI/UX Features

- Responsive design (mobile & desktop)
- Dark mode default with light mode support
- Real-time search and filtering
- Form validation with error messages
- Success/error notifications
- Event count badges
- Emoji icons for better UX
- Smooth transitions and hover effects
- Admin panel with statistics
- Clean, modern interface

## 📦 Building for Production

### Frontend
```bash
cd frontend
npm run build
# Output in dist/ folder
```

### Backend
Deploy `backend` folder to your server and set environment variables

## 🚀 Deployment Options

### Frontend
- Vercel (recommended)
- Netlify
- GitHub Pages
- AWS S3 + CloudFront

### Backend
- Heroku
- AWS EC2
- DigitalOcean
- Railway
- Fly.io

## 🔄 Environment Variables

### Backend (.env)
```
PORT=5000
NODE_ENV=development
```

## 📚 Future Enhancements

- [ ] Email notifications
- [ ] Calendar view
- [ ] Event categories/tags
- [ ] Attendee/RSVP system
- [ ] Event comments
- [ ] File uploads (images)
- [ ] Real-time updates (WebSocket)
- [ ] Payment integration
- [ ] Mobile app (React Native)
- [ ] API documentation (Swagger)
- [ ] Rate limiting
- [ ] JWT authentication
- [ ] Two-factor authentication
- [ ] Event templates
- [ ] Recurring events

## 📝 License

MIT License - feel free to use this project as a starter template

## 👨‍💻 Contributing

Feel free to fork, submit issues, and create pull requests!

## 📞 Support

For issues and questions, please create an GitHub issue or contact the development team.
