const { handleCors } = require('./lib/cors');
const dns = require('dns').promises;
const { Pool } = require('pg');

module.exports = async (req, res) => {
  if (handleCors(req, res)) return;

  try {
    const result = {
      environment: {},
      connectivity: {},
      poolTest: {}
    };

    // Log environment variables
    result.environment.NODE_ENV = process.env.NODE_ENV;
    result.environment.DATABASE_URL_SET = !!process.env.DATABASE_URL;
    result.environment.DATABASE_URL_LENGTH = process.env.DATABASE_URL?.length || 0;
    // Log first 50 chars to see format
    if (process.env.DATABASE_URL) {
      result.environment.DATABASE_URL_PREVIEW = process.env.DATABASE_URL.substring(0, 100) + '...';
    }

    // Test DNS resolution
    try {
      const addresses = await dns.resolve4('db.cutcatdwiwhhhlojuilq.supabase.co');
      result.connectivity.dns_resolved = addresses;
    } catch (err) {
      result.connectivity.dns_error = err.message;
    }

    // Test pool creation
    try {
      const testPool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      });
      
      const client = await testPool.connect();
      const poolResult = await client.query('SELECT 1');
      client.release();
      await testPool.end();
      
      result.poolTest.success = true;
      result.poolTest.query_result = poolResult.rows[0];
    } catch (err) {
      result.poolTest.error = err.message;
      result.poolTest.error_code = err.code;
    }

    res.status(200).json(result);
  } catch (error) {
    console.error('Diag error:', error);
    res.status(500).json({ error: error.message });
  }
};
