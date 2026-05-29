const { query } = require('../lib/db');
const { handleCors } = require('../lib/cors');

module.exports = async (req, res) => {
  if (handleCors(req, res)) return;

  try {
    if (req.method === 'GET') {
      const now = new Date().toISOString();
      const result = await query(
        'SELECT * FROM events WHERE event_date >= $1 ORDER BY event_date ASC',
        [now]
      );
      
      return res.status(200).json(result.rows || []);
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch upcoming events' });
  }
};
