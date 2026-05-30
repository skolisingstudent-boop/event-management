const dns = require('dns').promises;
const net = require('net');
const { Pool } = require('pg');
const { URL } = require('url');

let pool = null;

function isIpLiteral(host) {
  return net.isIP(host) !== 0;
}

async function resolveFallbackHost(host) {
  if (isIpLiteral(host)) {
    return host;
  }

  try {
    const addresses = await dns.resolve6(host);
    if (addresses && addresses.length > 0) {
      return addresses[0];
    }
  } catch (error) {
    // Ignore; IPv6 may not exist or be unavailable.
  }

  try {
    const addresses = await dns.resolve4(host);
    if (addresses && addresses.length > 0) {
      return addresses[0];
    }
  } catch (error) {
    // Ignore; IPv4 may not exist or be unavailable.
  }

  return null;
}

async function getConnectionString() {
  const hostIp = process.env.DB_HOST_IP;
  const hostName = process.env.DB_HOST;
  const user = process.env.DB_USER || 'postgres';
  const password = process.env.DB_PASSWORD;
  const port = process.env.DB_PORT || '6543';
  const database = process.env.DB_NAME || 'postgres';

  if (hostIp) {
    if (!password) {
      throw new Error('Missing DB_PASSWORD environment variable');
    }

    let host = hostIp;
    if (host.includes(':') && !host.startsWith('[') && !host.endsWith(']')) {
      host = `[${host}]`;
    }

    return `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}/${database}`;
  }

  if (process.env.DATABASE_URL) {
    const parsedUrl = new URL(process.env.DATABASE_URL);

    if (!isIpLiteral(parsedUrl.hostname)) {
      const fallbackHost = await resolveFallbackHost(parsedUrl.hostname);
      if (fallbackHost) {
        parsedUrl.hostname = fallbackHost;
      }
    }

    return parsedUrl.toString();
  }

  const host = hostName;

  if (!host) {
    throw new Error('Missing DATABASE_URL and DB_HOST/DB_HOST_IP environment variables');
  }

  if (!password) {
    throw new Error('Missing DB_PASSWORD environment variable');
  }

  let effectiveHost = host;
  if (effectiveHost.includes(':') && !effectiveHost.startsWith('[') && !effectiveHost.endsWith(']')) {
    effectiveHost = `[${effectiveHost}]`;
  }

  return `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${effectiveHost}:${port}/${database}`;
}

async function getPool() {
  if (!pool) {
    const connectionString = await getConnectionString();
    let connectionInfo = {};

    try {
      const parsed = new URL(connectionString);
      connectionInfo = {
        host: parsed.hostname,
        port: parsed.port,
        database: parsed.pathname.replace(/\//g, ''),
        user: parsed.username,
        sslMode: process.env.DB_SSL_MODE || 'default',
      };
    } catch (err) {
      connectionInfo.error = err.message;
    }

    console.log('Creating new DB connection pool...', connectionInfo);

    pool = new Pool({
      connectionString,
      ssl: process.env.DB_SSL_MODE === 'disable' ? false : process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });
  }
  return pool;
}

async function query(text, params) {
  const client = await (await getPool()).connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
}

module.exports = { query, getPool };
