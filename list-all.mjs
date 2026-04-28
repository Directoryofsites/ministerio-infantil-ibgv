import pkg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pkg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function listAll() {
    try {
        const res = await pool.query('SELECT id, length(id) as len, fecha, leccion_titulo FROM programacion');
        console.log(">>> CLASES EN DB:");
        res.rows.forEach(row => {
            console.log(`ID: [${row.id}] (len: ${row.len}) | Fecha: ${row.fecha} | Título: ${row.leccion_titulo}`);
        });
    } catch (err) {
        console.error("DB Error:", err);
    } finally {
        pool.end();
    }
}
listAll();
