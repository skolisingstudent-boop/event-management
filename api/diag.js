const { handleCors } = require('./lib/cors');
const dns = require('dns').promises;
const { Pool } = require('pg');
const url = require('url');

module.exports = async (req, res) => {
  if (handleCors(req, res)) return;

  try {
    const result = {
      environment: {},
      connectivity: {},
      connectionParsing: {},
      poolTest: {}
    };

    // Log environment variables
    result.environment.NODE_ENV = process.env.NODE_ENV;
    result.environment.DATABASE_URL_SET = !!process.env.DATABASE_URL;
    result.environment.DATABASE_URL_LENGTH = process.env.DATABASE_URL?.length || 0;
    
    if (process.env.DATABASE_URL) {
      result.environment.DATABASE_URL_PREVIEW = process.env.DATABASE_URL.substring(0, 100) + '...';
      
      // Parse the connection string
      try {
        const parsed = url.parse(process.env.DATABASE_URL, true);
        result.connectionParsing.protocol = parsed.protocol;
        result.connectionParsing.hostname = parsed.hostname;
        result.connectionParsing.port = parsed.port;
        result.connectionParsing.database = parsed.pathname?.replace(/^\//, '') || 'unknown';
        result.connectionParsing.username = parsed.username;
        result.connectionParsing.password_length = parsed.password?.length || 0;
      } catch (e) {
        result.connectionParsing.error = e.message;
      }
    }

    // Test DNS resolution
    try {
      const addresses = await dns.resolve4('db.cutcatdwiwhhhlojuilq.supabase.co');
      result.connectivity.dns_resolved = addresses;
    } catch (err) {
      result.connectivity.dns_error = err.message;
      result.connectivity.dns_error_code = err.code;
    }

    // Test with explicit pool configuration
    try {
      const testPool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
        idleTimeoutMillis: 5000,
        connectionTimeoutMillis: 5000,
      });
      
      result.poolTest.pool_created = true;
      const client = await testPool.connect();
      result.poolTest.client_created = true;
      
      const poolResult = await client.query('SELECT 1');
      client.release();
      await testPool.end();
      
      result.poolTest.success = true;
      result.poolTest.query_result = poolResult.rows[0];
    } catch (err) {
      result.poolTest.error = err.message;
      result.poolTest.error_code = err.code;
      result.poolTest.error_stack = err.stack?.split('\n').slice(0, 3).join(' ');
    }

    res.status(200).json(result);
  } catch (error) {
    console.error('Diag error:', error);
    res.status(500).json({ error: error.message });
  }
};
