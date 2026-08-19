import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DATABASE_HOST || 'localhost',
  user: process.env.DATABASE_USER || 'root',
  password: process.env.DATABASE_PASSWORD || '',
  database: process.env.DATABASE_NAME || 'cvl_psicologia',
  port: parseInt(process.env.DATABASE_PORT || '3306'),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

let migrationRan = false;

async function runMigrations() {
  if (migrationRan) return;
  migrationRan = true;

  try {
    const conn = await pool.getConnection();

    const hash = '$2b$10$QZu0CKM060Sk.iZP1hiVOex/wgPC1PbPt5i.u0lrwmSpjlufe67jy';

    const users = [
      { email: 'admin@vivirlibre.org', nombre: 'Gabriela', apellido: 'Torres', rol: 'admin' },
      { email: 'supervisora@vivirlibre.org', nombre: 'Gabriela', apellido: 'Torres de Moroso', rol: 'supervisor' },
      { email: 'carmen.ruiz@clinica.com', nombre: 'Carmen', apellido: 'Ruiz', rol: 'lider' },
    ];

    for (const u of users) {
      const [existing] = await conn.query('SELECT id FROM usuarios WHERE email = ?', [u.email]) as any[];
      if (existing.length === 0) {
        await conn.query(
          'INSERT INTO usuarios (email, password_hash, nombre, apellido, telefono, rol, activo) VALUES (?, ?, ?, ?, ?, ?, TRUE)',
          [u.email, hash, u.nombre, u.apellido, '5554180137', u.rol]
        );
      } else {
        await conn.query('UPDATE usuarios SET password_hash = ?, activo = TRUE WHERE email = ?', [hash, u.email]);
      }
    }

    // Passwords are set by seed.sql — don't overwrite them
    conn.release();
    console.log('Migracion de passwords completada');
  } catch (e: any) {
    console.log('Migration skip:', e.message);
  }
}

pool.getConnection().then(conn => {
  conn.release();
  runMigrations();
}).catch(() => {});

export default pool;
