const { handleCors } = require('./lib/cors');
const db = require('./lib/db');
const dns = require('dns').promises;
const { Pool } = require('pg');
const net = require('net');
const url = require('url');

const SUPABASE_HOST = 'db.cutcatdwiwhhhlojuilq.supabase.co';

async function resolveWithCustomResolver(host) {
  const resolver = new dns.Resolver({
    servers: ['8.8.8.8', '1.1.1.1']
  });
  return resolver.resolve4(host);
}

function connectTest(host, port) {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host, port, timeout: 5000 }, () => {
      socket.destroy();
      resolve({ ok: true });
    });

    socket.on('error', (err) => {
      resolve({ ok: false, error: err.message, code: err.code });
    });

    socket.on('timeout', () => {
      socket.destroy();
      resolve({ ok: false, error: 'timeout' });
    });
  });
}

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
    result.environment.DB_HOST = process.env.DB_HOST || null;
    result.environment.DB_HOST_IP = process.env.DB_HOST_IP || null;
    result.environment.DB_HOST_IP_CONFIGURED = !!process.env.DB_HOST_IP;
    result.environment.DB_PORT = process.env.DB_PORT || '6543';
    result.environment.DB_SSL_MODE = process.env.DB_SSL_MODE || 'default';

    if (process.env.DATABASE_URL) {
      result.environment.DATABASE_URL_PREVIEW = process.env.DATABASE_URL.substring(0, 100) + '...';
      
      // Parse the original connection string
      try {
        const parsed = url.parse(process.env.DATABASE_URL, true);
        result.connectionParsing = {
          protocol: parsed.protocol,
          hostname: parsed.hostname,
          port: parsed.port,
          database: parsed.pathname?.replace(/^\//, '') || 'unknown',
          username: parsed.auth?.split(':')[0] || parsed.username,
          password_length: parsed.auth?.split(':')[1]?.length || parsed.password?.length || 0,
        };
      } catch (e) {
        result.connectionParsing.error = e.message;
      }
    }

    try {
      const activeConnection = await db.getConnectionString();
      const parsedActive = new url.URL(activeConnection);
      result.environment.ACTIVE_DB_HOST = parsedActive.hostname;
      result.environment.ACTIVE_DB_PORT = parsedActive.port;
      result.environment.ACTIVE_DB_NAME = parsedActive.pathname?.replace(/^\//, '') || null;
      result.environment.ACTIVE_DB_USER = parsedActive.username;
      result.environment.ACTIVE_DB_URL_PREVIEW = activeConnection.replace(/(postgresql:\/\/[^:]+:)[^@]+(@)/, '$1***$2');
    } catch (err) {
      result.environment.ACTIVE_DB_URL_ERROR = err.message;
    }

    // DNS checks for the Supabase hostname
    try {
      result.connectivity.resolve4 = await dns.resolve4(SUPABASE_HOST);
    } catch (err) {
      result.connectivity.resolve4_error = err.message;
      result.connectivity.resolve4_error_code = err.code;
    }

    try {
      result.connectivity.lookup = await dns.lookup(SUPABASE_HOST, { all: true });
    } catch (err) {
      result.connectivity.lookup_error = err.message;
      result.connectivity.lookup_error_code = err.code;
    }

    try {
      result.connectivity.resolver_8_8_8_8 = await resolveWithCustomResolver(SUPABASE_HOST);
    } catch (err) {
      result.connectivity.resolver_8_8_8_8_error = err.message;
      result.connectivity.resolver_8_8_8_8_error_code = err.code;
    }

    // Direct TCP host/IP connectivity tests
    const port = Number(process.env.DB_PORT || 6543);
    result.connectivity.connect_host = await connectTest(SUPABASE_HOST, port);
    if (process.env.DB_HOST_IP) {
      result.connectivity.connect_host_ip = await connectTest(process.env.DB_HOST_IP, port);
    }

    // Attempt database query using configured DATABASE_URL
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
