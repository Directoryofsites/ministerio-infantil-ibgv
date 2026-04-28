import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pkg;
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const cleanup = async () => {
    try {
        console.log(">>> Iniciando limpieza de base de datos...");

        // Eliminar registros con IDs de prueba conocidos
        const result = await pool.query("DELETE FROM programacion WHERE id = 'test-id' OR id LIKE 'prog-%'");

        console.log(`>>> Se eliminaron ${result.rowCount} registros inválidos.`);
        console.log(">>> Limpieza completada con éxito.");
    } catch (err) {
        console.error("!!! Error durante la limpieza:", err);
    } finally {
        await pool.end();
    }
};

cleanup();
