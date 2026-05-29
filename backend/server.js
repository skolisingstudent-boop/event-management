require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Validation utilities
const validateEvent = (data) => {
  const errors = [];
  
  if (!data.title || typeof data.title !== 'string') {
    errors.push('Title is required and must be a string');
  } else if (data.title.trim().length === 0) {
    errors.push('Title cannot be empty');
  } else if (data.title.length > 255) {
    errors.push('Title must be 255 characters or less');
  }
  
  if (!data.event_date || typeof data.event_date !== 'string') {
    errors.push('Event date is required and must be a valid date');
  } else {
    const date = new Date(data.event_date);
    if (isNaN(date.getTime())) {
      errors.push('Event date must be a valid ISO date string');
    }
  }
  
  if (data.description && typeof data.description !== 'string') {
    errors.push('Description must be a string');
  } else if (data.description && data.description.length > 1000) {
    errors.push('Description must be 1000 characters or less');
  }
  
  if (data.location && typeof data.location !== 'string') {
    errors.push('Location must be a string');
  } else if (data.location && data.location.length > 255) {
    errors.push('Location must be 255 characters or less');
  }
  
  return errors;
};

// Auth Routes

// Register user
app.post('/api/auth/register', async (req, res) => {
  const { username, email, password, confirmPassword } = req.body;

  // Validation
  if (!username || !email || !password || !confirmPassword) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  if (username.length < 3) {
    return res.status(400).json({ error: 'Username must be at least 3 characters' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const stmt = db.prepare('INSERT INTO users (username, email, password) VALUES (?, ?, ?)');
    stmt.run([username, email, hashedPassword], function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(400).json({ error: 'Username or email already exists' });
        }
        console.error(err);
        return res.status(500).json({ error: 'Failed to register user' });
      }

      res.status(201).json({ 
        message: 'User registered successfully', 
        userId: this.lastID,
        username 
      });
    });
    stmt.finalize();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login user
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  db.get('SELECT id, username, password, is_admin FROM users WHERE username = ?', [username], async (err, user) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Login failed' });
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    try {
      const isPasswordValid = await bcrypt.compare(password, user.password);
      
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid username or password' });
      }

      res.json({
        message: 'Login successful',
        userId: user.id,
        username: user.username,
        isAdmin: user.is_admin
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Login failed' });
    }
  });
});

// SQLite Database
const dbPath = path.join(__dirname, 'events.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

// Initialize database schema
function initializeDatabase() {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username VARCHAR(50) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      is_admin BOOLEAN DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('Error creating users table:', err);
    } else {
      console.log('Users table ready');
    }
  });

  db.run(`
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      event_date TIMESTAMP NOT NULL,
      location VARCHAR(255),
      created_by INTEGER,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(created_by) REFERENCES users(id)
    )
  `, (err) => {
    if (err) {
      console.error('Error creating table:', err);
    } else {
      console.log('Events table ready');
    }
  });

  db.run(`CREATE INDEX IF NOT EXISTS idx_event_date ON events(event_date)`, (err) => {
    if (err) console.error('Error creating index:', err);
  });
}

// Routes

// Get all events (with optional search)
app.get('/api/events', (req, res) => {
  const { search } = req.query;
  
  if (search) {
    const searchTerm = `%${search}%`;
    db.all(
      'SELECT * FROM events WHERE title LIKE ? OR description LIKE ? OR location LIKE ? ORDER BY event_date ASC',
      [searchTerm, searchTerm, searchTerm],
      (err, rows) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Failed to fetch events' });
        }
        res.json(rows || []);
      }
    );
  } else {
    db.all('SELECT * FROM events ORDER BY event_date ASC', (err, rows) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to fetch events' });
      }
      res.json(rows || []);
    });
  }
});

// Get upcoming events
app.get('/api/events/upcoming', (req, res) => {
  const now = new Date().toISOString();
  db.all(
    'SELECT * FROM events WHERE event_date >= ? ORDER BY event_date ASC',
    [now],
    (err, rows) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to fetch upcoming events' });
      }
      res.json(rows || []);
    }
  );
});

// Get single event
app.get('/api/events/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM events WHERE id = ?', [id], (err, row) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to fetch event' });
    }
    if (!row) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json(row);
  });
});

// Create new event
app.post('/api/events', (req, res) => {
  const { title, description, event_date, location } = req.body;

  // Validate input
  const errors = validateEvent({ title, description, event_date, location });
  if (errors.length > 0) {
    return res.status(400).json({ error: 'Validation failed', details: errors });
  }

  const stmt = db.prepare(
    'INSERT INTO events (title, description, event_date, location) VALUES (?, ?, ?, ?)'
  );

  stmt.run([title.trim(), description?.trim() || null, event_date, location?.trim() || null], function(err) {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to create event' });
    }
    
    // Fetch the newly created event
    db.get('SELECT * FROM events WHERE id = ?', [this.lastID], (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch created event' });
      }
      res.status(201).json(row);
    });
  });

  stmt.finalize();
});

// Delete event
app.delete('/api/events/:id', (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM events WHERE id = ?', [id], function(err) {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to delete event' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json({ message: 'Event deleted successfully', id });
  });
});

// Update event
app.put('/api/events/:id', (req, res) => {
  const { id } = req.params;
  const { title, description, event_date, location } = req.body;

  // Validate input
  const errors = validateEvent({ title, description, event_date, location });
  if (errors.length > 0) {
    return res.status(400).json({ error: 'Validation failed', details: errors });
  }

  db.run(
    'UPDATE events SET title = ?, description = ?, event_date = ?, location = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [title.trim(), description?.trim() || null, event_date, location?.trim() || null, id],
    function(err) {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to update event' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Event not found' });
      }

      // Fetch updated event
      db.get('SELECT * FROM events WHERE id = ?', [id], (err, row) => {
        if (err) {
          return res.status(500).json({ error: 'Failed to fetch updated event' });
        }
        res.json(row);
      });
    }
  );
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', database: 'SQLite' });
});

// Admin: Get all users
app.get('/api/admin/users', (req, res) => {
  const { adminKey } = req.query;
  
  // Simple admin key check (in production, use proper JWT)
  if (adminKey !== 'admin123') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  db.all('SELECT id, username, email, is_admin, created_at FROM users', (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to fetch users' });
    }
    res.json(rows || []);
  });
});

// Admin: Make user admin
app.post('/api/admin/users/:id/make-admin', (req, res) => {
  const { adminKey } = req.body;
  const { id } = req.params;

  if (adminKey !== 'admin123') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  db.run('UPDATE users SET is_admin = 1 WHERE id = ?', [id], function(err) {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to update user' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: 'User updated to admin' });
  });
});

// Setup: Initialize admin user
app.post('/api/setup/init-admin', async (req, res) => {
  try {
    // Check if admin user already exists
    db.get('SELECT id FROM users WHERE username = ?', ['admin'], async (err, user) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Database error' });
      }

      // If admin already exists, return success
      if (user) {
        return res.json({ message: 'Admin user already exists', success: true });
      }

      // Create admin user
      try {
        const hashedPassword = await bcrypt.hash('12345678', 10);
        const stmt = db.prepare(
          'INSERT INTO users (username, email, password, is_admin) VALUES (?, ?, ?, ?)'
        );
        
        stmt.run(['admin', 'admin@event-management.com', hashedPassword, 1], function(err) {
          if (err) {
            console.error('Error creating admin user:', err);
            return res.status(500).json({ error: 'Failed to create admin user' });
          }
          
          res.json({ 
            message: 'Admin user created successfully',
            username: 'admin',
            password: '12345678',
            success: true
          });
        });
        stmt.finalize();
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create admin user' });
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Setup failed' });
  }
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  
  // Initialize admin user on startup
  setTimeout(() => {
    const http = require('http');
    const initReq = http.request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/setup/init-admin',
      method: 'POST',
      headers: { 'Content-Length': 0 }
    }, (res) => {
      res.on('data', () => {});
      res.on('end', () => {
        console.log('Admin user initialization attempted');
      });
    });
    
    initReq.on('error', (e) => {
      console.log('Could not initialize admin user:', e.message);
    });
    initReq.end();
  }, 100);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  db.close((err) => {
    if (err) console.error(err);
    else console.log('Database connection closed');
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });
});

module.exports = app;
