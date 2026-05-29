const bcrypt = require('bcrypt');
const { query } = require('./lib/db');
const { handleCors } = require('./lib/cors');

module.exports = async (req, res) => {
  if (handleCors(req, res)) return;

  try {
    if (req.method === 'POST') {
      const { username, email, password, confirmPassword } = req.body;

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

      const hashedPassword = await bcrypt.hash(password, 10);
      
      try {
        const result = await query(
          'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username',
          [username, email, hashedPassword]
        );

        return res.status(201).json({
          message: 'User registered successfully',
          userId: result.rows[0].id,
          username: result.rows[0].username
        });
      } catch (error) {
        if (error.message.includes('duplicate key')) {
          return res.status(400).json({ error: 'Username or email already exists' });
        }
        throw error;
      }
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Registration failed' });
  }
};
