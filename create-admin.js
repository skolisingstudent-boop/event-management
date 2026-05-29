const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:Shayne_2020..@db.cutcatdwiwhhhlojuilq.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function createAdmin() {
  try {
    const result = await pool.query(
      `INSERT INTO users (username, email, password, is_admin, created_at)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING id, username, is_admin`,
      [
        'admin',
        'admin@eventmanagement.local',
        '$2b$10$KlcXJWPm8uUW5YHVrFQSweKcGBQKEqAX3SLM0D.mZyCFKLlHqQh.m',
        true
      ]
    );
    console.log('✅ Admin user created successfully!');
    console.log('User:', result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      console.log('⚠️  Admin user already exists');
    } else {
      console.error('❌ Error:', err.message);
    }
  } finally {
    await pool.end();
  }
}

createAdmin();
