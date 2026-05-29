const bcrypt = require('bcrypt');
const { query } = require('../lib/db');
const { handleCors } = require('../lib/cors');

module.exports = async (req, res) => {
  if (handleCors(req, res)) return;

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check if admin already exists
    const checkAdmin = await query(
      'SELECT id FROM users WHERE username = $1',
      ['admin']
    );

    if (checkAdmin.rows.length > 0) {
      return res.status(200).json({
        status: 'SUCCESS',
        message: 'Admin user already exists',
        user: { username: 'admin' }
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash('12345678', 10);

    // Create admin user
    const result = await query(
      `INSERT INTO users (username, email, password, is_admin, created_at) 
       VALUES ($1, $2, $3, $4, NOW()) 
       RETURNING id, username, email, is_admin`,
      ['admin', 'admin@eventmanagement.local', hashedPassword, true]
    );

    res.status(201).json({
      status: 'SUCCESS',
      message: 'Admin user created successfully',
      user: {
        id: result.rows[0].id,
        username: result.rows[0].username,
        email: result.rows[0].email,
        isAdmin: result.rows[0].is_admin
      }
    });
  } catch (err) {
    console.error('Setup error:', err);
    res.status(500).json({
      status: 'ERROR',
      error: err.message
    });
  }
};
