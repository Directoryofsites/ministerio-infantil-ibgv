import pkg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pkg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function test() {
    try {
        await pool.query(
            `INSERT INTO programacion 
      (id, fecha, leccion_titulo, leccion_pasaje, leccion_enfasis, leccion_teologia, maestro_3_7, maestro_8_11, maestro_adolescentes) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [
                'test-id', '2026-03-01',
                'Prueba', '', '', '',
                null, null, null
            ]
        );
        console.log("Insert successful!");
    } catch (err) {
        console.error("DB Error:", err);
    } finally {
        pool.end();
    }
}
test();
