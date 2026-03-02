import pkg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pkg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function check() {
    try {
        const idToDelete = 'prog-1772414675789';
        const res = await pool.query('DELETE FROM programacion WHERE id = $1', [idToDelete]);
        console.log(`Deleted rows: ${res.rowCount}`);
    } catch (err) {
        console.error("DB Error:", err);
    } finally {
        pool.end();
    }
}
check();
