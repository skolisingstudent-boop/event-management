const { handleCors } = require('./lib/cors');

module.exports = async (req, res) => {
  if (handleCors(req, res)) return;

  try {
    res.status(200).json({ status: 'OK', database: 'PostgreSQL' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Health check failed' });
  }
};
