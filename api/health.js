const { handleCors } = require('./lib/cors');
const { query } = require('./lib/db');

module.exports = async (req, res) => {
  if (handleCors(req, res)) return;

  try {
    // Actually test the database connection
    await query('SELECT 1');
    res.status(200).json({ status: 'OK', database: 'PostgreSQL', timestamp: new Date() });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({ 
      status: 'ERROR', 
      error: error.message,
      database: 'PostgreSQL (connection failed)'
    });
  }
};
