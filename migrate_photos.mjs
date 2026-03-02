import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();
const { Pool } = pkg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function migrate() {
    try {
        console.log(">>> Iniciando migración de fotos de maestros...");

        // Agregar columna foto_url si no existe
        await pool.query(`
            ALTER TABLE maestros 
            ADD COLUMN IF NOT EXISTS foto_url TEXT
        `);

        console.log(">>> Columna 'foto_url' agregada a la tabla 'maestros'.");
        console.log(">>> Migración completada con éxito.");
    } catch (err) {
        console.error("!!! ERROR DURANTE LA MIGRACION:", err.message);
    } finally {
        await pool.end();
    }
}

migrate();
