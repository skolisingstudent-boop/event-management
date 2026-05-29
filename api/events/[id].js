const { query } = require('./lib/db');
const { handleCors } = require('./lib/cors');

module.exports = async (req, res) => {
  if (handleCors(req, res)) return;

  try {
    const { id } = req.query;

    if (req.method === 'GET') {
      const result = await query('SELECT * FROM events WHERE id = $1', [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Event not found' });
      }
      
      return res.status(200).json(result.rows[0]);
    }

    if (req.method === 'PUT') {
      const { title, description, event_date, location } = req.body;

      const result = await query(
        'UPDATE events SET title = $1, description = $2, event_date = $3, location = $4, updated_at = NOW() WHERE id = $5 RETURNING *',
        [title.trim(), description?.trim() || null, event_date, location?.trim() || null, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Event not found' });
      }

      return res.status(200).json(result.rows[0]);
    }

    if (req.method === 'DELETE') {
      const result = await query('DELETE FROM events WHERE id = $1 RETURNING id', [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Event not found' });
      }

      return res.status(200).json({ message: 'Event deleted successfully', id });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to process event' });
  }
};
