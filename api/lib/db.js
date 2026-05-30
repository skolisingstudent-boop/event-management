const { Pool } = require('pg');
const { URL } = require('url');

let pool = null;

function getConnectionString() {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  const host = process.env.DB_HOST;
  const port = process.env.DB_PORT || '6543';
  const user = process.env.DB_USER || 'postgres';
  const password = process.env.DB_PASSWORD;
  const database = process.env.DB_NAME || 'postgres';

  if (!host) {
    throw new Error('Missing DATABASE_URL and DB_HOST environment variables');
  }

  if (!password) {
    throw new Error('Missing DB_PASSWORD environment variable');
  }

  return `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}/${database}`;
}

function getPool() {
  if (!pool) {
    const connectionString = getConnectionString();
    let connectionInfo = {};

    try {
      const parsed = new URL(connectionString);
      connectionInfo = {
        host: parsed.hostname,
        port: parsed.port,
        database: parsed.pathname.replace(/\//g, ''),
        user: parsed.username,
      };
    } catch (err) {
      connectionInfo.error = err.message;
    }

    console.log('Creating new DB connection pool...', connectionInfo);

    pool = new Pool({
      connectionString,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });
  }
  return pool;
}

async function query(text, params) {
  const client = await getPool().connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
}

module.exports = { query, getPool };
