const { query } = require('./lib/db');
const { validateEvent } = require('./lib/validation');
const { handleCors } = require('./lib/cors');

module.exports = async (req, res) => {
  if (handleCors(req, res)) return;

  try {
    if (req.method === 'GET') {
      const { search } = req.query;
      
      if (search) {
        const searchTerm = `%${search}%`;
        const result = await query(
          'SELECT * FROM events WHERE title ILIKE $1 OR description ILIKE $2 OR location ILIKE $3 ORDER BY event_date ASC',
          [searchTerm, searchTerm, searchTerm]
        );
        return res.status(200).json(result.rows || []);
      }
      
      const result = await query('SELECT * FROM events ORDER BY event_date ASC');
      return res.status(200).json(result.rows || []);
    }

    if (req.method === 'POST') {
      const { title, description, event_date, location } = req.body;

      const errors = validateEvent({ title, description, event_date, location });
      if (errors.length > 0) {
        return res.status(400).json({ error: 'Validation failed', details: errors });
      }

      const result = await query(
        'INSERT INTO events (title, description, event_date, location) VALUES ($1, $2, $3, $4) RETURNING *',
        [title.trim(), description?.trim() || null, event_date, location?.trim() || null]
      );

      return res.status(201).json(result.rows[0]);
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to process events' });
  }
};
