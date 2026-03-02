import dotenv from 'dotenv';
import pkg from 'pg';
const { Pool } = pkg;

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        const prog = await pool.query('SELECT id, fecha, leccion_titulo FROM programacion');
        console.log('PROGRAMACION:', prog.rows);
        const asi = await pool.query('SELECT * FROM asistencia');
        console.log('ASISTENCIA:', asi.rows);
    } catch (e) {
        console.error(e);
    } finally {
        pool.end();
    }
}
run();
