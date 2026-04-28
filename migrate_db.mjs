import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();
const { Pool } = pkg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function migrate() {
    try {
        console.log(">>> Iniciando migración de base de datos...");

        // 1. Quitar la restricción de llave foránea si existe
        // En PostgreSQL, necesitamos encontrar el nombre de la restricción
        const constraintRes = await pool.query(`
            SELECT conname 
            FROM pg_constraint 
            WHERE conrelid = 'maestros'::regclass 
            AND contype = 'f' 
            AND confrelid = 'grupos_edad'::regclass;
        `);

        if (constraintRes.rowCount > 0) {
            const constraintName = constraintRes.rows[0].conname;
            console.log(`>>> Eliminando restricción: ${constraintName}`);
            await pool.query(`ALTER TABLE maestros DROP CONSTRAINT ${constraintName}`);
        } else {
            console.log(">>> No se encontró restricción de llave foránea para especialidad.");
        }

        // 2. Cambiar el tipo de columna a TEXT si no lo es
        // (Aunque ya lo intentamos en server.js, asegurémonos aquí)
        await pool.query(`ALTER TABLE maestros ALTER COLUMN especialidad TYPE TEXT`);
        console.log(">>> Tipo de columna 'especialidad' actualizado a TEXT.");

        console.log(">>> Migración completada con éxito.");
    } catch (err) {
        console.error("!!! ERROR DURANTE LA MIGRACION:", err.message);
    } finally {
        await pool.end();
    }
}

migrate();
